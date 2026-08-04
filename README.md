# AITuber MCP Server

Create AI-powered videos from your AI assistant. Generate videos with AI narration, visuals, and synced captions for YouTube Shorts, TikTok, Instagram Reels, and long-form content. Supports AI-generated images, video clips, stock footage, and viral templates like skeleton and character styles. AITuber handles script writing, voice synthesis, visual generation, and video rendering.

One server, one URL:

```
https://mcp.aituber.app
```

[AITuber](https://aituber.app) | [Setup Guide](https://aituber.app/mcp) | [API Documentation](https://aituber.app/api)

## Set up your client

### claude.ai and Claude Desktop

Open Settings, go to Connectors, click "Add custom connector", and paste `https://mcp.aituber.app`. A browser window opens to sign in with your AITuber account. Done.

### Claude Code

```bash
claude mcp add --transport http aituber https://mcp.aituber.app
```

Your browser opens once to sign in and approve access.

### ChatGPT

Open Settings, go to Connectors, then Advanced, and turn on Developer mode (required for custom connectors). Add a new connector with the URL `https://mcp.aituber.app` and sign in with your AITuber account.

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "aituber": {
      "url": "https://mcp.aituber.app"
    }
  }
}
```

### Codex

Add to `~/.codex/config.toml`:

```toml
[mcp_servers.aituber]
url = "https://mcp.aituber.app"
```

### OpenClaw and other MCP clients

Add a remote MCP server with the URL `https://mcp.aituber.app`. If your client supports OAuth, sign in when prompted. If it asks for credentials instead, use an API key (next section).

## Two ways to sign in

**1. Your AITuber login (default).** Apps like Claude, ChatGPT, and Cursor open a browser window where you sign in and approve access. No key to copy, nothing to store.

