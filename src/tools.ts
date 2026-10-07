// Shared MCP tool registration used by BOTH servers:
//   - the stdio server (src/index.ts, npm @aituber/mcp-server)
//   - the Cloudflare Worker (src/remote.ts, https://mcp.aituber.app)
//
// Each entry point keeps its own HTTP client and passes it in as a
// ToolTransport. Everything else (tool names, schemas, annotations, catalog
// checks, response formatting) lives here once. Keep this file free of
// process/env access and node-only imports.

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  buildSearchResponse,
  ENDPOINTS,
  listAllEndpoints,
  needsAccountState,
  paywallGuidance,
  type AccountState,
} from "./catalog";
import type { GeneratedParam } from "./endpoints.generated";
import {
  GENERATED_TOOLS,
  type GeneratedSpend,
  type GeneratedTool,
} from "./tools.generated";

// ---------------------------------------------------------------------------
// Transport contract
// ---------------------------------------------------------------------------

export const REQUEST_TIMEOUT_MS = 30_000;
const MAX_RESPONSE_LENGTH = 50_000;

export interface ApiResponse {
  status: number;
  statusText: string;
  body: string;
}

export interface ApiRequestOptions {
  query?: Record<string, string>;
  body?: unknown;
  pathParams?: Record<string, string>;
}

export interface ToolTransport {
  /** Send one request to the AITuber public API with the caller's credential. */
  request(
    method: string,
    path: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse>;
  /** Live plan and balance, used only to choose the paywall guidance. */
  accountState(): Promise<AccountState | undefined>;
}

// ---------------------------------------------------------------------------
// Tool definitions (pure, testable without a server or a network)
// ---------------------------------------------------------------------------

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ToolAnnotationSet {
  readOnlyHint: boolean;
  destructiveHint: boolean;
  openWorldHint: false;
}

export interface ToolDefinition {
  name: string;
  title: string;
  description: string;
  annotations: ToolAnnotationSet;
  /** HTTP methods the tool can send. Empty for search_api. */
  methods: HttpMethod[];
  /** Set for named tools built from GENERATED_TOOLS. */
  spend?: GeneratedSpend;
  deprecated?: boolean;
}

const READ_ONLY: ToolAnnotationSet = {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: false,
};

const WRITE: ToolAnnotationSet = {
  readOnlyHint: false,
  destructiveHint: false,
  openWorldHint: false,
};

const DESTRUCTIVE: ToolAnnotationSet = {
  readOnlyHint: false,
  destructiveHint: true,
  openWorldHint: false,
};

/**
 * Annotations for a named tool. `spend: "free"` means "costs no credits", not
 * "changes nothing", so the method decides: GET is read-only, DELETE (or a
 * spend of "deletes") is destructive, everything else is a plain write.
 */
export function annotationsForTool(
  method: string,
  spend: GeneratedSpend
): ToolAnnotationSet {
  const upper = method.toUpperCase();
  if (upper === "DELETE" || spend === "deletes") return DESTRUCTIVE;
  if (upper === "GET") return READ_ONLY;
  return WRITE;
}

const SEARCH_API: ToolDefinition = {
  name: "search_api",
  title: "Search the AITuber API",
  description:
    "Search the AITuber API to find endpoints for creating AI videos, checking credits, exporting to MP4, publishing to social media, and more. Returns matching endpoints with parameters and examples. Use this before api_read, api_write, or api_delete to find the right endpoint.",
  annotations: READ_ONLY,
  methods: [],
};

const API_READ: ToolDefinition = {
  name: "api_read",
  title: "Read from the AITuber API",
  description:
    "Send a GET request to an AITuber API endpoint found with search_api. Use it to list or fetch videos, voices, styles, channels, music, clips, and the subscription. Reads nothing outside the catalog and changes nothing.",
  annotations: READ_ONLY,
  methods: ["GET"],
};

const API_WRITE: ToolDefinition = {
  name: "api_write",
  title: "Write to the AITuber API",
  description:
    "Send a POST, PUT, or PATCH request to an AITuber API endpoint found with search_api. Use it to create, start, or update things that have no named tool: clips, UGC videos, elements, uploads, ideas, scripts, songs. Some endpoints spend credits.",
  annotations: WRITE,
  methods: ["POST", "PUT", "PATCH"],
};

const API_DELETE: ToolDefinition = {
  name: "api_delete",
  title: "Delete through the AITuber API",
  description:
    "Send a DELETE request to an AITuber API endpoint found with search_api, for example to delete a video or cancel a scheduled publication. The change cannot be undone.",
  annotations: DESTRUCTIVE,
  methods: ["DELETE"],
};

const EXECUTE_API: ToolDefinition = {
  name: "execute_api",
  title: "Execute an AITuber API request",
  description:
    "Deprecated: use api_read, api_write, or api_delete. Sends one request to the AITuber API (https://aituber.app/api) at an endpoint found with search_api.",
  annotations: DESTRUCTIVE,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  deprecated: true,
};

function namedToolDefinition(tool: GeneratedTool): ToolDefinition {
  return {
    name: tool.name,
    title: tool.title,
    description: tool.description,
    annotations: annotationsForTool(tool.method, tool.spend),
    methods: [tool.method as HttpMethod],
    spend: tool.spend,
  };
}

/**
 * Every tool both servers register, in registration order: the named tools
 * (alphabetical, as generated), then search and the generic tools.
 */
export function buildToolDefinitions(): ToolDefinition[] {
  return [
    ...GENERATED_TOOLS.map(namedToolDefinition),
    SEARCH_API,
    API_READ,
    API_WRITE,
    API_DELETE,
    EXECUTE_API,
  ];
}

// ---------------------------------------------------------------------------
// Catalog check
// ---------------------------------------------------------------------------

function templateToRegExp(template: string): RegExp {
  const escaped = template
    .split(/\{[^}]+\}/)
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("[^/]+");
  return new RegExp(`^${escaped}/?$`);
}

