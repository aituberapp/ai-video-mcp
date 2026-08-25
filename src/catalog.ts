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

/** Where every paywall, top-up, and plan change is completed. */
export const BILLING_URL = "https://app.aituber.app/dashboard/billing";

// ---------------------------------------------------------------------------
// Server instructions
//
// Sent in the MCP initialize result, so most clients put this in front of the
// model before the first tool call. It is the only place we get to frame what
// AITuber is and what to do when a call hits a billing limit. PostHog MCP
// analytics showed billing limits were ~64% of all execute_api errors, and the
// agent used to report them as a plain failure with no way forward.
// ---------------------------------------------------------------------------

export const SERVER_INSTRUCTIONS = `AITuber turns a script or a rough idea into a finished short video: AI voiceover, matching visuals, and captions that stay in sync. It makes YouTube Shorts, TikToks, Reels, and long-form videos, and it can post them to connected channels for the user. Creators run whole faceless channels with it, with no camera, no microphone, and no editing software.

**How to use this server**
1. Call search_api to find the right endpoint, then execute_api to run it.
2. Generation costs credits. Call GET /subscription to read the current plan and credit balance before a large job.
3. MP4 downloads, publishing, AI clips, and UGC reactions need a paid plan.

**When a call returns 402 or 403**
This is a billing limit, not a bug, and the work already done is safe. Never stop at "the request failed" and never guess the cause. Do all three of these:
1. Say in plain words what is missing (credits, or a paid plan).
2. Recommend a plan. Plans carry more credits per dollar than one-time credit packs at every price point, yearly carries the most, and only a plan unlocks MP4 downloads and publishing.
3. Give the user this link so they can fix it in one click: ${BILLING_URL}

Offer a one-time credit pack ONLY when the tool result says the account has an active plan. Packs are sold only to active subscribers, so naming one to anybody else offers something they cannot buy.

The tool result carries the exact wording for each case. Follow it, and never invent a price, a discount, or an earnings figure.`;

// ---------------------------------------------------------------------------
// Knowledge base (helps the search tool answer conceptual questions)
// ---------------------------------------------------------------------------

