// Shared, side-effect-free catalog logic used by BOTH MCP servers:
//   - the stdio server in this package (src/index.ts, npm @aituber/mcp-server)
//   - the remote OAuth server inside the main app (app/api/[transport]/route.ts)
// Keep this file free of process/env access and node-only imports.

import { GENERATED_ENDPOINTS } from "./endpoints.generated";
import type { GeneratedEndpoint } from "./endpoints.generated";
import { EXAMPLES } from "./examples";

export type Endpoint = GeneratedEndpoint & {
  example?: string | Record<string, unknown>;
  examples?: Record<string, Record<string, unknown>>;
};

export const ENDPOINTS: Endpoint[] = GENERATED_ENDPOINTS.map((ep) => ({
  ...ep,
  ...EXAMPLES[`${ep.method} ${ep.path}`],
}));

// ---------------------------------------------------------------------------
// Knowledge base (helps the search tool answer conceptual questions)
// ---------------------------------------------------------------------------

export const KNOWLEDGE: Record<string, string> = {
  "video types": `AITuber supports 5 video types, all created via POST /videos/generate:

1. **Faceless Narration (images)** - Default. AI generates unique images for each segment with smooth Ken Burns animation. The classic "faceless video" style used by top YouTube channels. Set mediaType: "images" (or omit, it's the default).

2. **Faceless Narration (video clips)** - AI generates short video clips instead of images. More dynamic, higher credit cost. Set mediaType: "video".

3. **Stock Footage** - Automatically finds and matches real stock footage to narration. Great for news, educational, documentary content. Set mediaType: "stock".

4. **Skeleton Template** - Viral "what happens if..." X-ray style videos. Uses a specialized AI model for skeleton/X-ray visuals. Set templateId: "skeleton". The template handles mediaType and style automatically.

5. **Character Template** - Character-driven story format with consistent characters throughout. Set templateId: "character". Only supports inputType: "idea" (AI writes the script). The template handles mediaType and style automatically.

All types support voice selection, captions, aspect ratio, and other common settings.`,

  "skeleton": `Skeleton videos are a viral video format where subjects are shown in X-ray/skeleton style. Created by setting templateId: "skeleton" in POST /videos/generate. The template automatically selects the right AI model and visual style. IMPORTANT: Do NOT send mediaType, imageStyleId, or imageQuality when using this template. The template handles all visual settings. Just send script + templateId. Example: { "script": "What happens if you eat 100 bananas", "templateId": "skeleton" }`,

  "character": `Character template creates story-driven videos with consistent AI characters throughout. Set templateId: "character" in POST /videos/generate. Important: character template only works with inputType: "idea" (the AI writes the script to maintain character consistency). You provide a topic, not a full script. IMPORTANT: Do NOT send mediaType, imageStyleId, or imageQuality when using this template. The template handles all visual settings. Example: { "script": "A detective solves a mystery in Tokyo", "templateId": "character", "inputType": "idea", "expectedDurationSeconds": 60 }`,

  "visual control": `By default, AITuber's AI automatically decides what visuals to show for each part of your narration. For more control, add visual instructions in brackets before each narration segment:

"[A dark forest at night] The wind howled through the trees. [Glowing eyes in the darkness] Something was watching from the shadows."

Each [bracketed text] tells the AI exactly what to show for that scene. The text after it is the voiceover. This works in script mode with any media type (images, video, stock). No special flag needed.`,

  "templates": `AITuber has 2 video templates that create specialized video formats:
- **skeleton** - X-ray/skeleton style viral videos ("what happens if..." format)
- **character** - Character-driven story videos with consistent characters

Set templateId in POST /videos/generate. Templates override mediaType and imageStyleId automatically. For regular faceless narration videos, don't set templateId.`,

  "avatars": `Avatar videos are talking-head videos where an avatar speaks your script to the camera. Created via POST /videos/generate with mediaType: "avatar".

Flow:
1. **List avatars** (GET /avatars): built-in avatars plus characters the user created in the AITuber dashboard. Each entry has an id, a preview image, and sometimes a defaultVoiceId.
2. **Generate** (POST /videos/generate) with mediaType: "avatar", avatarId, script, and voiceId (REQUIRED for avatars, no default voice). Optional: motionPrompt (how the avatar moves and gestures), aspectRatio "9:16" or "16:9" (no square).
3. **Poll** GET /videos/{id} until completed. Avatar generation is slower than other types (usually 3-10 minutes).

Rules: script mode only (no inputType "idea" - write the script first, POST /scripts can help), max 5 minutes of video, script must be at least 5 words. Avatar videos cost far more credits than faceless videos (hundreds of credits per minute), so check the balance with GET /subscription for long scripts. Create NEW avatars via POST /elements (type "character", with a photo imageUrl or an uploaded imageAssetId), or in the dashboard.

Example: { "script": "Hey, welcome back! Today I have three tips for you...", "mediaType": "avatar", "avatarId": "<id from GET /avatars>", "voiceId": "<id from GET /voices>", "motionPrompt": "friendly, natural hand gestures" }`,

  "elements": `Elements are saved people/characters, products/props, and places with a REAL reference photo. Use them to put a specific face, product, or place in videos.

**Use in faceless videos:** mention the element by handle inside the script sent to POST /videos/generate, e.g. "[@Dhiva holding @Red-Bottle] Meet the founder who started it all." The element's photo is fed to the image model, so the same face/product appears consistently in every scene. Rules: works with mediaType "images" (imageQuality must be "good" or higher) and "video"; NOT with "stock". The @ is never spoken aloud; unknown handles read as plain words.

**Use as avatars:** a character element's id doubles as avatarId for talking-head videos (mediaType "avatar").

**Discover:** GET /elements returns each element's @handle, type, and photo. GET /avatars lists just the characters.

**Create via API:** two ways.
1. One call: POST /elements with { name, type, imageUrl } - we download the photo from the public URL.
2. Two calls for local files: POST /uploads { purpose: "element-image", contentType, fileSizeBytes } -> PUT the file bytes to the returned uploadUrl -> POST /elements with { name, type, imageAssetId }.

IMPORTANT: the photo is the ONLY source of how an element looks. Never describe the person's or product's appearance in the script or the description field - the description is for context (what it is, when to use it).`,

  "ugc": `UGC hook videos are short ads where a real-looking person reacts to camera with your hook text on screen, optionally followed by your product demo. Build one like this:

1. **Pick or make a reaction clip.**
   - Browse ready-made ones: GET /ugc/reactions (built-in library + your own). Each has a descriptive name and tags so you can choose a fitting person/mood.
   - Or generate a custom one from YOUR character: POST /ugc/reactions with elementId (a "character" element from GET /elements) + hookText (or reactionPrompt) + quality. Poll GET /ugc/reactions/{id} until completed.
2. **(Optional) Upload a product demo video:** POST /uploads with purpose "ugc-demo" (direct upload only; MP4/MOV/WebM, max 200MB, up to 3 min), then use the assetId.
3. **Build the finished video:** POST /ugc/videos with reactionId + hookText (+ optional demoVideoAssetId, aspectRatio, captionStyleId). It returns a videoId that is ready immediately - export it (POST /exports) and download (GET /exports/download) or publish it.

Notes: generating a reaction and building the video both need an active paid plan. The person's face in a generated reaction comes from your character element's photo. Demo video upload needs a real file (PUT), so it is API-friendly but not doable from a chat-only agent.`,

  "music": `Music videos pair a song with AI visuals, synced lyric captions, and an optional waveform. There is NO talking-head / avatar mode for music videos.

**Get a song (two ways):**
1. Generate one: POST /music with a prompt (e.g. "upbeat synthwave about late-night driving"). Optional: instrumental (no vocals), or customMode with your own style + title + lyrics. Poll GET /music/{id} until status is "completed". Use the id as musicId.
2. Upload your own: POST /uploads with purpose "music" (direct upload only; MP3/WAV/M4A/AAC, max 50MB, durationSeconds REQUIRED). Use the returned assetId as musicAssetId.

**Build the video:** POST /music-videos with exactly ONE of musicId (generated) or musicAssetId (uploaded), plus visualMode:
- "ai-images": a new AI image every few seconds (secondsPerImage, imageQuality, imageStyleId from GET /image-styles).
- "ai-video": short AI video clips across the song (videoQuality).
- "cover-image": one still image for the whole song (coverImageAssetId, uploaded via POST /uploads purpose "element-image").
Other options: visualDirection, aspectRatio, captionsEnabled + captionStyleId (GET /caption-styles) + captionPosition, showWaveform, musicTrimStartSeconds / musicTrimEndSeconds.

It returns a videoId. Poll GET /videos/{id} until completed, then export (POST /exports) and download (GET /exports/download), or publish.

Notes: browse your library with GET /music (generated songs + uploaded tracks). Both song generation and music video generation cost credits (refunded automatically on failure); check the balance with GET /subscription.`,

  "publishing": `Publishing flow for AITuber videos:

1. **Connect a channel** via the AITuber dashboard (OAuth). Supported for publishing: YouTube, TikTok, Instagram, Facebook, Threads, X.
2. **Generate a video** (POST /videos/generate) and wait until status is "completed".
3. **List your channels** (GET /channels) to find channel IDs.
4. **Publish** (POST /publications) with the videoId and per-channel settings.
5. **Poll status** (GET /publications/{publicationId}) until the upload reaches a stable state.

The API auto-exports the video to MP4 if not already exported. No need to call POST /exports first.

Requires an active paid subscription with the Publish feature (Creator plan or higher). Publishing is free (no credit cost).

Each platform accepts different settings:
- **YouTube:** title, tags, categoryId, madeForKids
- **TikTok:** tiktokPrivacyStatus, allowDuet, allowStitch, isAiGenerated
- **Instagram:** instagramPlacement (reels/stories/timeline), shareToFeed
- **Facebook:** uses the long caption and video with no extra settings
- **Threads and X:** share shortCaption, kept within X's weighted 280-character limit
- **Comments (TikTok and X only):** allowComment. No other platform lets us change it.

Scheduled publications can be canceled before they go live with DELETE /publications/{publicationId}.`,
};

