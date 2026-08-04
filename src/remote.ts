// Cloudflare Worker: AITuber remote MCP server.
//
// A thin, stateless proxy in front of the AITuber public REST API. It verifies
// the caller's Clerk OAuth 2.1 bearer token, exposes exactly two MCP tools
// (search_api, execute_api), and forwards API calls to the AITuber API using
// the caller's own bearer token. The main API enforces all authorization.
//
// No Durable Objects, sessions, or storage. PostHog MCP Analytics records
// protocol and tool usage metadata without tool arguments or responses.

import { Hono } from "hono";
import type { Context } from "hono";
import { StreamableHTTPTransport } from "@hono/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createClerkClient } from "@clerk/backend";
import { instrument, type UserIdentity } from "@posthog/mcp";
import { PostHog } from "posthog-node";
import { z } from "zod";

import { buildSearchResponse, listAllEndpoints } from "./catalog";
import { frontendApiUrlFromPublishableKey } from "./remote/clerk";

// The version is inlined at build time by esbuild via `define`. It falls back to
// a literal so the file still typechecks and runs without the define.
declare const __PACKAGE_VERSION__: string;
const PACKAGE_VERSION =
  typeof __PACKAGE_VERSION__ === "string" ? __PACKAGE_VERSION__ : "0.0.0";

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

interface Env {
  // [vars] in wrangler.toml
  CLERK_PUBLISHABLE_KEY: string;
  AITUBER_API_BASE_URL: string;
  POSTHOG_HOST: string;
  // secret: `wrangler secret put CLERK_SECRET_KEY`
  CLERK_SECRET_KEY: string;
  // secret: `wrangler secret put POSTHOG_API_KEY`
  POSTHOG_API_KEY?: string;
}

const REQUEST_TIMEOUT_MS = 30_000;
const MAX_RESPONSE_LENGTH = 50_000;
const HUMAN_REDIRECT_URL = "https://aituber.app/mcp";

// ---------------------------------------------------------------------------
// CORS helpers (only the .well-known metadata routes need CORS)
// ---------------------------------------------------------------------------

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

// ---------------------------------------------------------------------------
// In-memory cache for the upstream Clerk authorization-server metadata.
// Workers isolates are short-lived, so this is a best-effort ~5 min cache.
// ---------------------------------------------------------------------------

let authServerCache: { body: string; expiresAt: number } | null = null;
const AUTH_SERVER_CACHE_MS = 5 * 60 * 1000;

// ---------------------------------------------------------------------------
// Token verification
// ---------------------------------------------------------------------------

interface VerifiedToken {
  ok: boolean;
  rawToken: string | null;
  tokenType: "api_key" | "oauth_token" | null;
  userId: string | null;
  organizationId: string | null;
}

const UNVERIFIED_TOKEN: VerifiedToken = {
  ok: false,
  rawToken: null,
  tokenType: null,
  userId: null,
  organizationId: null,
};

