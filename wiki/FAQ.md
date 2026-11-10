# FAQ

## Where do I put wildcards and what is the prompt syntax?

For inline choices, use `{red|blue|green}`. Multiple choices, weights and nested blocks are supported, and the generation seed determines the roll. For reusable lists, use **Prompt Chunks** (also called Prompt Presets). Classic `__filename__` text-file wildcards are not the app's wildcard mechanism.

1. Open **Chunks** from the prompt toolbar. Create a chunk and put each choice on its own line (commas within a line stay grouped).
2. Either activate the preset with a **Wildcard (random)** or **Wildcard (in order)** mode, or drop the inline token `@[Chunk Name]` (or `@preset:<slug>`) anywhere in your prompt to roll it at that exact spot.

Full details: [[Prompting Guide]].

## How do I recover the prompt/settings from an image I made earlier?

Drag or paste the PNG back into MooshieUI. It reads the embedded metadata and fills in your settings. If the image has no embedded metadata, use image interrogation to reverse-engineer tags. See [[Gallery and Metadata]] and [[Prompting Guide]].

## How do I queue many variations at once?

Use a **Wildcard (in order)** preset (the Generate button can queue the whole ordered run), or use the [[Compare Grid]] for explicit per-cell parameter sweeps.

## Can I run this on my phone?

Yes. Run MooshieUI in server mode and open it in your phone's browser; there is a dedicated mobile layout. See [[Server, LAN and Multi-User]].

## ComfyUI is on a cloud GPU. Can I still use the desktop app?

Yes, as a thin client against a remote ComfyUI. See the remote/cloud section of [[Installation]].

## A model is not detected correctly. Why?

Detection combines hashes, sidecar/model metadata, safetensors or GGUF structure, and filename hints. Many renamed models still resolve correctly. Check the supported families, companion encoders/VAEs and the family override in the model picker. See [[Models and the Model Hub]].

## Generation fails with a quantization format error. What now?

Check both the ComfyUI version and the loader. Update ComfyUI to the app's pinned version. Supported W8A8/ConvRot models also need the optional **INT8-Fast loader** enabled and installed; updating core ComfyUI alone does not install it. GGUF models use their own loader and cannot use the INT8-Fast toggle. If the format or hardware is unsupported, use a supported quantization or full-precision model. See [[Models and the Model Hub]].

## Generation says a setting is not in the allowed list. Is my model missing?

Read the rejected setting in the error detail. An invalid sampler or quantization option is a settings validation error; a missing model message names a model-file input. If an older app rejects the INT8-Fast loader's `lora_mode` value `default`, update to v2.3.3 or later, which uses the loader's supported default. See [[Models and the Model Hub]].

## Can I use NovelAI on a shared server?

Yes. Regular users and moderators add their own key in **Settings > NovelAI**. Their requests never fall back to the host's key. Admin accounts use the owner's key, so promotion changes both gallery access and which NovelAI account is billed. See [[NovelAI Backend]].

## Can I pause a generation and change its ending?

Yes, for ComfyUI **Text to Image**. Set **Pause at step**, inspect the preview, adjust supported controls or paint a masked correction, then continue. Pauses are session state and do not apply to NovelAI. See [[Generation Basics]].

## Why did an image or video disappear from the gallery?

Check **Manual save mode** and the gallery retention setting. Manual mode requires **Save to Gallery**; otherwise the result is only held for review. User/moderator gallery items expire after seven days by default unless **Never auto-delete gallery images** is enabled; admin/root-gallery files are exempt. See [[Gallery and Metadata]].

## How do I report a bug?

Click the bug icon in the left sidebar (just below the connection indicator) to open **Report a problem** any time. Add a note and submit, and your app version, OS, and recent logs are bundled and filed as a GitHub issue for you, no GitHub account required. Nothing is sent unless you submit. If a problem is upscale or generation related, running the affected action first so it's captured in the logs helps a lot. See the diagnostics notes in [[Settings and Accessibility]].

## Where are the contributor/build docs?

In the repo: [README.md](https://github.com/Mooshieblob1/MooshieUI/blob/main/README.md), [push-instructions.md](https://github.com/Mooshieblob1/MooshieUI/blob/main/docs/push-instructions.md), and [CHANGELOG.md](https://github.com/Mooshieblob1/MooshieUI/blob/main/CHANGELOG.md).
