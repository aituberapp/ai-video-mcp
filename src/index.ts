#!/usr/bin/env node
import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { buildSearchResponse, listAllEndpoints } from "./catalog";

const require = createRequire(import.meta.url);
const { version: PACKAGE_VERSION } = require("../package.json") as {
  version: string;
};

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const API_KEY = process.env.AITUBER_API_KEY;
const BASE_URL =
  process.env.AITUBER_API_BASE_URL ?? "https://app.aituber.app/api/v1";
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_RESPONSE_LENGTH = 50_000;

if (!API_KEY) {
  console.error(
    "AITUBER_API_KEY is required. Get your key at https://app.aituber.app/dashboard/api-keys"
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// HTTP client
// ---------------------------------------------------------------------------

async function apiRequest(
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
      resolvedPath = resolvedPath.replace(
        `{${key}}`,
        encodeURIComponent(value)
      );
    }
  }

  const url = new URL(BASE_URL + resolvedPath);

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

  if (resolvedPath !== "/voices") {
    headers["Authorization"] = `Bearer ${API_KEY}`;
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
// MCP Server
// ---------------------------------------------------------------------------

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
      const result = await apiRequest(method, path, {
        query: query as Record<string, string> | undefined,
        body,
        pathParams: pathParams as Record<string, string> | undefined,
      });

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
      const message =
        error instanceof Error ? error.message : String(error);
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
);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AITuber MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