export const KNOWLEDGE: Record<string, string> = {
  "video types": `AITuber supports 6 video types, all created via POST /videos/generate:

1. **Faceless Narration (images)** - Default. AI generates unique images for each segment with smooth Ken Burns animation. The classic "faceless video" style used by top YouTube channels. Set mediaType: "images" (or omit, it's the default).

2. **Faceless Narration (video clips)** - AI generates short video clips instead of images. More dynamic, higher credit cost. Set mediaType: "video".

3. **Stock Footage** - Automatically finds and matches real stock footage to narration. Great for news, educational, documentary content. Set mediaType: "stock".

4. **Skeleton Template** - Viral "what happens if..." X-ray style videos. Uses a specialized AI model for skeleton/X-ray visuals. Set templateId: "skeleton". The template handles mediaType and style automatically.

5. **Character Template** - Character-driven story format with consistent characters throughout. Set templateId: "character". Only supports inputType: "idea" (AI writes the script). The template handles mediaType and style automatically.

6. **Medical Animation Template** - Scientifically accurate anatomy and health videos for education, patient explainers, and clinic content. Set templateId: "medical". Works with mediaType "images" (default) or "video" only.

All types support voice selection, captions, aspect ratio, and other common settings.`,

  "skeleton": `Skeleton videos are a viral video format where subjects are shown in X-ray/skeleton style. Created by setting templateId: "skeleton" in POST /videos/generate. The template automatically selects the right AI model and visual style. IMPORTANT: Do NOT send mediaType, imageStyleId, or imageQuality when using this template. The template handles all visual settings. Just send script + templateId. Example: { "script": "What happens if you eat 100 bananas", "templateId": "skeleton" }`,

  "medical": `Medical Animation videos explain anatomy, diseases, procedures, and clinic visits with scientifically accurate 3D medical visuals. Set templateId: "medical" in POST /videos/generate. Works with mediaType "images" (default, cheapest) or "video" (full-motion fly-throughs); stock is not supported for this template. Optional curated looks via imageStyleId: "medical-3d" (realistic 3D), "medical-translucent" (see-through body), "medical-xray", "medical-darkstudio" (isolated organ on black, great for clinic ads), "medical-cartoon" (patient-friendly); omit for auto. Example: { "script": "How a total knee replacement works, step by step", "templateId": "medical", "inputType": "idea", "expectedDurationSeconds": 60 }`,

  "character": `Character template creates story-driven videos with consistent AI characters throughout. Set templateId: "character" in POST /videos/generate. Important: character template only works with inputType: "idea" (the AI writes the script to maintain character consistency). You provide a topic, not a full script. IMPORTANT: Do NOT send mediaType, imageStyleId, or imageQuality when using this template. The template handles all visual settings. Example: { "script": "A detective solves a mystery in Tokyo", "templateId": "character", "inputType": "idea", "expectedDurationSeconds": 60 }`,

  "visual control": `By default, AITuber's AI automatically decides what visuals to show for each part of your narration. For more control, add visual instructions in brackets before each narration segment:

"[A dark forest at night] The wind howled through the trees. [Glowing eyes in the darkness] Something was watching from the shadows."

Each [bracketed text] tells the AI exactly what to show for that scene. The text after it is the voiceover. This works in script mode with any media type (images, video, stock). No special flag needed.`,

  "templates": `AITuber has 3 video templates that create specialized video formats:
- **skeleton** - X-ray/skeleton style viral videos ("what happens if..." format)
- **medical** - Accurate 3D medical animation for health education, patients, and clinics
- **character** - Character-driven story videos with consistent characters

Set templateId in POST /videos/generate. Templates override mediaType and imageStyleId automatically (medical keeps mediaType open: images or video). For regular faceless narration videos, don't set templateId.`,

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

  // Keep this entry LAST. searchKnowledge scans keys in insertion order, so a
  // feature question ("avatars", "music") wins over the generic money answer.
  "billing": `Credits, plans, and credit packs.

**Credits** pay for generation: voiceover, images, AI video clips, stock footage, songs, and avatars. Longer videos and higher quality tiers cost more. Exporting to MP4 and publishing are free. Credits never expire. Read the live balance and plan with GET /subscription.

**Two ways to get credits, and they are not the same:**
- **A plan** (monthly or yearly) adds credits every billing cycle AND unlocks MP4 downloads, exports, AI clip generation, and UGC reactions. Publishing to social channels is included from the Creator plan up. A plan carries more credits per dollar than a pack at every price point, and a yearly plan carries the most.
- **A credit pack** is a one-time top-up for an account that ALREADY has an active plan. It adds credits and nothing else. Accounts without an active plan cannot buy one.

So: recommend a plan by default. Bring up a pack only after GET /subscription shows \`status: "active"\`, and only when the current plan size is otherwise right for the user.

**Where to buy:** ${BILLING_URL}. There is no API endpoint for buying credits or plans, on purpose. Payment happens in the browser. Send the user the link.

**Spending less:** a shorter script, mediaType "images" instead of "video", and imageQuality "basic" all cut the cost of a video. Offer this as a choice, never as a silent downgrade.`,
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
    "medical": "medical",
    "anatomy": "medical",
    "surgery": "medical",
    "health video": "medical",
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
    // Money terms go last so a feature term ("avatar", "publish") still wins.
    "credit": "billing",
    "cost": "billing",
    "how much": "billing",
    "price": "billing",
    "pricing": "billing",
    "plan": "billing",
    "upgrade": "billing",
    "subscription": "billing",
    "subscribe": "billing",
    "buy": "billing",
    "purchase": "billing",
    "top up": "billing",
    "top-up": "billing",
    "balance": "billing",
    "402": "billing",
    "payment required": "billing",
    "paid plan": "billing",
    "paywall": "billing",
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

// ---------------------------------------------------------------------------
// Paywall guidance
//
// A raw 402/403 from the API is a bare code and, for the paid-plan gate, a
// sentinel string ("PAID_PLAN_REQUIRED_FOR_EXPORT") that means nothing to an
// agent. Left alone, the agent tells the user the call failed and stops, at the
// exact moment the user wanted to pay. This turns the response into a script:
// what happened, what the work costs, which of a plan or a pack fits, and the
// one link that fixes it.
//
// Facts asserted here and where they are enforced:
// - Export/download and AI clip gates are "has this org ever paid", i.e. a
//   billingSubscriptions row (lib/entitlements/export-core.ts). One-time packs
//   only add credits (addPackCredits), so a pack never opens the download gate.
// - Publishing needs an ACTIVE plan with the publishSchedule feature, which
//   starts at Creator (lib/plans/config.ts).
// - Exports and publishing cost no credits.
// - ONLY an account with an ACTIVE subscription can buy a credit pack. The
//   billing UI gates the pack cards on exactly that
//   (`canBuyCreditPacks = subscription?.status === "active"` in
//   components/billing/plans-section/plans-section.tsx). A free user never sees
//   a purchasable pack, so naming one to them sells something they cannot buy
//   and teaches a concept they will not find. Every guidance path below decides
//   this from the live account state, never from a guess.
// - Plans give more credits per dollar than packs at every price point, and
//   yearly gives the most. Verified 2026-08-14 against billing_products:
//   packs run 30 to 71 credits per USD, monthly plans 56 to 101, yearly 76 to
//   121. Re-check that query before editing this claim; if pack or plan pricing
//   moves, the wording below has to move with it.
// Keep prices and credit amounts out of this file; they go stale in a published
// npm package. Point at GET /subscription and the billing page instead.
// ---------------------------------------------------------------------------

interface PaywallBody {
  code?: unknown;
  message?: unknown;
  data?: {
    creditsRequired?: unknown;
    creditsAvailable?: unknown;
    /** "export" or "other", from server/api/errors.ts. */
    feature?: unknown;
  };
}

/**
 * The publish gate throws a plain FORBIDDEN carrying this constant, so the
 * message is the only thing that identifies it. Kept in step with
 * server/api/routers/social-media.ts; a mismatch degrades to the generic 403
 * path rather than to a wrong answer.
 */
const PUBLISH_GATE_MESSAGE = "PUBLISH_FEATURE_REQUIRED";

/**
 * The live account state, as returned by GET /subscription. Both servers fetch
 * it when a paywall fires, so the guidance can name the option the user can
 * actually buy. Left undefined when that call fails, and the guidance then
 * falls back to plans only, which every account can buy.
 */
export interface AccountState {
  plan: string;
  status: string;
  monthlyCredits: number | null;
}

/** Mirrors `canBuyCreditPacks` in components/billing/plans-section. */
function canBuyPacks(account: AccountState | undefined): boolean {
  return account?.status === "active";
}

/**
 * Read a GET /subscription body. Returns undefined on anything unexpected, so a
 * shape change downgrades the guidance to plans only instead of guessing that
 * the user can buy a pack.
 */
export function parseAccountState(rawBody: string): AccountState | undefined {
  try {
    const parsed = JSON.parse(rawBody) as Record<string, unknown>;
    if (typeof parsed.plan !== "string" || typeof parsed.status !== "string") {
      return undefined;
    }
    return {
      plan: parsed.plan,
      status: parsed.status,
      monthlyCredits:
        typeof parsed.monthlyCredits === "number" ? parsed.monthlyCredits : null,
    };
  } catch {
    return undefined;
  }
}

/**
 * Only the out-of-credits path changes with the account state, so this is the
 * only case worth an extra round trip to GET /subscription.
 */
export function needsAccountState(status: number): boolean {
  return status === 402;
}

/** Shared closing line. Nothing here may invent a number the user can check. */
const HONESTY_RULE =
  "Never invent prices, discounts, savings, income, or view counts. The billing page shows the live numbers; quote only what this tool result gave you.";

function asInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** "This plan covers about N videos like this one per cycle", when both numbers are known. */
function coverageLine(
  account: AccountState | undefined,
  required: number | null
): string {
  const included = asInteger(account?.monthlyCredits);
  if (!account || included === null || required === null || required <= 0) {
    return "";
  }

  const videos = Math.floor(included / required);
  if (videos < 1) return "";

  return `\n\nUse this to make the value concrete, in one line: the ${account.plan} plan includes ${included} credits per cycle, and this job costs ${required}, so it covers about ${videos} more like it every cycle.`;
}

const CHEAPER_OPTION =
  '**Spend less on this job**, if the user would rather not pay now: a shorter script, mediaType "images" instead of "video", or imageQuality "basic". Offer this as a choice, never as a silent downgrade.';

function insufficientCreditsGuidance(
  data: PaywallBody["data"],
  account: AccountState | undefined
): string {
  const required = asInteger(data?.creditsRequired);
  const available = asInteger(data?.creditsAvailable);

  const shortfall =
    required !== null && available !== null
      ? `The account is short by ${required - available} credits. This job needs ${required} and ${available} are left.`
      : required !== null
        ? `This job needs ${required} credits and the balance is too low.`
        : "The credit balance is too low for this job.";

  const head = `### Not an error: the account is out of credits

${shortfall} Nothing was charged and nothing was lost.

Tell the user this in plain words, then offer the choices below. Do not stop at "the request failed".`;

  const tail = `\n\nPayment happens in the browser. There is no endpoint for it. Give the user the link. Credits never expire, and GET /subscription always returns the live balance.\n\n${HONESTY_RULE}`;

  // An account with an active plan is the only one that can buy a pack, so it
  // is the only one that gets told packs exist.
  if (canBuyPacks(account)) {
    return `${head}

1. **Move up a plan.** Recommend this first. Every plan carries more credits per dollar than a one-time pack, yearly carries the most, and the credits return every cycle. If the balance keeps running out, a bigger plan is the fix and a repeat pack is not. Compare plans here: ${BILLING_URL}
2. **Buy a one-time credit pack**, if this was a one-off and the current plan size is otherwise right. Same page: ${BILLING_URL}
3. ${CHEAPER_OPTION}${coverageLine(account, required)}${tail}`;
  }

  // Free, canceled, past due, or unknown. Packs are not purchasable here, so
  // they are never named.
  return `${head}

1. **Start a plan.** This is the only way to add credits to this account. A plan adds credits every billing cycle and unlocks MP4 downloads and publishing at the same time, and yearly plans carry the most credits per dollar. Pick one here: ${BILLING_URL}
2. ${CHEAPER_OPTION}

Do NOT mention one-time credit packs to this user. Packs are sold only to accounts with an active plan, so naming one offers something they cannot buy.

Make the value concrete with what you already know: this video needed ${required ?? "the credits shown above"} credits, and every plan on that page lists the credits it includes per cycle, so the user can see how many videos like this one it covers.${tail}`;
}

// This gate only fires on an account that has never had a plan, so a pack is
// not purchasable and is never named.
const NO_PACKS_NOTE =
  "Do NOT mention one-time credit packs. This account cannot buy one: packs are sold only to accounts with an active plan.";

function exportPaywallGuidance(): string {
  return `### Not an error: MP4 downloads need a paid plan

The video is finished and stored safely in the account. Nothing was lost, and exporting itself costs no credits.

This account has never had a plan. One plan unlocks exports and downloads across the whole account, including every video made before the purchase, and it adds credits every billing cycle for the next ones.

Tell the user their video is ready and waiting, then send them here to pick a plan: ${BILLING_URL}

Say the value plainly: the work is already done, the file is one plan away, and the same plan covers everything they make next. ${NO_PACKS_NOTE} ${HONESTY_RULE}

Once the plan is active, call POST /exports again, then GET /exports/download.`;
}

function paidPlanGuidance(): string {
  return `### Not an error: this feature needs a paid plan

The account has never had a plan. MP4 downloads, single AI clip generation, and UGC reaction clips all need one.

Everything already generated is safe. Tell the user what is locked, then send them here to pick a plan: ${BILLING_URL}

One plan opens all of these at once and adds credits every cycle. ${NO_PACKS_NOTE} ${HONESTY_RULE}

Retry the same call once the plan is active.`;
}

function publishPaywallGuidance(): string {
  return `### Not an error: publishing needs the Creator plan or higher

Publishing to YouTube, TikTok, Instagram, Facebook, Threads, and X is included from the Creator plan up. Publishing costs no credits at all; it is the plan that carries it.

The video is safe. Tell the user, then send them here to move up: ${BILLING_URL}

A plan is the only thing that opens publishing. A credit pack does not, so do not offer one here. ${HONESTY_RULE}

If the account can already export, offer this in the meantime: POST /exports, then GET /exports/download, and post the file by hand.`;
}

/**
 * Turn a paywall response into instructions the agent can act on. Returns null
 * for anything that is not a billing limit, so ordinary errors are untouched.
 */
export function paywallGuidance(
  status: number,
  rawBody: string,
  /** Live account state from GET /subscription. Omit it and the guidance offers plans only. */
  account?: AccountState
): string | null {
  if (status !== 402 && status !== 403) return null;

  let parsed: PaywallBody;
  try {
    parsed = JSON.parse(rawBody) as PaywallBody;
  } catch {
    return null;
  }

  const code = typeof parsed.code === "string" ? parsed.code : "";
  const message = typeof parsed.message === "string" ? parsed.message : "";

  if (code === "PAYMENT_REQUIRED") {
    return insufficientCreditsGuidance(parsed.data, account);
  }
  if (message === PUBLISH_GATE_MESSAGE) {
    return publishPaywallGuidance();
  }
  if (code === "PAID_PLAN_REQUIRED") {
    return parsed.data?.feature === "export"
      ? exportPaywallGuidance()
      : paidPlanGuidance();
  }

  return null;
}

/** One-line-per-endpoint listing, used when a search matches nothing. */
export function listAllEndpoints(): string {
  return ENDPOINTS.map((ep) => `- ${ep.method} ${ep.path}: ${ep.summary}`).join(
    "\n"
  );
}