// ---------------------------------------------------------------------------
// Search logic
// ---------------------------------------------------------------------------

export function searchKnowledge(query: string): string | null {
  const lower = query.toLowerCase();
  for (const [key, value] of Object.entries(KNOWLEDGE)) {
    if (lower.includes(key)) return value;
  }
  // Check for related terms
  const termMap: Record<string, string> = {
    "skeleton": "skeleton",
    "x-ray": "skeleton",
    "xray": "skeleton",
    "character": "character",
    "story": "character",
    "template": "templates",
    "video type": "video types",
    "media type": "video types",
    "faceless": "video types",
    "stock": "video types",
    "visual": "visual control",
    "bracket": "visual control",
    "image instruction": "visual control",
    "control": "visual control",
    "custom visual": "visual control",
    "element": "elements",
    "my face": "elements",
    "my product": "elements",
    "my photo": "elements",
    "own image": "elements",
    "reference photo": "elements",
    "consistent character": "elements",
    "brand": "elements",
    "upload": "elements",
    "ugc": "ugc",
    "reaction": "ugc",
    "hook video": "ugc",
    "hook ad": "ugc",
    "testimonial": "ugc",
    "spokesperson video": "ugc",
    "avatar": "avatars",
    "talking head": "avatars",
    "talking-head": "avatars",
    "spokesperson": "avatars",
    "presenter": "avatars",
    "music": "music",
    "song": "music",
    "music video": "music",
    "soundtrack": "music",
    "suno": "music",
    "lyrics": "music",
    "instrumental": "music",
    "publish": "publishing",
    "channel": "publishing",
    "channels": "publishing",
    "youtube": "publishing",
    "tiktok": "publishing",
    "instagram": "publishing",
    "social": "publishing",
    "schedule": "publishing",
    "publication": "publishing",
  };
  for (const [term, key] of Object.entries(termMap)) {
    if (lower.includes(term)) return KNOWLEDGE[key] ?? null;
  }
  return null;
}