/**
 * True when method + path name an endpoint in the catalog. The path may be the
 * template ("/videos/{id}") or an already substituted path ("/videos/abc").
 * A "." or ".." segment never matches: the transports normalise the URL, so a
 * path that resolves elsewhere must not pass as a catalog endpoint.
 */
export function isCatalogEndpoint(method: string, path: string): boolean {
  const upper = method.toUpperCase();
  const clean = path.split("?")[0];
  if (clean.split("/").some((segment) => segment === "." || segment === "..")) {
    return false;
  }
  return ENDPOINTS.some(
    (ep) =>
      ep.method === upper &&
      (ep.path === clean || templateToRegExp(ep.path).test(clean))
  );
}

function notInCatalogResult(method: string, path: string) {
  return {
    content: [
      {
        type: "text" as const,
        text: `${method} ${path} is not an AITuber API endpoint. Call search_api with what you want to do to find the endpoint and its parameters, or use one of the named tools.`,
      },
    ],
    isError: true,
  };
}

// ---------------------------------------------------------------------------
// Shared response formatting
// ---------------------------------------------------------------------------

type ToolResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

function prettyBody(raw: string): string {
  let formatted = raw;
  try {
    formatted = JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    // Not JSON, use raw body
  }
  // Truncate very large responses to avoid overwhelming the LLM context
  if (formatted.length > MAX_RESPONSE_LENGTH) {
    formatted =
      formatted.substring(0, MAX_RESPONSE_LENGTH) +
      "\n\n... (response truncated. Use query filters to narrow results)";
  }
  return formatted;
}

/**
 * Run one API call and turn it into a tool result. A paywall is the one error
 * the agent can explain to the user, so the result carries the facts and the
 * plans page link (store-safe wording, see catalog.ts).
 */
