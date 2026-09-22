// AUTO-GENERATED FILE - DO NOT EDIT.
// Regenerate with `pnpm docs:generate` in the main repo.
// Source: oRPC routers -> OpenAPI spec -> this catalog.

export interface GeneratedParam {
  name: string;
  in: "query" | "path" | "body";
  type: string;
  required?: boolean;
  description: string;
}

export interface GeneratedEndpoint {
  method: string;
  path: string;
  summary: string;
  description: string;
  auth: boolean;
  params: GeneratedParam[];
}

export const GENERATED_ENDPOINTS: GeneratedEndpoint[] = [
  {
    "method": "GET",
    "path": "/voices",
    "summary": "List available voices",
    "description": "Returns all available AI voices for video narration, sorted by popularity. Use the voice `id` as the `voiceId` parameter when generating a video.\n\n**No authentication required.** This is a public endpoint.\n\n**Multilingual support:** All voices are multilingual and work across any language. Set the `language` parameter when generating a video and the voice will speak naturally in that language. The `optimizedFor` field lists languages where the voice has been specifically fine-tuned for best pronunciation and natural delivery.\n\n**Filtering:** Use query parameters to narrow down voices by gender, accent, age, or use case. Combine multiple filters to find the perfect voice.\n\n**For full details and interactive testing, refer to the [API documentation](https://app.aituber.app/api-docs).**",
    "auth": false,
    "params": [
      {
        "name": "gender",
        "in": "query",
        "type": "string",
        "description": "Filter by voice gender. Values: \"male\", \"female\", \"neutral\"."
      },
      {
        "name": "accent",
        "in": "query",
        "type": "string",
        "description": "Filter by accent (case-insensitive). Examples: \"American\", \"British\", \"Australian\", \"Indian\"."
      },
      {
        "name": "age",
        "in": "query",
        "type": "string",
        "description": "Filter by age group. Values: \"young\", \"middle_aged\", \"old\"."
      },
      {
        "name": "useCase",
        "in": "query",
        "type": "string",
        "description": "Filter by recommended use case (case-insensitive). Examples: \"narration\", \"conversational\", \"news\", \"audiobook\", \"social_media\"."
      },
      {
        "name": "language",
        "in": "query",
        "type": "string",
        "description": "Filter to voices optimized for a specific language (ISO 639-1 code). Examples: \"en\", \"es\", \"fr\", \"hi\", \"zh\"."
      },
      {
        "name": "search",
        "in": "query",
        "type": "string",
        "description": "Search voices by name or description (case-insensitive). Examples: \"roger\", \"energetic\", \"calm\"."
      }
    ]
  },
  {
    "method": "GET",
    "path": "/voices/cloned",
    "summary": "List your cloned voices",
    "description": "Returns the voices you cloned in the AITuber dashboard. Use the `voiceId` value as `voiceId` in `POST /videos/generate` to narrate with your own voice. Voice cloning itself happens in the dashboard.",
    "auth": true,
    "params": []
  },
  {
    "method": "GET",
    "path": "/avatars",
    "summary": "List avatars for talking-head videos",
    "description": "Returns every avatar you can use for talking-head videos: built-in avatars available to everyone, plus your own characters.\n\nPass the `id` as `avatarId` in `POST /videos/generate` with `mediaType: \"avatar\"`. Create a new avatar with `POST /elements` (type `character`, with a photo) or in the AITuber dashboard.",
    "auth": true,
    "params": []
  },
  {
    "method": "GET",
    "path": "/elements",
    "summary": "List your elements",
    "description": "Returns your saved elements: people/characters, products/props, and places, plus the built-in ones. Elements carry a real reference photo.\n\n**How to use them:** mention an element in a video script as `@handle` (for example `[@Dhiva holding @Red-Bottle] Meet the founder...`) and its photo is fed to the image model, so the same face or product appears consistently across the whole video. Characters can also be used as `avatarId` for talking-head videos.\n\nCreate new elements with `POST /elements` or in the AITuber dashboard.",
    "auth": true,
    "params": [
      {
        "name": "type",
        "in": "query",
        "type": "`character` \\| `prop` \\| `location`",
        "description": "Filter by element type. Omit for all."
      }
    ]
  },
  {
    "method": "POST",
    "path": "/elements",
    "summary": "Create an element",
    "description": "Saves a reusable element (a person/character, product/prop, or place) with a reference photo.\n\n**Photo source, one of:**\n- `imageUrl`: a public URL; we download and store it.\n- `imageAssetId`: an asset from `POST /uploads` with purpose `element-image`.\n\n**After creating:** mention it in scripts as `@handle` (returned in the response) to put it in faceless videos, or use a character's `id` as `avatarId` for talking-head videos.\n\nThe photo is the single source of truth for how the element looks. Use `description` for context (what it is, when to use it), never for appearance.",
    "auth": true,
    "params": [
      {
        "name": "name",
        "in": "body",
        "type": "string",
        "required": true,
        "description": "Element name, used to build the @handle. Letters, numbers, spaces, and hyphens work best (e.g. \"Dhiva\", \"Red Bottle\")."
      },
      {
        "name": "type",
        "in": "body",
        "type": "`character` \\| `prop` \\| `location`",
        "required": true,
        "description": "`character` = a person or mascot (also usable as an avatar), `prop` = an object or product, `location` = a place."
      },
      {
        "name": "description",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Optional context notes (what it is, when to use it). Do NOT describe appearance; the photo decides how the element looks."
      },
      {
        "name": "imageUrl",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Public URL of the reference photo (JPEG, PNG, or WebP, max 25MB). We download and store it. Use this OR imageAssetId."
      },
      {
        "name": "imageAssetId",
        "in": "body",
        "type": "string (uuid)",
        "required": false,
        "description": "An asset from `POST /uploads` with purpose `element-image`. Use this OR imageUrl."
      }
    ]
  },
  {
    "method": "POST",
    "path": "/uploads",
    "summary": "Upload a media file",
    "description": "Gets a media file into your AITuber library and returns an `assetId` you can pass to other endpoints. Every upload has a `purpose` that says what the file is for; the purpose decides the validation rules and where the asset can be used.\n\n**Two ways to upload:**\n\n**1. From a URL** (easiest, works from AI agents): pass `sourceUrl` and we download the file for you. Only available for small image purposes (not video).\n\n**2. Direct upload** (for local files): pass `contentType` and `fileSizeBytes` and you get back an `uploadUrl`. PUT your file bytes to that URL within 1 hour (set the same Content-Type header), then use the `assetId`.\n\n**Supported purposes:**\n- `background-video-upload`: H.264 MP4, up to 500MB and 10 minutes. Direct upload only. Call POST /uploads/confirm-background-video after PUT.\n- `clip-reference-image`, `clip-reference-video`, `clip-reference-audio`: input files for standalone clip generation. Images allow JPEG, PNG, or WebP up to 25MB. Videos allow MP4, MOV, or WebM up to 200MB. Audio allows MP3, WAV, M4A, AAC, OGG, or WebM up to 50MB. Direct upload only.\n- `rebuild-still`: a Before or After picture for an AI Construction Timelapse (`templateId: \"rebuild\"`). Pass the returned URL as `beforeImageUrl` or `afterImageUrl`. A photo, a drawing, or a render all work. JPEG, PNG, or WebP, max 25MB. URL upload allowed.\n- `element-image`: a reference photo for an element (a person, product, or place). JPEG, PNG, or WebP, max 25MB. URL upload allowed. Use the `assetId` in `POST /elements`.\n- `visual-style-reference`: a picture of a look you want to reuse. JPEG, PNG, or WebP, max 10MB. URL upload allowed. AITuber reads the picture and writes a reusable visual style from it.\n- `ugc-demo`: a product demo video for a UGC hook video. MP4, MOV, or WebM, max 200MB, up to 3 minutes. Direct upload only. Use the `assetId` as `demoVideoAssetId` in `POST /ugc/videos`.\n- `music`: an audio track to score a music video. MP3, WAV, M4A, or AAC, max 50MB. Direct upload only, and `durationSeconds` is REQUIRED. Use the `assetId` as `musicAssetId` in `POST /music-videos`.\n- `voice-sample`: an audio sample for voice cloning. MP3, WAV, M4A, AAC, OGG, or WebM, max 11MB. Direct upload only. Pass the `assetId` to the voice clone endpoint.\n- `document-source`: a PDF to turn into a video. PDF only, max 25MB, up to 100 pages. Direct upload only.\n\nOptional `fileName`: the name of the file you are uploading. We keep it for display, so a PDF shows its own name instead of an id.\n\nUploads that are never attached to anything are deleted after 7 days.",
    "auth": true,
    "params": [
      {
        "name": "purpose",
        "in": "body",
        "type": "`background-video-library-upload` \\| `background-video-upload` \\| `clip-reference-image` \\| `clip-reference-video` \\| `clip-reference-audio` \\| `rebuild-still` \\| `document-source` \\| `element-image` \\| `visual-style-reference` \\| `ugc-demo` \\| `music` \\| `voice-sample` \\| `agent-attachment`",
        "required": true,
        "description": "What this file is for. Only listed purposes are accepted; each unlocks specific endpoints (see the endpoint description)."
      },
      {
        "name": "sourceUrl",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "A public URL to download the file from (image purposes only). Use this OR contentType+fileSizeBytes, not both."
      },
      {
        "name": "contentType",
        "in": "body",
        "type": "`image/jpeg` \\| `image/png` \\| `image/webp` \\| `video/mp4` \\| `video/quicktime` \\| `video/webm` \\| `audio/mpeg` \\| `audio/wav` \\| `audio/mp4` \\| `audio/x-m4a` \\| `audio/aac` \\| `audio/mp3` \\| `audio/wave` \\| `audio/x-wav` \\| `audio/ogg` \\| `audio/webm` \\| `application/pdf`",
        "required": false,
        "description": "The file type for a direct upload. Returns an `uploadUrl` to PUT the bytes to. Must match the purpose (image, video, audio, or document)."
      },
      {
        "name": "fileSizeBytes",
        "in": "body",
        "type": "integer",
        "required": false,
        "description": "The file size in bytes for a direct upload. Max depends on the purpose (25MB images, 200MB video, 50MB audio, 25MB documents)."
      },
      {
        "name": "durationSeconds",
        "in": "body",
        "type": "number",
        "required": false,
        "description": "For video (ugc-demo, 1-180) and audio (music, 1-600) uploads: REQUIRED. The clip or track length in seconds. Used to time the segment."
      },
      {
        "name": "videoWidth",
        "in": "body",
        "type": "integer",
        "required": false,
        "description": "For video uploads (ugc-demo): the pixel width. Recommended so the demo is framed correctly."
      },
      {
        "name": "videoHeight",
        "in": "body",
        "type": "integer",
        "required": false,
        "description": "For video uploads (ugc-demo): the pixel height. Recommended so the demo is framed correctly."
      },
      {
        "name": "fileName",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "The name of the file, for display (document-source shows it instead of an id). Directory parts are dropped."
      }
    ]
  },
  {
    "method": "GET",
    "path": "/ugc/reactions",
    "summary": "List UGC reaction clips",
    "description": "Returns short clips of a person reacting to camera, split into `system` (the built-in library) and `custom` (reactions you generated). Pick one by `id` and use it as `reactionId` in `POST /ugc/videos` to build a finished UGC hook video. The name and tags describe the person and the reaction, so you can choose one that fits your hook. For your own reactions, check `status` (`pending`, `processing`, `completed`, or `failed`); built-in reactions are always ready.",
    "auth": true,
    "params": []
  },
  {
    "method": "POST",
    "path": "/ugc/reactions",
    "summary": "Generate a UGC reaction clip",
    "description": "Generates a short clip of your character reacting to camera, using image-to-video AI. The character is one of your `character` elements (create one with `POST /elements`).\n\n**Flow:** create the reaction, then poll `GET /ugc/reactions/{id}` until `status` is `completed`. The finished clip also appears in `GET /ugc/reactions` and can be used as `reactionId` in `POST /ugc/videos`.\n\n**Cost:** by quality (see the response `creditsUsed`). Credits are refunded automatically if generation fails.\n\nRequires an active paid subscription.",
    "auth": true,
    "params": [
      {
        "name": "avatarImageUrl",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Dashboard use only. Public callers pass `elementId` instead; an avatarImageUrl from the public API must be an AITuber-hosted asset URL."
      },
      {
        "name": "elementId",
        "in": "body",
        "type": "string (uuid)",
        "required": false,
        "description": "The character element to react. Get IDs from `GET /elements` (type `character`) or create one with `POST /elements`."
      },
      {
        "name": "avatarId",
        "in": "body",
        "type": "string (uuid)",
        "required": false,
        "description": "Legacy avatar ID. Prefer `elementId`."
      },
      {
        "name": "reactionPrompt",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Direct control over the reaction, e.g. \"shocked, eyes wide, leaning back\". Provide this OR hookText."
      },
      {
        "name": "hookText",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "The hook the character is reacting to. The AI turns it into a fitting expression. Provide this OR reactionPrompt."
      },
      {
        "name": "quality",
        "in": "body",
        "type": "`good` \\| `premium`",
        "required": false,
        "description": "Generation quality. `premium` costs more and looks better."
      }
    ]
  },
  {
    "method": "GET",
    "path": "/ugc/reactions/{id}",
    "summary": "Get a reaction clip",
    "description": "Returns a reaction you generated. Poll every 10-15 seconds after `POST /ugc/reactions` until `status` is `completed` (then use `videoUrl` or the `id` as `reactionId` in `POST /ugc/videos`) or `failed` (credits are refunded automatically).",
    "auth": true,
    "params": [
      {
        "name": "id",
        "in": "path",
        "type": "string (uuid)",
        "required": true,
        "description": "Reaction ID from `POST /ugc/reactions`."
      }
    ]
  },
  {
    "method": "POST",
    "path": "/ugc/videos",
    "summary": "Create a UGC hook video",
    "description": "Builds a finished UGC-style hook video: a person reaction clip with your hook text on top, optionally followed by your product demo video.\n\n**Inputs:**\n- `reactionId`: a clip from `GET /ugc/reactions` (built-in or one you generated).\n- `hookText`: the on-screen hook (5-200 characters).\n- `demoVideoAssetId` (optional): a product demo video uploaded with `POST /uploads` (purpose `ugc-demo`).\n\nReturns a `videoId`. This one is ready immediately (`status: completed`); export it with `POST /exports` and download with `GET /exports/download`, or publish it.\n\n**Cost:** flat fee (see `creditsUsed`). Requires an active paid subscription.",
    "auth": true,
    "params": [
      {
        "name": "hookText",
        "in": "body",
        "type": "string",
        "required": true,
        "description": "The on-screen hook text (5-200 characters)."
      },
      {
        "name": "reactionId",
        "in": "body",
        "type": "string (uuid)",
        "required": false,
        "description": "A reaction clip from `GET /ugc/reactions`."
      },
      {
        "name": "ugcVideoId",
        "in": "body",
        "type": "string (uuid)",
        "required": false,
        "description": "Dashboard alias for `reactionId`. Public callers use `reactionId`."
      },
      {
        "name": "demoVideoAssetId",
        "in": "body",
        "type": "string (uuid)",
        "required": false,
        "description": "Optional product demo video, uploaded via `POST /uploads` (purpose `ugc-demo`). Plays after the reaction."
      },
      {
        "name": "demoVideoUrl",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Dashboard use only. Public callers pass `demoVideoAssetId` instead."
      },
      {
        "name": "demoDurationSeconds",
        "in": "body",
        "type": "number",
        "required": false,
        "description": "Dashboard use only. Required when `demoVideoUrl` is set."
      },
      {
        "name": "demoVideoWidth",
        "in": "body",
        "type": "integer",
        "required": false,
        "description": "Dashboard use only."
      },
      {
        "name": "demoVideoHeight",
        "in": "body",
        "type": "integer",
        "required": false,
        "description": "Dashboard use only."
      },
      {
        "name": "hookTextPosition",
        "in": "body",
        "type": "`top` \\| `center` \\| `bottom`",
        "required": false,
        "description": "Where the hook text sits."
      },
      {
        "name": "aspectRatio",
        "in": "body",
        "type": "`9:16` \\| `16:9` \\| `1:1`",
        "required": false,
        "description": "Video dimensions."
      },
      {
        "name": "backgroundMusicId",
        "in": "body",
        "type": "string (uuid)",
        "required": false,
        "description": "Dashboard use only. Background music track ID."
      },
      {
        "name": "backgroundMusicVolume",
        "in": "body",
        "type": "number",
        "required": false,
        "description": "Dashboard use only. Background music volume (0-100)."
      },
      {
        "name": "captionStyleId",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Caption style ID from `GET /caption-styles`. Default: \"tiktok\"."
      },
      {
        "name": "title",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Optional video title."
      }
    ]
  },
  {
    "method": "POST",
    "path": "/music",
    "summary": "Generate a song",
    "description": "Generates an original song from a text prompt using AI. Use it as the soundtrack for a music video (`POST /music-videos`), or download it once ready.\n\n**Flow:** create the song, then poll `GET /music/{id}` until `status` is `completed` (usually 30-90 seconds). The finished track also appears in `GET /music` and can be used as `musicId` in `POST /music-videos`.\n\n**Modes:**\n- Simple (default): describe the song in `prompt` and the AI writes everything (style, and lyrics unless `instrumental`).\n- Custom (`customMode: true`): you control `style`, `title`, and `lyrics` directly. `prompt` is ignored for the words.\n\n**Cost:** a flat fee per song (see the response `creditsUsed`). Credits are refunded automatically if generation fails.",
    "auth": true,
    "params": [
      {
        "name": "prompt",
        "in": "body",
        "type": "string",
        "required": true,
        "description": "What the song should be about or sound like, e.g. \"an upbeat indie pop track about summer road trips\". In custom mode this is optional context; the words come from `lyrics` and the sound from `style`."
      },
      {
        "name": "instrumental",
        "in": "body",
        "type": "boolean",
        "required": false,
        "description": "Set true for a track with no vocals or lyrics."
      },
      {
        "name": "customMode",
        "in": "body",
        "type": "boolean",
        "required": false,
        "description": "Set true to control `style`, `title`, and `lyrics` yourself instead of letting the AI decide from `prompt`."
      },
      {
        "name": "style",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Custom mode only: the musical style, e.g. \"lo-fi hip hop, mellow, jazzy piano\"."
      },
      {
        "name": "title",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Custom mode only: the song title."
      },
      {
        "name": "lyrics",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Custom mode only: the exact lyrics to sing. Ignored when `instrumental` is true."
      }
    ]
  },
  {
    "method": "GET",
    "path": "/music",
    "summary": "List songs",
    "description": "Lists tracks in your music library: songs you generated with `POST /music` and audio you uploaded with `POST /uploads` (purpose `music`). Pick one to score a music video: use a generated song as `musicId` or an uploaded track as `musicAssetId` in `POST /music-videos`.",
    "auth": true,
    "params": []
  },
  {
    "method": "GET",
    "path": "/music/{id}",
    "summary": "Get a song",
    "description": "Returns a song you generated. Poll every 10-15 seconds after `POST /music` until `status` is `completed` (then use `audioUrl`, or the `id` as `musicId` in `POST /music-videos`) or `failed` (credits are refunded automatically).",
    "auth": true,
    "params": [
      {
        "name": "id",
        "in": "path",
        "type": "string (uuid)",
        "required": true,
        "description": "Song ID from `POST /music`."
      }
    ]
  },
  {
    "method": "POST",
    "path": "/music-videos",
    "summary": "Create a music video",
    "description": "Builds a music video: your song plus AI visuals, synced captions, and an optional waveform.\n\n**Pick the song (exactly one):**\n- `musicId`: a completed song from `POST /music` (see `GET /music`).\n- `musicAssetId`: a track you uploaded with `POST /uploads` (purpose `music`).\n\n**Pick the visuals with `visualMode`:**\n- `ai-images`: AI generates a new image every few seconds (set `secondsPerImage`).\n- `ai-video`: AI generates short video clips across the song.\n- `cover-image`: a single still image for the whole song (requires `coverImageAssetId`).\n\nReturns a `videoId` (a video). Poll `GET /videos/{id}` until `status` is `completed`, then export it with `POST /exports` and download with `GET /exports/download`, or publish it.\n\n**Cost:** depends on the visual mode, quality, and song length (see the response `estimatedCredits`). Credits are refunded automatically if generation fails.",
    "auth": true,
    "params": [
      {
        "name": "musicId",
        "in": "body",
        "type": "string (uuid)",
        "required": false,
        "description": "A completed song from `POST /music`. Provide this OR `musicAssetId`, not both."
      },
      {
        "name": "musicAssetId",
        "in": "body",
        "type": "string (uuid)",
        "required": false,
        "description": "A track uploaded with `POST /uploads` (purpose `music`). Provide this OR `musicId`, not both."
      },
      {
        "name": "visualMode",
        "in": "body",
        "type": "`ai-images` \\| `ai-video` \\| `cover-image`",
        "required": true,
        "description": "`ai-images` (a new AI image every few seconds), `ai-video` (short AI clips), or `cover-image` (one still for the whole song)."
      },
      {
        "name": "visualDirection",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Optional art direction for the visuals, e.g. \"neon cyberpunk city at night, moody\". Mention a saved element by @handle (see `GET /elements`) to reuse it, e.g. \"@Robo-Cat on a rooftop\". Its photo is fed to the image model so it looks the same in every scene it appears in. Each mentioned element adds a reference charge per scene for `ai-images`."
      },
      {
        "name": "imageStyleId",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Image style for `ai-images`/`ai-video`. Get IDs from `GET /image-styles`."
      },
      {
        "name": "imageQuality",
        "in": "body",
        "type": "`basic` \\| `good` \\| `premium` \\| `max`",
        "required": false,
        "description": "Image quality for `ai-images` (higher costs more)."
      },
      {
        "name": "secondsPerImage",
        "in": "body",
        "type": "number",
        "required": false,
        "description": "For `ai-images`: how many seconds each image is shown. Fewer seconds means more images and more credits."
      },
      {
        "name": "videoQuality",
        "in": "body",
        "type": "`basic` \\| `good` \\| `premium` \\| `max`",
        "required": false,
        "description": "Clip quality for `ai-video` (higher costs more)."
      },
      {
        "name": "coverImageAssetId",
        "in": "body",
        "type": "string (uuid)",
        "required": false,
        "description": "For `cover-image` mode: an image uploaded with `POST /uploads` (purpose `element-image`). Required for that mode."
      },
      {
        "name": "aspectRatio",
        "in": "body",
        "type": "`9:16` \\| `16:9` \\| `1:1`",
        "required": false,
        "description": "Video dimensions."
      },
      {
        "name": "captionsEnabled",
        "in": "body",
        "type": "boolean",
        "required": false,
        "description": "Show word-synced lyric captions. Automatically off for instrumental tracks."
      },
      {
        "name": "captionStyleId",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Caption style ID from `GET /caption-styles`."
      },
      {
        "name": "captionPosition",
        "in": "body",
        "type": "`top` \\| `center` \\| `bottom`",
        "required": false,
        "description": "Where captions sit on screen."
      },
      {
        "name": "showWaveform",
        "in": "body",
        "type": "boolean",
        "required": false,
        "description": "Show an audio waveform animation."
      },
      {
        "name": "musicTrimStartSeconds",
        "in": "body",
        "type": "number",
        "required": false,
        "description": "Start the video at this point in the song (seconds). Defaults to the start."
      },
      {
        "name": "musicTrimEndSeconds",
        "in": "body",
        "type": "number",
        "required": false,
        "description": "End the video at this point in the song (seconds). Defaults to the full length."
      }
    ]
  },
  {
    "method": "POST",
    "path": "/ideas",
    "summary": "Get video topic ideas for a niche",
    "description": "Generates a list of specific, viral-style video topic ideas for a niche or audience. Use an idea as the `script` in `POST /videos/generate` with `inputType: \"idea\"`, or expand it first with `POST /scripts`.\n\n**Cost:** 2 credits per call.",
    "auth": true,
    "params": [
      {
        "name": "prompt",
        "in": "body",
        "type": "string",
        "required": true,
        "description": "The niche, audience, or theme to brainstorm for. Example: \"space facts for a faceless YouTube Shorts channel\"."
      },
      {
        "name": "language",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Language for the ideas (ISO 639-1 code like \"en\", \"es\", \"hi\"). Default: \"en\"."
      },
      {
        "name": "count",
        "in": "body",
        "type": "number",
        "required": false,
        "description": "How many ideas to generate (5-15). Default: 10."
      },
      {
        "name": "source",
        "in": "body",
        "type": "`tool_page` \\| `inline`",
        "required": false,
        "description": "Where the request came from, for analytics only. Dashboard use; safe to omit."
      },
      {
        "name": "templateId",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Creation template the request came from, for analytics only. Dashboard use; safe to omit."
      }
    ]
  },
  {
    "method": "POST",
    "path": "/scripts",
    "summary": "Write a video script from a topic",
    "description": "Generates 2 distinct narration script variations for a topic, sized to your target duration. Pick the one you like (or edit it) and pass it to `POST /videos/generate` as the `script` with `inputType: \"script\"`.\n\n**Cost:** 1 credit per minute of target duration (minimum 1 credit).",
    "auth": true,
    "params": [
      {
        "name": "prompt",
        "in": "body",
        "type": "string",
        "required": true,
        "description": "The topic or idea to write a script about. Example: \"5 mind-blowing facts about the deep ocean\"."
      },
      {
        "name": "duration",
        "in": "body",
        "type": "number",
        "required": true,
        "description": "Target video duration in seconds (15-1200). The script length is sized so narration fits this duration."
      },
      {
        "name": "language",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Language for the script (ISO 639-1 code like \"en\", \"es\", \"hi\"). Default: English."
      },
      {
        "name": "source",
        "in": "body",
        "type": "`tool_page` \\| `inline`",
        "required": false,
        "description": "Where the request came from, for analytics only. Dashboard use; safe to omit."
      },
      {
        "name": "templateId",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Creation template the request came from, for analytics only. Dashboard use; safe to omit."
      }
    ]
  },
  {
    "method": "GET",
    "path": "/image-styles",
    "summary": "List image styles",
    "description": "Returns every image style you can use as `imageStyleId` in `POST /videos/generate` (when `mediaType` is `images`): the built-in styles, curated template styles (ids like `medical-xray`, made for `templateId: \"medical\"`), plus any custom styles created in the AITuber dashboard.",
    "auth": true,
    "params": []
  },
  {
    "method": "GET",
    "path": "/caption-styles",
    "summary": "List caption styles",
    "description": "Returns every caption style you can use as `captionStyleId` in `POST /videos/generate`: the built-in styles plus any custom styles created in the AITuber dashboard.",
    "auth": true,
    "params": []
  },
  {
    "method": "POST",
    "path": "/videos/generate",
    "summary": "Create a new video",
    "description": "Starts generating a new AI video from a script, an idea, or the text of an article or document. The video is created in the background and typically takes 1-3 minutes depending on length and media type.\n\n**Three ways to create a video:**\n\n**1. From a script** (you write the narration):\n```json\n{\n  \"script\": \"The human brain is the most complex organ in the body. It contains roughly 86 billion neurons, each connected to thousands of others. Every thought, memory, and emotion is the result of electrical signals racing through this incredible network.\",\n  \"voiceId\": \"nPczCjzI2devNBz1zQrb\",\n  \"imageStyleId\": \"cinematic\"\n}\n```\n\n**2. From an idea** (AI writes the script for you):\n```json\n{\n  \"script\": \"5 mind-blowing facts about black holes\",\n  \"inputType\": \"idea\",\n  \"expectedDurationSeconds\": 60\n}\n```\n\n**3. From a source** (LIMITED PREVIEW, returns 403 until it opens to all accounts). You send the text of an article or a document, the AI writes a short video script from it:\n```json\n{\n  \"script\": \"<the full text of the article or document>\",\n  \"inputType\": \"source\",\n  \"expectedDurationSeconds\": 60,\n  \"source\": { \"kind\": \"url\", \"title\": \"Why the ocean is loud\" }\n}\n```\nThe script stays faithful to the text you send. Nothing is invented. Use this for a blog post, a news story, a report, or a PDF you already turned into text.\n\n**Or let us read the page for you.** Send the link instead of the text and we fetch and read it while the video is being made:\n```json\n{\n  \"inputType\": \"source\",\n  \"expectedDurationSeconds\": 60,\n  \"source\": { \"kind\": \"url\", \"url\": \"https://example.com/why-the-ocean-is-loud\", \"mode\": \"summarize\" }\n}\n```\nThe same works for a PDF you uploaded: `{ \"kind\": \"document\", \"assetId\": \"<id>\" }`. The page must be public. If it cannot be read, the video fails and the credits go back.\n\n**Workflow after calling this endpoint:**\n1. You receive a `videoId` with `status: \"pending\"`.\n2. Poll `GET /videos/{videoId}` every 5-10 seconds.\n3. When `status` changes to `completed`, the video is ready.\n4. Call `POST /exports` to render the MP4, then `GET /exports/download` to get the file.\n\n**Credit cost:** Depends on media type, duration, and quality tier. A typical 60-second video with basic quality costs about 50 credits. Check your balance with `GET /subscription` before generating.",
    "auth": true,
    "params": [
      {
        "name": "thumbnail",
        "in": "body",
        "type": "object",
        "required": false,
        "description": ""
      },
      {
        "name": "thumbnail.instructions",
        "in": "body",
        "type": "string",
        "required": false,
        "description": ""
      },
      {
        "name": "script",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "The content for your video. How this field is used depends on `inputType`.\n\n**Script mode** (`inputType: \"script\"`, default): Provide the exact narration text. This is what the voice will speak word-for-word. Must be at least 5 words. Max 30,000 characters (enough for a 20-minute video at normal voice speed). The AI automatically splits it into visual segments and generates matching visuals.\n\n**Visual control:** By default, the AI decides what visuals to show for each part of your narration. For more control, add visual instructions in brackets before each narration segment:\n\n`[A dark forest at night] The wind howled through the trees. [Glowing eyes peering from shadows] Something was watching.`\n\nEach `[bracketed text]` tells the AI exactly what to show for that scene. The text after it is the voiceover.\n\n**Put a real person, product, or place in the video (@mentions):** reference a saved element by its handle, e.g. `[@Dhiva holding @Red-Bottle] Meet the founder who started it all.` The element's reference photo is fed to the image model so the same face or product appears consistently across the whole video. Get handles from `GET /elements`; create new elements with `POST /elements`. Rules: works with `mediaType` `images` and `video`; not with `stock`. The photo decides how the element looks; never describe its appearance in the script. Mentions are spoken as the plain name (the `@` is never read aloud), and unknown handles are treated as plain words.\n\n**Idea mode** (`inputType: \"idea\"`): Provide a short topic or concept. The AI writes a full narration script for you. Keep it under 800 characters. Pair with `expectedDurationSeconds` to control video length.\n\n**Source mode** (`inputType: \"source\"`): Provide the TEXT of an article, a web page, or a document. It is not the narration. The AI reads it and writes a short narration script from it, faithful to it. Max 200,000 characters. Pair with `expectedDurationSeconds` (required) to set the script length, and with the `source` object to say where the text came from.\n\n**You can skip this field in source mode** by sending `source.url` (a web page) or `source.assetId` (a PDF you uploaded) instead. We then fetch and read the page or the file while the video is being made, so you do not have to read it yourself.\n\nSupports any language. The voice will speak naturally in whatever language the text is written in."
      },
      {
        "name": "inputType",
        "in": "body",
        "type": "`script` \\| `idea` \\| `source`",
        "required": false,
        "description": "How to interpret the `script` field.\n\n- `script` (default): Your text is the exact narration. You control every word that is spoken.\n- `idea`: You provide a topic and the AI writes an engaging narration script for you. Use `expectedDurationSeconds` to control the target length.\n- `source`: Here is the text of an article or a document. Write a short video script from it. The AI keeps to that text and invents nothing. `expectedDurationSeconds` is required, because it sets how long the script is. Send `source.url` or `source.assetId` to have us read the page or the PDF for you, or send the text yourself in `script`."
      },
      {
        "name": "source",
        "in": "body",
        "type": "object",
        "required": false,
        "description": "Where the source text comes from. Only allowed with `inputType: \"source\"`; sending it with any other `inputType` returns a 400.\n\nTwo ways to use it: send `url` or `assetId` and we read the page or the file ourselves (then `script` is not needed), or read the page yourself and send the text in `script`."
      },
      {
        "name": "source.kind",
        "in": "body",
        "type": "`url` \\| `document`",
        "required": false,
        "description": "Where the text comes from: `url` for a web page, `document` for a file you uploaded."
      },
      {
        "name": "source.url",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "The web page to read. Use with `kind: \"url\"`. Send this INSTEAD of `script` and we fetch the page while the video is being made. The page must be public; a page that needs a login cannot be read."
      },
      {
        "name": "source.assetId",
        "in": "body",
        "type": "string (uuid)",
        "required": false,
        "description": "The uploaded PDF to read. Use with `kind: \"document\"`. Send this INSTEAD of `script` and we read the file while the video is being made. Upload the file first to get this id."
      },
      {
        "name": "source.mode",
        "in": "body",
        "type": "`summarize` \\| `read-out`",
        "required": false,
        "description": "What to do with the text.\n\n- `summarize` (default): the AI writes a short narration from the text, faithful to it, about `expectedDurationSeconds` long.\n- `read-out`: the text itself is the narration, word for word. Nothing is rewritten and no AI writing step runs. `expectedDurationSeconds` is the CEILING here: text longer than that is cut at a sentence end, so the video never runs past the length you asked for."
      },
      {
        "name": "source.title",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Title of the page or the document, when you know it. Ignored when we read the page ourselves."
      },
      {
        "name": "source.instructions",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "What you want done with the source, e.g. \"focus on the cost section\" or \"keep it upbeat\". Max 600 characters."
      },
      {
        "name": "backgroundVideoId",
        "in": "body",
        "type": "string (uuid)",
        "required": false,
        "description": "For background mode: an id from GET /background-videos. One clip repeats under the full narration; source audio is muted."
      },
      {
        "name": "mediaType",
        "in": "body",
        "type": "`images` \\| `video` \\| `stock` \\| `background` \\| `avatar`",
        "required": false,
        "description": "The type of visuals for your video. Each produces a different look and feel.\n\n- `images` (default): AI generates a unique image for each segment, displayed with smooth Ken Burns pan/zoom animation. This is the classic \"faceless narration video\" style used by top YouTube channels. Most popular and cheapest option. Control the look with `imageQuality` and `imageStyleId`.\n- `video`: AI generates short video clips for each segment. More dynamic and cinematic than images, but costs more credits. Also used internally by the `skeleton` and `character` templates.\n- `stock`: Automatically finds and matches real stock footage to each segment. Great for news, educational, and documentary-style content.\n- `avatar`: A talking-head video where an avatar speaks your script. **Requires `avatarId` (from `GET /avatars`) and `voiceId`.** Script mode only (no idea mode), max 5 minutes, aspect ratio `9:16` or `16:9`. Costs ~480 credits per minute of video plus narration, far more than other media types. Generation also takes longer (usually 3-10 minutes).\n\n**For most use cases, leave this as default (`images`) unless you are using a template.** When using `templateId`, the template automatically selects the best media type for you, so you do not need to set `mediaType` separately."
      },
      {
        "name": "avatarId",
        "in": "body",
        "type": "string (uuid)",
        "required": false,
        "description": "**Required when `mediaType` is `\"avatar\"`.** The avatar that speaks your script. Get valid IDs from `GET /avatars` (built-in avatars plus characters created in the dashboard). Ignored for other media types."
      },
      {
        "name": "motionPrompt",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Optional direction for how the avatar moves and gestures, e.g. \"excited, talking with hands, leaning toward the camera\". Only applies when `mediaType` is `\"avatar\"`."
      },
      {
        "name": "voiceId",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "The voice ID for narration. Browse all 1,300+ available voices and listen to previews at `GET /voices`, or use one of your cloned voices from `GET /voices/cloned`.\n\nIf omitted, defaults to \"Adam\", a deep, natural American male voice. **Exception: required when `mediaType` is `\"avatar\"`** (no default; pick a voice that fits the avatar, or use its `defaultVoiceId` from `GET /avatars`).\n\nFilter voices by gender, accent, or use case using the `GET /voices` endpoint query parameters. Use the `previewUrl` from each voice to hear a sample before selecting."
      },
      {
        "name": "voiceSpeed",
        "in": "body",
        "type": "number",
        "required": false,
        "description": "Narration speed multiplier. Range: 0.7 to 1.2.\n\n- `0.7`: 30% slower. Great for educational, meditation, or non-native audiences.\n- `1.0` (default): Natural speed.\n- `1.2`: 20% faster. Great for energetic, hype, or fast-paced content.\n\nMost creators use values between 0.9 and 1.1."
      },
      {
        "name": "aspectRatio",
        "in": "body",
        "type": "`9:16` \\| `16:9` \\| `1:1`",
        "required": false,
        "description": "Video dimensions. Choose based on where you plan to publish.\n\n- `9:16` (default): Vertical/portrait. Best for YouTube Shorts, TikTok, and Instagram Reels.\n- `16:9`: Horizontal/landscape. Best for standard YouTube videos and presentations.\n- `1:1`: Square. Best for Instagram feed posts and LinkedIn. Not available for `mediaType: \"avatar\"`."
      },
      {
        "name": "expectedDurationSeconds",
        "in": "body",
        "type": "number",
        "required": false,
        "description": "Target video duration in seconds. **Required when `inputType` is `\"idea\"`** so the AI knows how long a script to write.\n\nExamples: `30` for a 30-second Short, `60` for a 1-minute video, `180` for a 3-minute video, `600` for a 10-minute video, `1200` for a 20-minute video.\n\n**Max varies by template:**\n- Default faceless template (no `templateId`): **1200 seconds (20 minutes)**\n- `templateId: \"skeleton\"` or `templateId: \"character\"`: **420 seconds (7 minutes)** (these templates have different cost profiles and are not designed for long-form content)\n- `templateId: \"rebuild\"`: **60 seconds (1 minute)**\n\n**Also required when `inputType` is `\"source\"`**, in both source modes. With `source.mode: \"summarize\"` it is the TARGET: the AI writes a script about that long. With `source.mode: \"read-out\"` it is the CEILING: the text is read word for word, and anything past that length is cut at a sentence end.\n\nPassing a value above the template-specific cap returns a 400 error. Ignored when `inputType` is `\"script\"` because the duration is determined by the word count."
      },
      {
        "name": "imageQuality",
        "in": "body",
        "type": "`basic` \\| `good` \\| `premium` \\| `max`",
        "required": false,
        "description": "Image generation quality tier. Only applies when `mediaType` is `\"images\"`. Higher quality produces more detailed, accurate images but costs more credits per image.\n\n- `basic` (default): 1 credit/image. Fast generation. Good for testing and drafts.\n- `good`: 5 credits/image. Better detail and accuracy. Good for most published content.\n- `premium`: 10 credits/image. High detail, very accurate to the script. Great for professional content.\n- `max`: 20 credits/image. Maximum quality. Best for high-production content.\n\nA typical 60-second video has 15-18 images (one every 3-5 seconds), so factor that into credit calculations.\n\nEvery tier can use the reference photo of an @mentioned saved element. Each photo used in a scene adds 3 credits to that scene, on top of the tier price above."
      },
      {
        "name": "imageStyleId",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Visual art style for AI-generated images. Only applies when `mediaType` is `\"images\"`. Each style applies a consistent aesthetic across all images in your video.\n\n**Realistic:**\n- `photorealistic` (default): Hyperrealistic photography, DSLR quality.\n- `cinematic`: 35mm film look, dramatic lighting, movie still aesthetic.\n- `vintage-retro`: 1980s VHS aesthetic, neon colors, synthwave vibes.\n- `noir`: Classic black and white film noir, dramatic shadows.\n\n**Illustrated:**\n- `3d-pixar`: 3D Pixar-style cartoon, smooth rounded shapes.\n- `anime`: Japanese anime/manga style, cel-shaded, vibrant colors.\n- `digital-art`: Professional concept art, Artstation quality.\n- `comic-book`: American comic book, bold outlines, halftone shading.\n\n**Artistic:**\n- `pencil-sketch`: Detailed graphite pencil drawing on textured paper.\n- `oil-painting`: Classical oil painting with visible brushstrokes.\n- `watercolor`: Soft watercolor with translucent color washes.\n- `pop-art`: Andy Warhol style, bold primary colors.\n\n**Modern:**\n- `kurzgesagt`: Flat vector educational style (like the YouTube channel).\n- `pixel-art`: Retro 16-bit video game aesthetic.\n- `minimalist`: Clean, simple, lots of white space.\n- `claymation`: Stop-motion clay animation, Aardman-inspired.\n\nAnd 11 more styles. Combine with `imageStyleCustom` for fine-tuning."
      },
      {
        "name": "captionStyleId",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Caption (subtitle) visual style. Captions are rendered directly onto the video with word-by-word timing sync.\n\n**Built-in styles:**\n- `wrap-1` (default): Active word highlight with 2-word groups. Most popular style.\n- `hormozi`: Bold uppercase with yellow highlight on black pill. Alex Hormozi inspired.\n- `beast`: Bold Bangers font with letter-spacing bounce animation. MrBeast inspired.\n- `noah`: Bold italic Oswald with colored highlight.\n- `handwritten`: Organic casual style with handwriting font. Personal and authentic.\n- `subtitle`: Clean streaming-style subtitles on a dark bar. Professional and readable.\n- `impact`: Massive bold text, one word at a time. Maximum emphasis.\n- `pop`: Playful spring animation with bouncy words. Fun and energetic.\n- `chronicle`: Ancient serif for history, mythology, and epic stories.\n- `cyber`: Futuristic neon style for sci-fi, tech, and cyberpunk content.\n- `grit`: Raw marker style for true crime, street, and intense stories.\n- `luxe`: Elegant serif for luxury, fashion, and celebrity content.\n- `terminal`: Monospace style for tech, hacker, and AI content.\n\nYou can also create custom caption styles with your own fonts, colors, and animations via the [AITuber dashboard](https://app.aituber.app/dashboard). Use the custom style ID here."
      },
      {
        "name": "captionsEnabled",
        "in": "body",
        "type": "boolean",
        "required": false,
        "description": "Whether to show captions (subtitles) on the video. Default: `true`.\n\nCaptions are auto-synced word-by-word to the narration. We strongly recommend keeping captions on as they significantly boost engagement, accessibility, and watch time. Set to `false` only for music-only or ambient videos."
      },
      {
        "name": "captionPosition",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Vertical position of captions on the video.\n\n- `bottom` (default): Captions at the bottom of the screen.\n- `center`: Captions in the middle of the screen.\n- `top`: Captions at the top of the screen.\n\nNot supported for `mediaType: \"avatar\"` (avatar captions always use the default position)."
      },
      {
        "name": "videoQuality",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Video clip generation quality. Only applies when `mediaType` is `\"video\"`.\n\n- `basic`: Fastest generation, lower visual quality.\n- `good` (default): Good balance of quality and speed.\n- `premium`: High quality video clips. Slower generation.\n- `max`: 1080p clips, the sharpest we make. Costs the most per second."
      },
      {
        "name": "templateId",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Specialized video template that applies a specific visual format and style. Leave empty for standard faceless narration videos (the default).\n\n**Available templates:**\n- `skeleton`: \"What happens if...\" style educational videos with skeleton/X-ray visuals. Uses AI video generation internally. Popular viral format on YouTube Shorts. Example script: `\"What happens if you eat only ice cream for 30 days\"`.\n- `medical`: Medical animation videos with scientifically accurate anatomy, for health education, patient explainers, and clinic content. Works with `mediaType` `images` (default) or `video` only (no stock: stock libraries carry no anatomy footage). Optional curated styles via `imageStyleId`: `medical-3d` (realistic 3D), `medical-translucent` (see-through body), `medical-xray`, `medical-darkstudio` (organ on black), `medical-cartoon` (patient-friendly), or omit for auto. Example idea: `\"How a total knee replacement works, step by step\"`.\n- `character`: Character-driven animated videos. AI generates a consistent character across all scenes and animates them. Uses AI video generation internally. Example script: `\"A robot learns what friendship means on its first day at school\"`.\n- `rebuild`: AI Construction Timelapse. One place changing from messy or empty to finished, in a single locked shot: the camera never moves, so the viewer compares the same frame from the first second to the last. No voiceover and no captions. You hear the sounds of the work, and background music is added over the whole video. The last few seconds always show the finished place in use rather than standing empty. Duration 15-60 seconds. Works from a prompt alone, from `beforeImageUrl` and `afterImageUrl`, or from any mix. The prompt must describe a PHYSICAL PLACE that changes; a lecture, a joke, or a product review is rejected. Example idea: `\"A dirty canal becomes a park with paths and lights\"`.\n\n**Important:** When you set a template, it handles the visual settings for you; just provide your `script` (or `inputType: \"idea\"` with a topic). `skeleton`, `character`, and `rebuild` also pin `mediaType` automatically. `medical` keeps `mediaType` open: send `images` (default) or `video`; sending `stock` returns a 400.\n\nFor talking-head avatar videos, do NOT use a template: set `mediaType: \"avatar\"` with an `avatarId` instead."
      },
      {
        "name": "beforeImageUrl",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Public HTTPS image URL used as the FIRST FRAME for `templateId: \"rebuild\"`. The video starts on this picture and the camera stays at its angle throughout. The place does not have to exist: a photo, a drawing, or a render all work. Uploaded pictures are free and replace a still we would have generated, so they lower the credit cost. Optional. Ignored on other templates."
      },
      {
        "name": "afterImageUrl",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Public HTTPS image URL used as the LAST FRAME for `templateId: \"rebuild\"`. The video ends on this picture, at the same camera angle as the rest. Often a render or a drawing of the finished build rather than a photograph, which is fine. Uploaded pictures are free and replace a still we would have generated. Optional. Ignored on other templates."
      }
    ]
  },
  {
    "method": "GET",
    "path": "/videos",
    "summary": "List your videos",
    "description": "Returns all videos for your organization, sorted newest first. Use this to browse your video library, check generation statuses, or find a video to export/publish.\n\n**Polling for generation status:** After calling `POST /generate`, poll this endpoint or `GET /videos/{id}` until `status` changes from `processing` to `completed` or `failed`. Typical generation takes 1-3 minutes.",
    "auth": true,
    "params": [
      {
        "name": "limit",
        "in": "query",
        "type": "number",
        "description": "Maximum number of videos to return per page. Default: 50, max: 100."
      },
      {
        "name": "cursor",
        "in": "query",
        "type": "string (uuid)",
        "description": "Pagination cursor: the `id` of the LAST video from the previous page. Returns videos older than that one. Omit for the first page. An empty array means there are no more videos."
      }
    ]
  },
  {
    "method": "GET",
    "path": "/videos/{id}",
    "summary": "Get a video by ID",
    "description": "Returns details for a single video. Use this to check generation status after creating a video.\n\n**Polling pattern:** After `POST /generate`, poll this endpoint every 5-10 seconds until `status` is `completed` or `failed`. Typical generation takes 1-3 minutes depending on video length and media type.",
    "auth": true,
    "params": [
      {
        "name": "id",
        "in": "path",
        "type": "string (uuid)",
        "required": true,
        "description": "The video ID returned from `POST /generate` or `GET /videos`."
      }
    ]
  },
  {
    "method": "DELETE",
    "path": "/videos/{id}",
    "summary": "Delete a video",
    "description": "Permanently deletes a video and its generated assets. This cannot be undone. Credits spent on generation are not refunded.",
    "auth": true,
    "params": [
      {
        "name": "id",
        "in": "path",
        "type": "string (uuid)",
        "required": true,
        "description": "The video ID to delete."
      }
    ]
  },
  {
    "method": "GET",
    "path": "/clip-models",
    "summary": "List clip generation models",
    "description": "Returns the AI video models available for standalone clip generation, with their capabilities (text-to-video, image-to-video, reference images), supported aspect ratios, resolutions, duration limits, and credit cost per second by resolution. Pick a `modelKey` for `POST /clips`.",
    "auth": true,
    "params": []
  },
  {
    "method": "POST",
    "path": "/clips",
    "summary": "Generate a standalone AI video clip",
    "description": "Starts generating a single AI video clip (1-30 seconds) from a text prompt, an image, or both. This is different from `POST /videos/generate`: no narration, no captions, just one raw clip.\n\n**Flow:** pick a model from `GET /clip-models`, create the clip, then poll `GET /clips/{id}` until `status` is `completed` and download from `outputUrl`. Typical generation takes 1-3 minutes.\n\n**Cost:** per second of clip, by model and resolution (see `creditsPerSecondByResolution` in `GET /clip-models`). Credits are reserved when the clip starts and refunded automatically if generation fails.\n\n**Requires an active paid subscription.**",
    "auth": true,
    "params": [
      {
        "name": "title",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Optional clip title. Defaults to the start of the prompt."
      },
      {
        "name": "modelKey",
        "in": "body",
        "type": "string",
        "required": true,
        "description": "The generation model to use. Get valid keys, capabilities, and per-second costs from `GET /clip-models`."
      },
      {
        "name": "prompt",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "What the clip should show. Required for text-to-video models; optional when animating from images."
      },
      {
        "name": "aspectRatio",
        "in": "body",
        "type": "`auto` \\| `16:9` \\| `9:16` \\| `4:3` \\| `3:4` \\| `1:1` \\| `21:9` \\| `3:2` \\| `2:3` \\| `9:21` \\| `5:4` \\| `4:5`",
        "required": false,
        "description": "Clip dimensions. Check the model's `supportedAspectRatios` from `GET /clip-models`. Default: \"16:9\"."
      },
      {
        "name": "resolution",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Output resolution (e.g. \"720p\", \"1080p\"). Check the model's `supportedResolutions`. Higher resolutions cost more credits per second. Default: \"720p\"."
      },
      {
        "name": "durationSeconds",
        "in": "body",
        "type": "integer \\| `auto`",
        "required": false,
        "description": "Clip length in seconds, or \"auto\" for models that support automatic duration. Default: 5."
      },
      {
        "name": "firstFrameUrl",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Public image URL to use as the first frame (image-to-video). Only for models with `supportsFirstFrame`."
      },
      {
        "name": "lastFrameUrl",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Public image URL to use as the last frame. Only for models with `supportsLastFrame`."
      },
      {
        "name": "referenceImageUrls",
        "in": "body",
        "type": "array of string",
        "required": false,
        "description": "Public image URLs used as style/subject references. Only for models with `supportsReferenceImages`; respect `maxReferenceImages`."
      },
      {
        "name": "referenceVideoUrls",
        "in": "body",
        "type": "array of string",
        "required": false,
        "description": "Public video URLs used for motion, editing, or extension. Check model capabilities first."
      },
      {
        "name": "referenceAudioUrls",
        "in": "body",
        "type": "array of string",
        "required": false,
        "description": "Public audio URLs used for voice, lip sync, rhythm, or timing. Check model capabilities first."
      }
    ]
  },
  {
    "method": "GET",
    "path": "/clips",
    "summary": "List your clips",
    "description": "Returns your standalone AI clips, newest first. For the next page, pass the `createdAt` of the last clip as `cursor`. An empty array means there are no more clips.",
    "auth": true,
    "params": [
      {
        "name": "limit",
        "in": "query",
        "type": "integer",
        "description": "Maximum clips per page (1-50). Default: 20."
      },
      {
        "name": "cursor",
        "in": "query",
        "type": "datetime (ISO 8601)",
        "description": "Pagination cursor: the `createdAt` of the last clip from the previous page. Omit for the first page."
      }
    ]
  },
  {
    "method": "GET",
    "path": "/clips/{id}",
    "summary": "Get a clip by ID",
    "description": "Returns a clip with its generation status. Poll every 10-15 seconds after `POST /clips` until `status` is `completed` (then download from `outputUrl`) or `failed` (see `errorMessage`; credits are refunded automatically).",
    "auth": true,
    "params": [
      {
        "name": "id",
        "in": "path",
        "type": "string (uuid)",
        "required": true,
        "description": "Clip ID from `POST /clips`."
      }
    ]
  },
  {
    "method": "POST",
    "path": "/exports",
    "summary": "Export a video to MP4",
    "description": "Starts rendering a completed video into a downloadable MP4 file. The rendering runs in the background and typically takes 30 seconds to 5 minutes depending on video length.\n\n**Cost:** Free. All credits were already consumed during video generation.\n\n**Requires:** A prior paid subscription.\n\n**After exporting:**\n1. Poll `GET /videos/{id}` and check the `exportStatus` field until it is `completed`.\n2. Then call `GET /exports/download?videoId={id}` to get the download URL.",
    "auth": true,
    "params": [
      {
        "name": "videoId",
        "in": "body",
        "type": "string (uuid)",
        "required": true,
        "description": "The ID of the video to export. The video must have `status: completed`."
      },
      {
        "name": "resolution",
        "in": "body",
        "type": "`1080p` \\| `4k`",
        "required": false,
        "description": "Export resolution.\n\n- `1080p` (default): Full HD (1920x1080 or 1080x1920 for vertical). Fast rendering.\n- `4k`: Ultra HD (3840x2160 or 2160x3840 for vertical). Slower rendering, larger file."
      }
    ]
  },
  {
    "method": "GET",
    "path": "/exports/download",
    "summary": "Get MP4 download URL",
    "description": "Returns a temporary signed URL to download the rendered MP4 file for a video. Automatically finds the latest completed export for the given video.\n\n**URL expires in 2 minutes.** Start your download immediately after receiving the URL.\n\nYou can pass either a `videoId` (recommended, finds the latest export automatically) or an `exportId` (if you need a specific export).",
    "auth": true,
    "params": [
      {
        "name": "videoId",
        "in": "query",
        "type": "string (uuid)",
        "description": "The video ID. Finds the latest completed export for this video."
      },
      {
        "name": "exportId",
        "in": "query",
        "type": "string (uuid)",
        "description": "A specific export ID, returned from `POST /exports`. Usually not needed since `videoId` automatically finds the latest export."
      }
    ]
  },
  {
    "method": "GET",
    "path": "/channels",
    "summary": "List connected social media channels",
    "description": "Returns all connected social media channels (YouTube, TikTok, Instagram, Facebook, Threads, and X) for your organization.\n\n**Note:** Channels must be connected via the AITuber dashboard (OAuth flow). This endpoint is read-only; use it to discover channel IDs for publishing.\n\n**After listing channels:**\nUse the channel `id` values when calling `POST /publications` to publish a video.",
    "auth": true,
    "params": [
      {
        "name": "platform",
        "in": "query",
        "type": "`youtube` \\| `tiktok` \\| `instagram` \\| `facebook` \\| `threads` \\| `x` \\| `all`",
        "description": "Filter by platform. Use \"all\" or omit to list all connected channels."
      }
    ]
  },
  {
    "method": "POST",
    "path": "/publications",
    "summary": "Publish a video to social media",
    "description": "Publishes a completed video to one or more connected social media channels (YouTube, TikTok, Instagram, Facebook, Threads, and X).\n\n**Prerequisites:**\n1. Connect channels via the AITuber dashboard (cannot be done via API).\n2. Video must have `status: completed` (check via `GET /videos/{id}`).\n3. Active paid subscription with the Publish feature (Creator plan or higher).\n\n**How it works:**\n1. If the video has not been exported to MP4 yet, an export is automatically started.\n2. Once the MP4 is ready, it is uploaded to each selected platform.\n3. Each channel gets its own publication with independent status tracking.\n\n**After publishing:**\nPoll `GET /publications/{publicationId}` for each publication ID until it reaches a terminal state.\nImmediate publishes typically end in `published` or `failed`. Scheduled publishes may enter `scheduled` first, depending on platform behavior.\nTypical time: 2-10 minutes (longer if export is needed first).\n\n**Platform-specific settings:**\nEach entry in the `channels` array can include platform-specific metadata. Only include settings relevant to the channel's platform.\n\n**Cost:** Free. Publishing does not consume credits.",
    "auth": true,
    "params": [
      {
        "name": "videoId",
        "in": "body",
        "type": "string (uuid)",
        "required": true,
        "description": "The video to publish. Must have `status: completed`."
      },
      {
        "name": "sceneExportId",
        "in": "body",
        "type": "string (uuid)",
        "required": false,
        "description": "Optional export ID if the video has already been exported. If omitted, an export is triggered automatically."
      },
      {
        "name": "caption",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Description or long caption used for YouTube, TikTok, Instagram, and Facebook. Max 2200 characters."
      },
      {
        "name": "shortCaption",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Short caption shared by X and Threads. It is kept within X's standard weighted 280-character limit. Defaults to `caption` when omitted."
      },
      {
        "name": "addMadeWithCaption",
        "in": "body",
        "type": "boolean",
        "required": false,
        "description": "Add \"Made with AITuber, the AI video generator: aituber.app\" at the end of each caption. Default: true. Each caption is shortened when needed to stay within its platform limit."
      },
      {
        "name": "publishNow",
        "in": "body",
        "type": "boolean",
        "required": false,
        "description": "Set to `true` (default) to publish immediately. Set to `false` and provide `scheduledAt` to schedule."
      },
      {
        "name": "scheduledAt",
        "in": "body",
        "type": "datetime (ISO 8601)",
        "required": false,
        "description": "ISO 8601 datetime to schedule publication. Must be in the future. Only used when `publishNow` is `false`."
      },
      {
        "name": "channels",
        "in": "body",
        "type": "array of objects",
        "required": true,
        "description": "One or more channels to publish to. Each entry can include platform-specific settings."
      },
      {
        "name": "channels[].channelId",
        "in": "body",
        "type": "string (uuid)",
        "required": true,
        "description": "Channel ID from `GET /channels`. Must have `status: connected`."
      },
      {
        "name": "channels[].title",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "Video title (YouTube). Max 100 characters. Defaults to the video title from generation."
      },
      {
        "name": "channels[].tags",
        "in": "body",
        "type": "array of string",
        "required": false,
        "description": "YouTube tags for search discovery. Max 30 tags, each up to 100 characters."
      },
      {
        "name": "channels[].categoryId",
        "in": "body",
        "type": "string",
        "required": false,
        "description": "YouTube category ID. Default: \"22\" (People & Blogs). Common: \"24\" Entertainment, \"27\" Education, \"26\" Howto & Style, \"28\" Science & Technology, \"20\" Gaming, \"10\" Music, \"17\" Sports, \"1\" Film & Animation, \"23\" Comedy."
      },
      {
        "name": "channels[].madeForKids",
        "in": "body",
        "type": "boolean",
        "required": false,
        "description": "YouTube COPPA compliance flag. Default: false."
      },
      {
        "name": "channels[].allowComment",
        "in": "body",
        "type": "boolean",
        "required": false,
        "description": "Let viewers comment. Default: true. Only TikTok and X support this. TikTok turns comments off. X has no full off switch, so it limits replies to accounts you mention. Ignored on YouTube, Instagram, Facebook, and Threads."
      },
      {
        "name": "channels[].tiktokPrivacyStatus",
        "in": "body",
        "type": "`public` \\| `friends` \\| `private`",
        "required": false,
        "description": "Privacy setting. Default: \"public\"."
      },
      {
        "name": "channels[].allowDuet",
        "in": "body",
        "type": "boolean",
        "required": false,
        "description": "Allow duets. Default: true."
      },
      {
        "name": "channels[].allowStitch",
        "in": "body",
        "type": "boolean",
        "required": false,
        "description": "Allow stitches. Default: true."
      },
      {
        "name": "channels[].isAiGenerated",
        "in": "body",
        "type": "boolean",
        "required": false,
        "description": "Label video as AI-generated on TikTok. Default: false."
      },
      {
        "name": "channels[].instagramPlacement",
        "in": "body",
        "type": "`reels` \\| `stories` \\| `timeline`",
        "required": false,
        "description": "Instagram: where to post. Default: \"reels\"."
      },
      {
        "name": "channels[].shareToFeed",
        "in": "body",
        "type": "boolean",
        "required": false,
        "description": "Instagram: also share Reel to feed. Default: true."
      }
    ]
  },
  {
    "method": "GET",
    "path": "/publications/{publicationId}",
    "summary": "Get publication status",
    "description": "Returns the current status of a publication. Poll this after `POST /publications` to track progress.\n\n**Status flow:** Immediate publishes typically move `exporting` -> `uploading` -> `published` (or `failed` at any stage).\nScheduled publishes may move into `scheduled` first, depending on platform behavior.\n\n**Polling recommendation:** Check every 10-15 seconds until the upload reaches a stable state such as `published`, `scheduled`, or `failed`.",
    "auth": true,
    "params": [
      {
        "name": "publicationId",
        "in": "path",
        "type": "string (uuid)",
        "required": true,
        "description": "Publication ID from `POST /publications`."
      }
    ]
  },
  {
    "method": "DELETE",
    "path": "/publications/{publicationId}",
    "summary": "Cancel a scheduled publication",
    "description": "Cancels a future scheduled publication before it goes live. Already live posts cannot be canceled through this endpoint.",
    "auth": true,
    "params": [
      {
        "name": "publicationId",
        "in": "path",
        "type": "string (uuid)",
        "required": true,
        "description": "Publication ID to cancel."
      }
    ]
  },
  {
    "method": "GET",
    "path": "/subscription",
    "summary": "Get plan and credit balance",
    "description": "Returns your current plan and credit balance. Call this before generating videos to check you have enough credits.\n\nPaid plans add credits each billing cycle (monthly or yearly). Credits never expire.\n\n**Upgrading:** To upgrade your plan or purchase additional credits, go to https://app.aituber.app/dashboard/billing",
    "auth": true,
    "params": []
  },
  {
    "method": "GET",
    "path": "/background-videos",
    "summary": "List background videos",
    "description": "",
    "auth": false,
    "params": [
      {
        "name": "categorySlug",
        "in": "query",
        "type": "string",
        "description": ""
      },
      {
        "name": "cursor",
        "in": "query",
        "type": "string (uuid)",
        "description": ""
      }
    ]
  },
  {
    "method": "GET",
    "path": "/background-videos/categories",
    "summary": "List background video categories",
    "description": "",
    "auth": false,
    "params": []
  },
  {
    "method": "POST",
    "path": "/uploads/confirm-background-video",
    "summary": "Confirm a background video upload",
    "description": "",
    "auth": false,
    "params": [
      {
        "name": "assetId",
        "in": "body",
        "type": "string (uuid)",
        "required": true,
        "description": ""
      },
      {
        "name": "title",
        "in": "body",
        "type": "string",
        "required": true,
        "description": ""
      }
    ]
  }
];
