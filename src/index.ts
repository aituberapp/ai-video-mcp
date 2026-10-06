#!/usr/bin/env node
import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  parseAccountState,
  SERVER_INSTRUCTIONS,
  type AccountState,
} from "./catalog";
import { registerTools, REQUEST_TIMEOUT_MS } from "./tools";

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

/**
 * Read the live plan and balance, used only to decide which upgrade path the
 * paywall guidance may offer. A failure here is not worth surfacing: the
 * guidance falls back to plans, which every account can buy.
 */
async function fetchAccountState(): Promise<AccountState | undefined> {
  try {
    const result = await apiRequest("GET", "/subscription");
    if (result.status !== 200) return undefined;
    return parseAccountState(result.body);
  } catch {
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------

const server = new McpServer(
  {
    name: "aituber",
    version: PACKAGE_VERSION,
  },
  { instructions: SERVER_INSTRUCTIONS }
);

registerTools(server, {
  request: apiRequest,
  accountState: fetchAccountState,
});

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