export function searchEndpoints(query: string): Endpoint[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  const scored = ENDPOINTS.map((ep) => {
    const searchable = [
      ep.method,
      ep.path,
      ep.summary,
      ep.description,
      ...ep.params.map((p) => `${p.name} ${p.description}`),
    ]
      .join(" ")
      .toLowerCase();

    let score = 0;
    for (const term of terms) {
      if (searchable.includes(term)) score++;
    }
    return { ep, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.ep);
}

export function formatEndpoint(ep: Endpoint): string {
  const lines: string[] = [];
  lines.push(`## ${ep.method} ${ep.path}`);
  lines.push(`**${ep.summary}**`);
  lines.push("");
  lines.push(ep.description);
  lines.push("");
  lines.push(
    ep.auth
      ? "**Authentication:** Required (handled automatically)"
      : "**Authentication:** Not required"
  );
  lines.push("");

  if (ep.params.length > 0) {
    lines.push("**Parameters:**");
    for (const p of ep.params) {
      const req = p.required ? " (required)" : "";
      lines.push(
        `- \`${p.name}\` (${p.type}, ${p.in}${req}): ${p.description}`
      );
    }
    lines.push("");
  }

  if (ep.examples) {
    lines.push("**Examples:**");
    for (const [label, body] of Object.entries(ep.examples)) {
      lines.push(`\n*${label}:*`);
      lines.push("```json");
      lines.push(JSON.stringify(body, null, 2));
      lines.push("```");
    }
  } else if (ep.example) {
    lines.push("**Example:**");
    if (typeof ep.example === "string") {
      lines.push(`\`${ep.example}\``);
    } else {
      lines.push("```json");
      lines.push(JSON.stringify(ep.example, null, 2));
      lines.push("```");
    }
  }

  return lines.join("\n");
}

/** Build the search_api response text for a query. Returns null when nothing matched. */
export function buildSearchResponse(query: string): string | null {
  const knowledge = searchKnowledge(query);
  const results = searchEndpoints(query);

  const parts: string[] = [];
  if (knowledge) parts.push(knowledge);
  if (results.length > 0) {
    parts.push(results.map(formatEndpoint).join("\n\n---\n\n"));
  }
  if (parts.length === 0) return null;

  return (
    parts.join("\n\n---\n\n") + "\n\n**Full API docs:** https://aituber.app/api"
  );
}

/** One-line-per-endpoint listing, used when a search matches nothing. */
export function listAllEndpoints(): string {
  return ENDPOINTS.map((ep) => `- ${ep.method} ${ep.path}: ${ep.summary}`).join(
    "\n"
  );
}
