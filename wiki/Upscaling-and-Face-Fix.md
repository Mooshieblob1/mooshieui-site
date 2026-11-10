# Upscaling and Face Fix

## Upscale (tiled diffusion)

MooshieUI upscales with MultiDiffusion tiled diffusion, the same approach used by SwarmUI. There is no slow tile-by-tile processing; all tiles are denoised together each step for seamless results.

The tiled diffusion node is also published as a standalone ComfyUI custom node for use outside MooshieUI: [ComfyUI-MooshieTiledDiffusion](https://github.com/Mooshieblob1/ComfyUI-MooshieTiledDiffusion). It is the same node MooshieUI uses, so it supports Anima (COSMOS) and 5D latents, MultiDiffusion and SpotDiffusion, and txt2img, img2img, and inpainting, and it works above 2.4 MP where a single pass shows artifacts. Install it with ComfyUI-Manager (search Mooshie Tiled Diffusion), the Comfy Registry (`comfyui-mooshietileddiffusion`), or by cloning into `custom_nodes`. It is a one-off export with no promise of ongoing maintenance; the canonical source stays in MooshieUI.

### Methods

- **Model-based** - uses a dedicated upscale model (for example Omni-SR). Scale is fixed by the model (2x, 4x, etc.).
- **Algorithmic (Lanczos)** - fast pixel-space upscaling with an adjustable 1 to 4x scale.
- **SeedVR2 (restoration)** - one-step diffusion restoration that rebuilds real detail while upscaling instead of just resizing. It runs after sampling with its own model, so there is no denoise or step count to tune. The model and VAE (around 3.7 GB) download from within the app the first time you use it.

### Cap target scale

By default a model-based pass upscales to the upscale model's full native factor, so a 4x model like RealESRGAN_x4plus always runs a full 4x pass even when you only want a smaller bump. Turn on **Cap target scale** in the Refiner settings and set a **Target Scale** (for example 1.5x or 2x) to refine only up to that lower multiplier instead. It is off by default, so existing behavior is unchanged unless you enable it. Capping the scale means less work per pass, which cuts the time and system load a lot on lower-end PCs.

### Recommended upscale models (auto-download)

When you pick a recommended model that is not installed, MooshieUI downloads it to ComfyUI's `models/upscale_models/`:

| Model | Scale | Source |
|-------|-------|--------|
| Omni 2x | 2x | [Acly/Omni-SR](https://huggingface.co/Acly/Omni-SR) |
| Omni 4x | 4x | [Acly/Omni-SR](https://huggingface.co/Acly/Omni-SR) |

Any other models in `models/upscale_models/` also appear in the dropdown.

### Tiled diffusion options

- Toggle per generation. Recommended for large images and required for Anima (COSMOS) models.
- Adjustable tile size (256 to 2048px).
- Cosine-feathered blending for seamless boundaries.
- Supports both MultiDiffusion and SpotDiffusion algorithms.

### Guidance nodes (anti-hallucination)

- **Soft Guidance (CFG Rescale)** - toggle in Upscale Settings to reduce extra hands/objects at low denoise. Adjustable multiplier (0.0 to 1.0, default 0.4).
- **Smart Guidance (positive-biased adaptive)** - toggle in Sampler Settings to bias the model toward positive conditioning across all passes.

These are custom nodes (`MooshieSoftGuidance`, `MooshieSmartGuidance`) installed automatically.

### Upscale sampler controls

- **Denoise** - 0 to 1 (lower preserves more of the original).
- **Steps** - 1 to 50.

### One-click upscale

Hover any generated image and click **Upscale** to upscale the last output without changing your settings.

## Face Fix (face detailer)

Enable a post-generation pass that detects faces and re-denoises them at higher resolution, then composites them back with smooth cosine-falloff blending. No Impact Pack dependency; it is a self-contained node.

This panel is for ComfyUI mode. In NovelAI mode it is hidden and **NovelAI Face Detailer** takes its place, with its own settings and a choice between repainting faces on NovelAI or on a local checkpoint. See [[NovelAI Backend]].

Controls in Face Fix Settings:

- **Detector model** - choose from recommended detectors (for example an Anzhc face segmentation model or `face_yolov8n`). Missing models are auto-downloaded with SHA256 verification, and the `ultralytics` Python package is installed automatically.
- **Denoise** - 0 to 1.
- **Steps** - 1 to 50.
- **Guide size** - 256 to 1024px.
- **Auto-prompt** toggle.
