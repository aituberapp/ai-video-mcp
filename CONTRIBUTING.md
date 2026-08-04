# Development

This package contains two MCP servers sharing one generated endpoint catalog:

- `src/remote.ts` - the hosted Cloudflare Worker at https://mcp.aituber.app
- `src/index.ts` - the legacy stdio server published to npm (kept working for
  existing installs, no longer documented)
- `src/catalog.ts` + `src/endpoints.generated.ts` - shared catalog; the
  generated file comes from `pnpm docs:generate` in the main repo and is
  CI-checked, so it cannot drift from the live API

## Worker: local dev

```bash
pnpm install
# Create .dev.vars (gitignored) with:
#   CLERK_PUBLISHABLE_KEY="pk_test_..."   (dev key)
#   AITUBER_API_BASE_URL="https://app.aituber.app/api/v1"
#   CLERK_SECRET_KEY="sk_test_..."        (dev secret)
#   POSTHOG_API_KEY="phc_..."             (optional analytics key)
pnpm dev:remote        # wrangler dev
```

Quick checks against a running dev server:

```bash
curl http://localhost:8787/health                                  # {"ok":true}
curl http://localhost:8787/.well-known/oauth-protected-resource    # RFC 9728 metadata
```

## Worker: deploy

Production deploys happen automatically from the main repo via Cloudflare's
Git integration. Manual deploy:

```bash
# One-time: store production secrets as Worker secrets
pnpm exec wrangler secret put CLERK_SECRET_KEY
pnpm exec wrangler secret put POSTHOG_API_KEY
pnpm deploy:remote     # wrangler deploy
```

`CLERK_PUBLISHABLE_KEY`, `AITUBER_API_BASE_URL`, and `POSTHOG_HOST` live in
`wrangler.toml` under `[vars]` (public by design). `CLERK_SECRET_KEY` and
`POSTHOG_API_KEY` are secrets.

## Checks

```bash
pnpm typecheck   # both entry points
pnpm build       # stdio bundle (esbuild)
```
