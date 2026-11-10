# MooshieUI Wiki

MooshieUI is a beginner-friendly interface for image, video, music and 3D generation through [ComfyUI](https://github.com/comfyanonymous/ComfyUI), with optional image generation through the NovelAI API using your own key. It hides node-graph complexity behind a guided UI. It runs two ways:

- **Desktop app** via Tauri (Windows, Linux and Apple Silicon macOS releases)
- **Browser/server mode** via a built-in web server (LAN/Docker friendly, mobile UI included)

## Start here

- [[Installation]] - one-click setup, Docker, remote ComfyUI, macOS
- [[Generation Basics]] - image modes, pause/continue, queue, dimensions and sampling controls
- [[Prompting Guide]] - Prompt Chunks, random syntax, Style Creator, Artist Styles, scheduling and autocomplete
- [[Prompt Assistant]] - write, edit or polish prompts with a local or external LLM

## Features by area

- [[NovelAI Backend]] - personal API keys, characters/references, face detailing, Director Tools, Enhance and Anlas estimates
- [[Video Generation]] - the MiniMax H3 video mode, shot timeline, player and export
- [[Music Generation]] - YuE2 songs, lyric writing, playlists, shared playback and manual lyric timing
- [[Anime Scenes]] - voiced, lip-synced character clips through ElevenLabs and fal.ai with your own keys
- [[Image to 3D]] (experimental) - turn one image into a textured mesh (Pixal3D) or a Gaussian splat (Idol)
- [[Image Edit Mode]] - Qwen Image Edit/Edit Plus, Flux.1 Kontext, FLUX 3 Klein and Anima ReStyler
- [[Upscaling and Face Fix]] - tiled diffusion upscaling, guidance nodes, face detailer
- [[ControlNet and Style Transfer]] - structural guidance and reference-image style transfer
- [[Inpainting and the Canvas Editor]] - multi-layer canvas, mask painting, staging strip
- [[Compare Grid]] - XYZ-style parameter sweeps with stitched output
- [[Image Comparison]] - A/B viewer with slider, fade, difference and side-by-side modes
- [[Models and the Model Hub]] - smart model detection, CivitAI/HuggingFace browser, model manager
- [[Gallery and Metadata]] - image/video saving, PNG/JXL/WebP and NovelAI metadata, drag-drop remix
- [[Server, LAN and Multi-User]] - hosting MooshieUI for phones and other machines, roles and auth
- [[Settings and Accessibility]] - categorized Settings, themes, notifications, retention, 12 languages and accessibility
- [[AI Assistants and MCP]] - let Claude, Cursor and other assistants generate through the opt-in MCP server
- [[FAQ]]
- [[Contributing]] and [[Project Scope]]

## Notes on this wiki

Each page says which version a feature arrived in where that matters. Controls and supported workflows depend on the selected backend and model. NovelAI provides txt2img, img2img and inpainting; Image Edit, video, music, Image to 3D and pause/continue use ComfyUI; Anime Scenes uses cloud providers only. Apple Silicon DMGs ship with every release since v2.3.9 and are user-tested rather than fully qualified on hardware.

For technical references see the [documentation index](https://github.com/Mooshieblob1/MooshieUI/blob/main/docs/README.md). Contributor/build instructions live in [CONTRIBUTING.md](https://github.com/Mooshieblob1/MooshieUI/blob/main/.github/CONTRIBUTING.md) and [push-instructions.md](https://github.com/Mooshieblob1/MooshieUI/blob/main/docs/push-instructions.md); version history lives in [CHANGELOG.md](https://github.com/Mooshieblob1/MooshieUI/blob/main/CHANGELOG.md).