**2. An API key (servers, CI, automation).** Where a browser sign-in is not practical (a VPS, CI pipeline, n8n, cron), create a key at [app.aituber.app/dashboard/api-keys](https://app.aituber.app/dashboard/api-keys) (starts with `ak_`) and send it as a bearer token to the same URL:

```bash
claude mcp add --transport http aituber https://mcp.aituber.app \
  --header "Authorization: Bearer ak_your_key_here"
```

```json
{
  "mcpServers": {
    "aituber": {
      "url": "https://mcp.aituber.app",
      "headers": {
        "Authorization": "Bearer ak_your_key_here"
      }
    }
  }
}
```

API keys are long-lived and revocable from the dashboard, so they fit unattended automation better than OAuth tokens.

## What you can do

- **Generate videos from a prompt or script** - describe a topic and get a fully produced video, or provide exact narration text for precise control
- **Short-form and long-form** - create 15-second Shorts or 20-minute videos
- **1,300+ AI voices** - filter by gender, accent, age, or language
- **27+ visual styles** - photorealistic, anime, cinematic, 3D Pixar, watercolor, comic book, and more
- **Video templates** - skeleton X-ray style, character-driven stories
- **Multiple media types** - AI-generated images, AI video clips, or real stock footage
- **Music videos** - generate a song from a prompt (or upload your own track) and turn it into a music video with AI visuals and synced lyric captions
- **YouTube, TikTok, and Instagram** - publish directly to your connected channels
- **Export to MP4** - render and download the final video
- **Check credits and plan** - monitor usage before generating

## Start creating

Ask your AI assistant:

> "Create a 60-second video about 5 mind-blowing facts about the ocean"

> "List available British female voices for narration"

> "Check how many credits I have left"

> "Export my latest video to MP4 and give me the download link"

> "List my connected channels and publish my finished video to YouTube, TikTok, and Instagram"

## How it works

The server provides two tools:

### `search_api`

Finds the right AITuber API endpoint for your task. Describe what you want in natural language.

```
search_api("create a video about cats")
-> Returns: POST /videos/generate with all parameters and examples
```

### `execute_api`

Calls the AITuber API. Use after `search_api` to know which endpoint and parameters to use.

```
execute_api(method: "POST", path: "/videos/generate", body: {
  "script": "5 amazing facts about the deep ocean",
  "inputType": "idea",
  "expectedDurationSeconds": 60
})
-> Returns: { videoId: "abc-123", status: "pending" }
```

### Example workflows

**Generate and download MP4**

1. **Search** - find the right endpoint for creating a video
2. **Generate** - create the video with your script and settings
3. **Poll** - check video status until generation completes
4. **Export** - render the completed video to MP4
5. **Download** - get the MP4 download URL

**Generate and publish**

1. **Generate** - create the video with your script and settings
2. **Poll** - wait until the video status is `completed`
3. **List channels** - call `GET /channels` to find connected channel IDs
4. **Publish** - call `POST /publications` with the `videoId` and per-channel settings
5. **Poll publication** - call `GET /publications/{publicationId}` until it reaches `published`, `scheduled`, or `failed`

Publishing requires channels to already be connected through the AITuber dashboard and an active paid plan with the Publish feature. If the video is not exported yet, the API starts the export automatically.

**Generate a music video**

1. **Make a song** - call `POST /music` with a prompt (or upload a track with `POST /uploads` purpose `music`)
2. **Poll the song** - call `GET /music/{id}` until status is `completed`
3. **Build the video** - call `POST /music-videos` with the `musicId` (or `musicAssetId`) and a `visualMode` (`ai-images`, `ai-video`, or `cover-image`)
4. **Poll the video** - call `GET /videos/{id}` until status is `completed`, then export or publish it

## API endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /voices` | Browse 1,300+ AI voices with filters (public, no auth required) |
| `GET /voices/cloned` | List voices you cloned in the dashboard |
| `GET /avatars` | List avatars for talking-head videos |
| `GET /elements` | List saved people, products, and places (with @handles) |
| `POST /elements` | Save an element from a photo URL or uploaded asset |
| `POST /uploads` | Upload media (from a URL or a direct PUT) |
| `GET /ugc/reactions` | List UGC reaction clips (library + your own) |
| `POST /ugc/reactions` | Generate a reaction clip from your character |
| `GET /ugc/reactions/{id}` | Get a reaction clip status |
| `POST /ugc/videos` | Build a finished UGC hook video |
| `POST /music` | Generate an original song from a prompt |
| `GET /music` | List your generated and uploaded tracks |
| `GET /music/{id}` | Get a song's status and audio URL |
| `POST /music-videos` | Turn a song into a music video with AI visuals |
| `POST /ideas` | Get video topic ideas for a niche |
| `POST /scripts` | Write a narration script from a topic |
| `GET /image-styles` | List image styles for video generation |
| `GET /caption-styles` | List caption styles for video generation |
| `POST /videos/generate` | Create a video from a script or idea |
| `GET /videos` | List all your videos |
| `GET /videos/{id}` | Get video details and generation status |
| `DELETE /videos/{id}` | Delete a video |
| `GET /clip-models` | List AI models for standalone clips with capabilities and costs |
| `POST /clips` | Generate a standalone AI video clip from a prompt or image |
| `GET /clips` | List your clips |
| `GET /clips/{id}` | Get clip status and download URL |
| `GET /subscription` | Check your plan, credits, and billing info |
| `POST /exports` | Start rendering a video to MP4 |
| `GET /exports/download` | Get a temporary download URL for the MP4 |
| `GET /channels` | List connected YouTube, TikTok, and Instagram channels |
| `POST /publications` | Publish a completed video to one or more connected channels |
| `GET /publications/{publicationId}` | Check publication status after publishing |
| `DELETE /publications/{publicationId}` | Cancel a scheduled publication before it goes live |

## Supported video types

| Type | Description | How to create |
|------|-------------|---------------|
| **Faceless narration (images)** | AI images with Ken Burns animation, narration, and captions | Default. Just send a script or idea. |
| **Faceless narration (video clips)** | AI-generated video clips instead of images | Set `mediaType: "video"` |
| **Stock footage** | Real stock footage matched to narration | Set `mediaType: "stock"` |
| **Skeleton template** | Viral "what happens if..." X-ray style | Set `templateId: "skeleton"` |
| **Character template** | Character-driven story format | Set `templateId: "character"` |
| **Avatar (talking head)** | An avatar speaks your script to the camera | Set `mediaType: "avatar"` + `avatarId` + `voiceId` |

## Under the hood

The server is a stateless Cloudflare Worker (`src/remote.ts`, source in this repo). It verifies your AITuber sign-in or API key, exposes the `search_api` and `execute_api` tools, and forwards each call to the AITuber API with your own credential. Nothing is stored and there are no server-side sessions. PostHog MCP Analytics records tool names, client details, timing, and success or failure. Tool arguments and responses are removed before analytics events are sent. The endpoint catalog is generated from the API's OpenAPI definition, so the tools always match the live API. Dev and deploy notes: [CONTRIBUTING.md](./CONTRIBUTING.md).

## Links

- [AITuber](https://aituber.app) - AI video creation tool
- [Setup Guide](https://aituber.app/mcp) - Connect from any client
- [API Documentation](https://aituber.app/api) - Interactive API reference
- [Dashboard](https://app.aituber.app/dashboard) - Manage videos and billing
- [API Keys](https://app.aituber.app/dashboard/api-keys) - Create and manage your API keys

## License

MIT