async function callApi(
  transport: ToolTransport,
  method: string,
  path: string,
  options: ApiRequestOptions,
  toolName?: string
): Promise<ToolResult> {
  try {
    const result = await transport.request(method, path, options);
    const formattedBody = prettyBody(
      result.status < 400 && toolName ? trimBody(toolName, result.body) : result.body
    );
    const account = needsAccountState(result.status)
      ? await transport.accountState()
      : undefined;
    const guidance = paywallGuidance(result.status, result.body, account);

    return {
      content: [
        {
          type: "text" as const,
          text: `${result.status} ${result.statusText}\n\n${formattedBody}${
            guidance ? `\n\n---\n\n${guidance}` : ""
          }`,
        },
      ],
      isError: result.status >= 400,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isTimeout = message.includes("abort") || message.includes("timeout");

    return {
      content: [
        {
          type: "text" as const,
          text: isTimeout
            ? `Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s. The API may be under heavy load. Try again.`
            : `Request failed: ${message}`,
        },
      ],
      isError: true,
    };
  }
}

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

const pathField = z
  .string()
  .describe(
    "API endpoint path from search_api, e.g. /videos, /videos/generate, /voices, /subscription"
  );

// Models send numbers and booleans here ("limit": 10). Accept them and send
// them as strings, which is what a query string is anyway.
const queryValue = z.union([z.string(), z.number(), z.boolean()]);

const queryField = z
  .record(z.string(), queryValue)
  .optional()
  .describe(
    'Query parameters as key-value pairs, e.g. { "limit": 10, "gender": "female" }'
  );

function stringifyQuery(
  query: Record<string, string | number | boolean> | undefined
): Record<string, string> | undefined {
  if (!query) return undefined;
  return Object.fromEntries(
    Object.entries(query).map(([key, value]) => [key, String(value)])
  );
}

const bodyField = z
  .record(z.string(), z.unknown())
  .optional()
  .describe(
    'Request body, e.g. { "script": "...", "mediaType": "images" }'
  );

const pathParamsField = z
  .record(z.string(), z.string())
  .optional()
  .describe(
    'Path parameter substitutions, e.g. { "id": "abc-123" } for /videos/{id}'
  );

/** A top-level param is one key of the tool input. Nested fields ("a.b", "a[].b") describe their parent. */
function isTopLevel(param: GeneratedParam): boolean {
  return !param.name.includes(".") && !param.name.includes("[]");
}

function childFields(parent: GeneratedParam, params: GeneratedParam[]): string[] {
  const prefixes = [`${parent.name}.`, `${parent.name}[].`];
  return params
    .filter((p) => prefixes.some((prefix) => p.name.startsWith(prefix)))
    .map((p) => {
      const short = p.name.slice(
        prefixes.find((prefix) => p.name.startsWith(prefix))!.length
      );
      const note = p.description ? `: ${p.description}` : "";
      return `${short} (${p.type}${p.required ? ", required" : ""})${note}`;
    });
}

function zodForType(type: string): z.ZodType {
  const lower = type.toLowerCase();
  // A union such as `integer | "auto"` must accept both sides. The API
  // validates the exact shape; the tool only has to let the value through.
  if (lower.includes("|")) return z.union([z.string(), z.number(), z.boolean()]);
  if (lower.startsWith("array")) return z.array(z.unknown());
  if (lower.startsWith("object")) return z.record(z.string(), z.unknown());
  if (lower.startsWith("number") || lower.startsWith("integer")) {
    return z.number();
  }
  if (lower.startsWith("boolean")) return z.boolean();
  if (
    lower.startsWith("string") ||
    lower.startsWith("datetime") ||
    lower.startsWith("`")
  ) {
    return z.string();
  }
  return z.unknown();
}

/** Build the zod input shape for a named tool from its generated params. */
export function inputShapeForTool(tool: GeneratedTool): Record<string, z.ZodType> {
  const shape: Record<string, z.ZodType> = {};
  for (const param of tool.params) {
    if (!isTopLevel(param)) continue;

    // Path and query values travel as strings. Body values keep their type.
    let schema =
      param.in === "body" ? zodForType(param.type) : z.string();

    const children = childFields(param, tool.params);
    const description = [
      param.description || `${param.name} (${param.type})`,
      children.length ? `Fields:\n- ${children.join("\n- ")}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    schema = schema.describe(description);

    const required = param.in === "path" || param.required === true;
    shape[param.name] = required ? schema : schema.optional();
  }
  return shape;
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

function splitNamedArgs(
  tool: GeneratedTool,
  args: Record<string, unknown>
): ApiRequestOptions {
  const pathParams: Record<string, string> = {};
  const query: Record<string, string> = {};
  const body: Record<string, unknown> = {};

  for (const param of tool.params) {
    if (!isTopLevel(param)) continue;
    const value = args[param.name];
    if (value === undefined) continue;
    if (param.in === "path") pathParams[param.name] = String(value);
    else if (param.in === "query") query[param.name] = String(value);
    else body[param.name] = value;
  }

  return {
    pathParams,
    query,
    body: Object.keys(body).length > 0 ? body : undefined,
  };
}

/**
 * Named tools that return a trimmed record. A status poll repeats every few
 * seconds, and GET /videos/{id} carries the whole scene payload (word timings,
 * per-scene prompts, caption config), tens of kilobytes the agent never needs
 * to answer "is it done". The full record stays one api_read call away.
 */
const RESPONSE_TRIM: Record<string, (body: unknown) => unknown> = {
  get_video: (body) => {
    if (!body || typeof body !== "object" || Array.isArray(body)) return body;
    const { data, ...rest } = body as Record<string, unknown>;
    const scenes = (data as { images?: unknown[] } | undefined)?.images;
    return {
      ...rest,
      sceneCount: Array.isArray(scenes) ? scenes.length : undefined,
      note: "Scene data omitted. For the full record call api_read GET /videos/{id}.",
    };
  },
};

function trimBody(toolName: string, raw: string): string {
  const trim = RESPONSE_TRIM[toolName];
  if (!trim) return raw;
  try {
    return JSON.stringify(trim(JSON.parse(raw)));
  } catch {
    return raw;
  }
}

/** Register every tool on the server. Call once per McpServer instance. */
export function registerTools(server: McpServer, transport: ToolTransport): void {
  // Named tools: one per generated entry, thin wrappers over the same endpoint
  // api_write or api_read would call.
  for (const tool of GENERATED_TOOLS) {
    const definition = namedToolDefinition(tool);
    server.registerTool(
      tool.name,
      {
        title: definition.title,
        description: definition.description,
        inputSchema: inputShapeForTool(tool),
        annotations: definition.annotations,
      },
      async (args) =>
        callApi(
          transport,
          tool.method,
          tool.path,
          splitNamedArgs(tool, args as Record<string, unknown>),
          tool.name
        )
    );
  }

  server.registerTool(
    SEARCH_API.name,
    {
      title: SEARCH_API.title,
      description: SEARCH_API.description,
      inputSchema: {
        query: z
          .string()
          .describe(
            'What you want to do, e.g. "create a video", "list voices", "check credits", "download mp4", "publish to tiktok"'
          ),
      },
      annotations: SEARCH_API.annotations,
    },
    async ({ query }) => {
      const text = buildSearchResponse(query);
      if (!text) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No endpoints matched "${query}". Here are all available endpoints:\n\n${listAllEndpoints()}\n\nTry searching with different terms.`,
            },
          ],
        };
      }
      return { content: [{ type: "text" as const, text }] };
    }
  );

  server.registerTool(
    API_READ.name,
    {
      title: API_READ.title,
      description: API_READ.description,
      inputSchema: {
        path: pathField,
        query: queryField,
        pathParams: pathParamsField,
      },
      annotations: API_READ.annotations,
    },
    async ({ path, query, pathParams }) => {
      if (!isCatalogEndpoint("GET", path)) {
        return notInCatalogResult("GET", path);
      }
      return callApi(transport, "GET", path, { query: stringifyQuery(query), pathParams });
    }
  );

  server.registerTool(
    API_WRITE.name,
    {
      title: API_WRITE.title,
      description: API_WRITE.description,
      inputSchema: {
        method: z
          .enum(["POST", "PUT", "PATCH"])
          .describe("HTTP method, as listed by search_api for the endpoint"),
        path: pathField,
        body: bodyField,
        query: queryField,
        pathParams: pathParamsField,
      },
      annotations: API_WRITE.annotations,
    },
    async ({ method, path, body, query, pathParams }) => {
      if (!isCatalogEndpoint(method, path)) {
        return notInCatalogResult(method, path);
      }
      return callApi(transport, method, path, { body, query: stringifyQuery(query), pathParams });
    }
  );

  server.registerTool(
    API_DELETE.name,
    {
      title: API_DELETE.title,
      description: API_DELETE.description,
      inputSchema: {
        path: pathField,
        pathParams: pathParamsField,
      },
      annotations: API_DELETE.annotations,
    },
    async ({ path, pathParams }) => {
      if (!isCatalogEndpoint("DELETE", path)) {
        return notInCatalogResult("DELETE", path);
      }
      return callApi(transport, "DELETE", path, { pathParams });
    }
  );

  // Deprecated alias. Same schema as before so open sessions and saved scripts
  // keep working. One change: it is limited to the catalog like the other
  // generic tools, so a hidden endpoint stays hidden through the alias too.
  // Remove when PostHog shows near-zero calls, and before any store submission.
  server.registerTool(
    EXECUTE_API.name,
    {
      title: EXECUTE_API.title,
      description: EXECUTE_API.description,
      inputSchema: {
        method: z
          .enum(["GET", "POST", "PUT", "PATCH", "DELETE"])
          .describe("HTTP method"),
        path: pathField,
        query: queryField,
        body: bodyField,
        pathParams: pathParamsField,
      },
      annotations: EXECUTE_API.annotations,
    },
    async ({ method, path, query, body, pathParams }) => {
      if (!isCatalogEndpoint(method, path)) {
        return notInCatalogResult(method, path);
      }
      return callApi(transport, method, path, { query: stringifyQuery(query), body, pathParams });
    }
  );
}