function extractBearer(request: Request): string | null {
  const header = request.headers.get("Authorization");
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

/**
 * Two credentials are accepted, matching how hybrid remote MCPs (GitHub,
 * Stripe) work:
 * - OAuth 2.1 access tokens: consumer clients (claude.ai, Claude Desktop,
 *   Cursor) get these via the connector consent flow.
 * - AITuber API keys (ak_...): headless setups (VPS, CI, n8n, scripts) pass
 *   them as `Authorization: Bearer ak_...` - long-lived, no browser dance.
 * Either way the raw token is forwarded to the API, which enforces
 * everything again.
 */
async function verifyToken(request: Request, env: Env): Promise<VerifiedToken> {
  const rawToken = extractBearer(request);
  if (!rawToken) {
    return UNVERIFIED_TOKEN;
  }

  try {
    const clerk = createClerkClient({
      secretKey: env.CLERK_SECRET_KEY,
      publishableKey: env.CLERK_PUBLISHABLE_KEY,
    });

    const requestState = await clerk.authenticateRequest(request, {
      acceptsToken: ["oauth_token", "api_key"],
    });

    const auth = requestState.toAuth();
    if (auth && auth.isAuthenticated) {
      if (auth.tokenType === "oauth_token") {
        return {
          ok: true,
          rawToken,
          tokenType: auth.tokenType,
          userId: auth.userId,
          organizationId: null,
        };
      }

      if (auth.tokenType === "api_key") {
        return {
          ok: true,
          rawToken,
          tokenType: auth.tokenType,
          userId: auth.userId,
          organizationId:
            auth.orgId ??
            (auth.subject.startsWith("org_") ? auth.subject : null),
        };
      }
    }
  } catch {
    // Fall through to unauthenticated. Never log the token.
  }

  return UNVERIFIED_TOKEN;
}

// ---------------------------------------------------------------------------
// PostHog MCP Analytics
// ---------------------------------------------------------------------------

let posthogClient: PostHog | null = null;

function getPosthog(env: Env): PostHog | null {
  if (!env.POSTHOG_API_KEY) return null;

  posthogClient ??= new PostHog(env.POSTHOG_API_KEY, {
    host: env.POSTHOG_HOST,
  });
  return posthogClient;
}

function analyticsIdentity(verified: VerifiedToken): UserIdentity | null {
  const distinctId = verified.userId ?? verified.organizationId;
  if (!distinctId) return null;

  return {
    distinctId,
    groups: verified.organizationId
      ? { organization: verified.organizationId }
      : undefined,
  };
}

function removeMcpPayloads<T extends {
  properties?: Record<string, unknown>;
}>(event: T): T {
  if (event.properties) {
    delete event.properties.$mcp_parameters;
    delete event.properties.$mcp_response;
  }
  return event;
}

// ---------------------------------------------------------------------------
// AITuber API client (forwards the caller's own bearer token)
// ---------------------------------------------------------------------------

async function apiRequest(
  baseUrl: string,
  bearerToken: string,
  method: string,
  path: string,
  options?: {
    query?: Record<string, string>;
    body?: unknown;
    pathParams?: Record<string, string>;
  }
): Promise<{ status: number; statusText: string; body: string }> {
  let resolvedPath = path;
  if (options?.pathParams) {
    for (const [key, value] of Object.entries(options.pathParams)) {
      resolvedPath = resolvedPath.replace(`{${key}}`, encodeURIComponent(value));
    }
  }

  const url = new URL(baseUrl + resolvedPath);

  if (options?.query) {
    for (const [k, v] of Object.entries(options.query)) {
      if (v !== undefined && v !== "") {
        url.searchParams.set(k, v);
      }
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // /voices is public and needs no auth. Everything else forwards the caller's token.
  if (resolvedPath !== "/voices") {
    headers["Authorization"] = `Bearer ${bearerToken}`;
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  const responseBody = await response.text();
  return {
    status: response.status,
    statusText: response.statusText,
    body: responseBody,
  };
}

// ---------------------------------------------------------------------------
// MCP server construction (one per request, stateless)
// ---------------------------------------------------------------------------

function buildMcpServer(
  env: Env,
  bearerToken: string,
  verified: VerifiedToken,
  posthog: PostHog | null
): McpServer {
  const server = new McpServer({
    name: "aituber",
    version: PACKAGE_VERSION,
  });

  // Tool 1: Search the API
  server.tool(
    "search_api",
    "Search the AITuber API to find endpoints for creating AI videos, checking credits, exporting to MP4, publishing to social media, and more. Returns matching endpoints with parameters and examples. Use this before execute_api to find the right endpoint.",
    {
      query: z
        .string()
        .describe(
          'What you want to do, e.g. "create a video", "list voices", "check credits", "download mp4", "publish to tiktok"'
        ),
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

      return {
        content: [{ type: "text" as const, text }],
      };
    }
  );

  // Tool 2: Execute an API call
  server.tool(
    "execute_api",
    "Execute a request against the AITuber API. Use search_api first to find the right endpoint and parameters. Handles authentication automatically.",
    {
      method: z
        .enum(["GET", "POST", "PUT", "PATCH", "DELETE"])
        .describe("HTTP method"),
      path: z
        .string()
        .describe(
          "API endpoint path, e.g. /videos, /videos/generate, /voices, /subscription"
        ),
      query: z
        .record(z.string(), z.string())
        .optional()
        .describe(
          'Query parameters as key-value pairs, e.g. { "limit": "10", "gender": "female" }'
        ),
      body: z
        .record(z.string(), z.unknown())
        .optional()
        .describe(
          'Request body (for POST/PUT), e.g. { "script": "...", "mediaType": "images" }'
        ),
      pathParams: z
        .record(z.string(), z.string())
        .optional()
        .describe(
          'Path parameter substitutions, e.g. { "id": "abc-123" } for /videos/{id}'
        ),
    },
    async ({ method, path, query, body, pathParams }) => {
      try {
        const result = await apiRequest(
          env.AITUBER_API_BASE_URL,
          bearerToken,
          method,
          path,
          {
            query: query as Record<string, string> | undefined,
            body,
            pathParams: pathParams as Record<string, string> | undefined,
          }
        );

        let formattedBody = result.body;
        try {
          const parsed = JSON.parse(result.body);
          formattedBody = JSON.stringify(parsed, null, 2);
        } catch {
          // Not JSON, use raw body
        }

        // Truncate very large responses to avoid overwhelming the LLM context
        if (formattedBody.length > MAX_RESPONSE_LENGTH) {
          formattedBody =
            formattedBody.substring(0, MAX_RESPONSE_LENGTH) +
            "\n\n... (response truncated. Use query filters to narrow results)";
        }

        return {
          content: [
            {
              type: "text" as const,
              text: `${result.status} ${result.statusText}\n\n${formattedBody}`,
            },
          ],
          isError: result.status >= 400,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const isTimeout =
          message.includes("abort") || message.includes("timeout");

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
  );

  if (posthog) {
    instrument(server, posthog, {
      // Preserve the existing public tool schemas and agent behavior.
      context: false,
      reportMissing: false,
      identify: analyticsIdentity(verified),
      eventProperties: () => ({
        organizationId: verified.organizationId,
        auth_type: verified.tokenType,
      }),
      // Requests and responses can contain scripts and generated content.
      // Tool usage, errors, latency, clients, and sessions remain available.
      beforeSend: removeMcpPayloads,
    });
  }

  return server;
}

// ---------------------------------------------------------------------------
// Metadata responses
// ---------------------------------------------------------------------------

function origin(request: Request): string {
  return new URL(request.url).origin;
}

function protectedResourceMetadata(request: Request, env: Env): Response {
  const resource = origin(request);
  const authServer = frontendApiUrlFromPublishableKey(env.CLERK_PUBLISHABLE_KEY);

  const body = {
    resource,
    authorization_servers: [authServer],
    token_types_supported: ["urn:ietf:params:oauth:token-type:access_token"],
    scopes_supported: ["profile", "email"],
    resource_name: "AITuber",
    resource_documentation: "https://aituber.app/mcp",
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
}

async function authorizationServerMetadata(env: Env): Promise<Response> {
  const now = Date.now();
  if (authServerCache && authServerCache.expiresAt > now) {
    return new Response(authServerCache.body, {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const authServer = frontendApiUrlFromPublishableKey(env.CLERK_PUBLISHABLE_KEY);
  const upstream = await fetch(
    `${authServer}/.well-known/oauth-authorization-server`,
    { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) }
  );

  const text = await upstream.text();
  if (upstream.ok) {
    authServerCache = { body: text, expiresAt: now + AUTH_SERVER_CACHE_MS };
  }

  return new Response(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function unauthorized(request: Request): Response {
  const resourceMetadata = `${origin(request)}/.well-known/oauth-protected-resource`;
  const wwwAuthenticate =
    `Bearer error="invalid_token", ` +
    `error_description="Missing or invalid access token", ` +
    `resource_metadata="${resourceMetadata}"`;

  return new Response(
    JSON.stringify({
      error: "invalid_token",
      error_description: "Missing or invalid access token",
    }),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "WWW-Authenticate": wwwAuthenticate,
      },
    }
  );
}

// ---------------------------------------------------------------------------
// MCP request handler (shared by `/` and `/mcp`)
// ---------------------------------------------------------------------------

async function handleMcp(
  c: Context<{ Bindings: Env }>,
  env: Env
): Promise<Response> {
  const request = c.req.raw;

  // A human hitting the endpoint in a browser: send them to the docs page.
  if (request.method === "GET") {
    const accept = c.req.header("Accept") ?? "";
    if (accept.includes("text/html")) {
      return c.redirect(HUMAN_REDIRECT_URL, 302);
    }
  }

  const verified = await verifyToken(request, env);
  if (!verified.ok || !verified.rawToken) {
    return unauthorized(request);
  }

  const posthog = getPosthog(env);
  const server = buildMcpServer(env, verified.rawToken, verified, posthog);
  const transport = new StreamableHTTPTransport({
    // This lets PostHog carry session metadata in Mcp-Session-Id on stateless
    // Workers, as documented for Streamable HTTP deployments.
    enableJsonResponse: true,
  });
  await server.connect(transport);

  const response = await transport.handleRequest(c);
  if (posthog) {
    c.executionCtx.waitUntil(posthog.flush());
  }
  return response ?? new Response(null, { status: 202 });
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

const app = new Hono<{ Bindings: Env }>();

// Health check (no auth).
// Version included so we can tell which build is live after a deploy.
app.get("/health", (c) => c.json({ ok: true, version: PACKAGE_VERSION }));

// RFC 9728 Protected Resource Metadata (both the bare and /mcp-suffixed forms).
app.on(
  "OPTIONS",
  [
    "/.well-known/oauth-protected-resource",
    "/.well-known/oauth-protected-resource/mcp",
  ],
  () => new Response(null, { status: 204, headers: CORS_HEADERS })
);
app.get("/.well-known/oauth-protected-resource", (c) =>
  protectedResourceMetadata(c.req.raw, c.env)
);
app.get("/.well-known/oauth-protected-resource/mcp", (c) =>
  protectedResourceMetadata(c.req.raw, c.env)
);

// Authorization Server Metadata (proxied from Clerk).
app.on(
  "OPTIONS",
  "/.well-known/oauth-authorization-server",
  () => new Response(null, { status: 204, headers: CORS_HEADERS })
);
app.get("/.well-known/oauth-authorization-server", (c) =>
  authorizationServerMetadata(c.env)
);

// MCP endpoint at both `/` and `/mcp` (identical).
for (const path of ["/", "/mcp"]) {
  app.get(path, (c) => handleMcp(c, c.env));
  app.post(path, (c) => handleMcp(c, c.env));
  app.delete(path, (c) => handleMcp(c, c.env));
}

// Everything else.
app.all("*", (c) =>
  c.json({ error: "not_found", error_description: "Unknown route" }, 404)
);

export default app;
