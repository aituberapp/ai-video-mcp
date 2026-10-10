// AUTO-GENERATED FILE - DO NOT EDIT. Regenerate with `pnpm docs:generate` in the main repo.
import type { GeneratedParam } from "./endpoints.generated";
export type GeneratedSpend = "free" | "credits" | "publishes" | "deletes";
export interface GeneratedTool { name: string; title: string; description: string; capability: string; method: string; path: string; spend: GeneratedSpend; params: GeneratedParam[]; }
export const GENERATED_TOOLS: GeneratedTool[] = [
  {
    "name": "create_clip",
    "title": "Create a standalone AI video clip",
    "description": "Generates one standalone AI video clip, 1 to 30 seconds, from a text prompt or a reference image. No narration and no captions: it is a raw clip, not a finished video. Pick a model from GET /clip-models. Spends credits and needs a paid plan. Returns a pending clip id; poll GET /clips/{id} until completed.",
    "capability": "generateClip",
    "method": "POST",
    "path": "/clips",
    "spend": "credits",
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
    "name": "create_element",
    "title": "Create an element (person, product, or place)",
    "description": "Saves a reusable element from one reference photo: a person, a product, or a place. Elements are the account's visual assets. Mention one as @handle in a script so the same face, product, or place appears in every scene. Costs no credits. Give the photo as imageUrl (a public image link) or imageAssetId (an upload made with POST /uploads, purpose \"element-image\"), one of the two. Type is character (a person or mascot), prop (a product or object), or location (a place).",
    "capability": "createElement",
    "method": "POST",
    "path": "/elements",
    "spend": "free",
    "params": [
      {
        "name": "name",
        "in": "body",
        "type": "string",
        "required": true,
        "description": "Element name, used to build the @handle. Letters, numbers, spaces, and hyphens work best (e.g. \"Maya\", \"Red Bottle\")."
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
    "name": "create_music_video",
    "title": "Create a music video",
    "description": "Starts a music video: a song with AI visuals and synced lyric captions. The song comes from musicId (a song made with POST /music, which writes a new song from a prompt or sings lyrics the user wrote) or musicAssetId (a track uploaded with POST /uploads, purpose \"music\"), one of the two. Pick visualMode: ai-images, ai-video, or cover-image. Spends credits and takes several minutes. Returns a pending video id; use get_video to check progress.",
    "capability": "generateMusicVideo",
    "method": "POST",
    "path": "/music-videos",
    "spend": "credits",
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
    "name": "create_video",
    "title": "Create a video",
    "description": "Starts a narrated video with synced captions from a script, an idea, or a web page or PDF source. Visuals can be AI images, AI clips, stock footage, a talking avatar, or a looping background video. Templates such as skeleton, character, and medical are chosen with templateId. Spends credits. Returns a pending video id; use get_video to check progress.",
    "capability": "generateNarrationVideo",
    "method": "POST",
    "path": "/videos/generate",
    "spend": "credits",
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
        "description": "The content for your video. How this field is used depends on `inputType`.\n\n**Script mode** (`inputType: \"script\"`, default): Provide the exact narration text. This is what the voice will speak word-for-word. Must be at least 5 words. Max 30,000 characters (enough for a 20-minute video at normal voice speed). The AI automatically splits it into visual segments and generates matching visuals.\n\n**Visual control:** By default, the AI decides what visuals to show for each part of your narration. For more control, add visual instructions in brackets before each narration segment:\n\n`[A dark forest at night] The wind howled through the trees. [Glowing eyes peering from shadows] Something was watching.`\n\nEach `[bracketed text]` tells the AI exactly what to show for that scene. The text after it is the voiceover.\n\n**Put a real person, product, or place in the video (@mentions):** reference a saved element by its handle, e.g. `[@Maya holding @Red-Bottle] Meet the founder who started it all.` The element's reference photo is fed to the image model so the same face or product appears consistently across the whole video. Get handles from `GET /elements`; create new elements with `POST /elements`. Rules: works with `mediaType` `images` and `video`; not with `stock`. The photo decides how the element looks; never describe its appearance in the script. Mentions are spoken as the plain name (the `@` is never read aloud), and unknown handles are treated as plain words.\n\n**Idea mode** (`inputType: \"idea\"`): Provide a short topic or concept. The AI writes a full narration script for you. Keep it under 800 characters. Pair with `expectedDurationSeconds` to control video length.\n\n**Source mode** (`inputType: \"source\"`): Provide the TEXT of an article, a web page, or a document. It is not the narration. The AI reads it and writes a short narration script from it, faithful to it. Max 200,000 characters. Pair with `expectedDurationSeconds` (required) to set the script length, and with the `source` object to say where the text came from.\n\n**You can skip this field in source mode** by sending `source.url` (a web page) or `source.assetId` (a PDF you uploaded) instead. We then fetch and read the page or the file while the video is being made, so you do not have to read it yourself.\n\nSupports any language. The voice will speak naturally in whatever language the text is written in."
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
        "description": "Caption (subtitle) visual style. Captions are rendered directly onto the video with word-by-word timing sync.\n\n**Built-in styles:**\n- `wrap-1` (default): Active word highlight with 2-word groups. Most popular style.\n- `silver`: Thin white text with one key word per phrase in a glowing italic serif.\n- `koe`: Small lowercase serif, one quiet phrase at a time. No word highlight.\n- `pill`: Black text on a white rounded box, one short phrase at a time.\n- `hormozi`: Bold uppercase with yellow highlight on black pill. Alex Hormozi inspired.\n- `beast`: Bold Bangers font with letter-spacing bounce animation. MrBeast inspired.\n- `noah`: Bold italic Oswald with colored highlight.\n- `handwritten`: Organic casual style with handwriting font. Personal and authentic.\n- `subtitle`: Clean streaming-style subtitles on a dark bar. Professional and readable.\n- `impact`: Massive bold text, one word at a time. Maximum emphasis.\n- `pop`: Playful spring animation with bouncy words. Fun and energetic.\n- `chronicle`: Ancient serif for history, mythology, and epic stories.\n- `cyber`: Futuristic neon style for sci-fi, tech, and cyberpunk content.\n- `grit`: Raw marker style for true crime, street, and intense stories.\n- `luxe`: Elegant serif for luxury, fashion, and celebrity content.\n- `terminal`: Monospace style for tech, hacker, and AI content.\n\nYou can also create custom caption styles with your own fonts, colors, and animations via the [AITuber dashboard](https://app.aituber.app/dashboard). Use the custom style ID here."
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
    "name": "download_video",
    "title": "Get the MP4 download link",
    "description": "Returns a temporary signed download URL for the MP4 of an exported video. Call export_video first. While the export is still rendering this returns 400 \"not ready\": wait and call again. With no export at all it returns 404. The URL expires in 2 minutes.",
    "capability": "downloadVideo",
    "method": "GET",
    "path": "/exports/download",
    "spend": "free",
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
    "name": "export_video",
    "title": "Export a video to MP4",
    "description": "Renders a completed video to a downloadable MP4. Export costs no credits but needs a paid plan. Rendering takes 30 seconds to a few minutes. Returns an export id. To get the file, call GET /exports/download with the videoId: it answers 400 \"not ready\" while rendering and a signed URL when done. The URL expires in 2 minutes.",
    "capability": "exportVideo",
    "method": "POST",
    "path": "/exports",
    "spend": "free",
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
    "name": "get_subscription",
    "title": "Get plan and credits",
    "description": "Returns the current plan, its status, the renewal date, the credit balance, and the credits included per billing cycle.",
    "capability": "getSubscription",
    "method": "GET",
    "path": "/subscription",
    "spend": "free",
    "params": []
  },
  {
    "name": "get_video",
    "title": "Get a video",
    "description": "Returns one video by id with its generation status: processing, completed, or failed with the error. Also returns title, duration, export status, and thumbnail. Scene data is omitted; for the full record call api_read GET /videos/{id}.",
    "capability": "getVideoStatus",
    "method": "GET",
    "path": "/videos/{id}",
    "spend": "free",
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
    "name": "list_channels",
    "title": "List connected social channels",
    "description": "Lists the social media channels connected to the account (YouTube, TikTok, Instagram, Facebook, Threads, X) with their ids and connection status. Use a channel id in publish_video. Channels are connected in the dashboard, not through the API.",
    "capability": "listChannels",
    "method": "GET",
    "path": "/channels",
    "spend": "free",
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
    "name": "list_videos",
    "title": "List videos",
    "description": "Lists the account's videos, newest first, with their status. Supports cursor pagination through the last id.",
    "capability": "listVideos",
    "method": "GET",
    "path": "/videos",
    "spend": "free",
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
    "name": "list_voices",
    "title": "List voices",
    "description": "Lists the shared AI voice catalog for narration. Filters by gender, accent, age, use case, language, or a search word. Every voice is multilingual. Use a voice id as voiceId when creating a video. Cloned voices are a separate endpoint, GET /voices/cloned.",
    "capability": "searchVoices",
    "method": "GET",
    "path": "/voices",
    "spend": "free",
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
    "name": "publish_video",
    "title": "Publish a video",
    "description": "Publishes a completed video to one or more connected social channels, now or at a scheduled time. The video needs a completed MP4 export first. Needs a plan with the publish feature. This posts publicly.",
    "capability": "publishVideo",
    "method": "POST",
    "path": "/publications",
    "spend": "publishes",
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
  }
];
