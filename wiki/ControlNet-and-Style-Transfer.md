# ControlNet and Style Transfer

## ControlNet

A full ControlNet panel ships in the generation UI. Two ways to use it:

- **Preset mode** - a grid of presets (Canny, Depth, OpenPose, LineArt, Scribble, Soft Edge, and more), filtered to what suits the active model family. In preset mode your reference image is preprocessed (for example edge detection) before being used as guidance.
- **Custom mode** - pick the ControlNet model and preprocessor manually.

Capabilities:

- Reference image via upload, paste, or drag-and-drop.
- Preprocessor preview so you can see the control map before generating.
- Strength slider plus start% / end% timing sliders.
- Auto-setup: missing ControlNet models are downloaded automatically, the `comfyui_controlnet_aux` preprocessor pack is cloned from GitHub, ComfyUI is restarted, and the install is verified. ControlNet setup failures do not block core generation.

### Anima (COSMOS) models

Anima-based checkpoints are DiT models (a Cosmos-Predict2 backbone paired with a Qwen3 text-encoder adapter), not classic UNets, so standard ControlNet cannot be applied to them. When an Anima model is active, ControlNet automatically routes through the Anima LLLite path, which uses ComfyUI's built-in `ModelPatchLoader` and `AnimaLLLiteApply` nodes and needs ComfyUI 0.29 or newer. There is no extension to install: LLLite weights are downloaded into `models/model_patches`, and weights left in the controlnet folder by MooshieUI 1.9.0 or earlier are moved there the next time ComfyUI starts. On an older ComfyUI the panel tells you to update instead.

This routing depends on the model being detected as the Anima family. Detection works even for Anima fine-tunes that were renamed without an `anima` or `yume` token in the filename (for example PerfectDeliberate): MooshieUI inspects the safetensors tensor structure, recognizes the Cosmos-Predict2 blocks and the Qwen3 adapter, and treats the checkpoint as Anima. The same structural check picks the matching Qwen3-0.6B text encoder, so a renamed or quantized Anima build still loads the right one. If a model is still misdetected, you can set its family manually with the family override in the model picker.

<a id="style-transfer-anima-restyler"></a>

## Style Transfer (Anima RFInversion)

The **Style Transfer** panel uses RFInversion through ComfyUi-Untwisting-RoPE and an advanced image-scaling node. It is an experimental Anima txt2img workflow, separate from the Anima Edit LoRA workflow called **Anima ReStyler** in [[Image Edit Mode]] and from the Style Reference panel below.

- Reference image via upload, paste, or drag-and-drop.
- MooshieUI checks that the required nodes are available.
- It warns you if you have selected an ancestral sampler, which is not compatible with this technique.
- It is unavailable during pause/continue and cannot be combined with ControlNet or the upscale pass.

## Style Reference (IP-Adapter / Flux Redux / Anima)

**Style Reference** is a separate section in the generation sidebar (visible in txt2img, img2img, outpainting, and inpainting on ComfyUI models). It uploads a reference image and guides the generation toward its colors, textures, and composition without replacing your text prompt. On Anima it works as a character reference instead (see [Anima character reference](#anima-character-reference)). In **Txt2Img**, the bottom of the same card also holds **Guide Image**, which works across every KSampler model family with no extra model download. The Style Reference technique is chosen automatically from the active model family.

| Model family | Technique | Required |
|---|---|---|
| Flux.1 dev / schnell / krea | Flux Redux | `flux1-redux-dev.safetensors` in `models/style_models/` + `sigclip_vision_patch14_384.safetensors` in `models/clip_vision/` |
| SD1.5 | IP-Adapter Plus | `ip-adapter-plus_sd15.safetensors` in `models/ipadapter/` + `CLIP-ViT-H-14-laion2B-s32B-b79K.safetensors` in `models/clip_vision/` |
| SDXL / Illustrious / Pony | IP-Adapter Plus | `ip-adapter-plus_sdxl_vit-h.safetensors` in `models/ipadapter/` + `CLIP-ViT-H-14-laion2B-s32B-b79K.safetensors` |
| Anima | Anima Reference Adapter v2 (character reference) or Art style (training-free, no download) | `anima_ref_adapter_v2_r64.safetensors` in `models/loras/` for character mode (downloaded from the panel or on the first run); Art style needs no extra file |
| All other families | Not supported | -- |

### Using the panel

1. Enable the **Style Reference** toggle in the sidebar.
2. Drop or browse to a style image.
3. Adjust **Strength** (0.0 to 1.0; 0.6 is a good starting point).
4. Choose a **Weight type**:
   - Flux Redux options: multiply (default), attn_bias, average
   - IP-Adapter options: linear (balanced), style transfer (emphasizes style over composition), composition, strong style transfer
5. For IP-Adapter only: adjust **Start** and **End** to control which fraction of steps the style reference applies for.
6. Generate as normal.

### Installing IP-Adapter Plus

The ComfyUI_IPAdapter_plus custom node pack is required for SD1.5 and SDXL but is not installed by default. If it is missing, the panel shows an **Install IP-Adapter Plus** button. Clicking it clones the pack and installs its dependencies, then restarts ComfyUI. Flux.1 uses core ComfyUI nodes and needs no extra install.

If a required model file is missing, the panel shows its expected path and a download link.

<a id="anima-character-reference"></a>

### Anima character reference

On Anima, Style Reference uses the Anima Reference Adapter v2. It keeps who is drawn in the reference (hair, eyes, outfit and much of the art style), so you need no character LoRA or name tags.

1. Pick an Anima model and enable the **Style Reference** toggle. The panel shows **Anima Reference Adapter**.
2. Press **Download Anima Reference Adapter v2 (183 MB)**, or skip it and ComfyUI downloads it on the first run.
3. Drop or browse to a picture of the character under **Character**.
4. Write a prompt that describes only the scene: pose, place and framing. Leave out the character name and outfit tags.
5. Generate as normal.

For two characters, add a picture under **Second character (optional, right side)**. In the prompt, say in a few words who is on the left and who is on the right, use `2girls` or `1boy, 1girl` instead of `solo`, and pick a landscape size.

Settings:

- **Reference guidance** (default 4.5): how hard the image is pushed toward the reference. Higher keeps more detail and style but adds saturation. At 1 there is no extra model call per step, so it is fastest but weaker; at the default a generation takes about twice as long.
- **Colour correction**: keeps colours in check at high CFG and reference guidance. APG is recommended.
- **End**: the fraction of steps that use reference guidance. Around 0.6 is faster with nearly the same image.

Anima TeaCache is switched off while the character reference is on, and it cannot be combined with the Anima **Style Transfer** panel. The node pack installs automatically when ComfyUI launches.

For manual setup, follow the [Style Reference model-file guide](https://github.com/Mooshieblob1/MooshieUI/blob/main/docs/STYLE_REFERENCE.md). The IP-Adapter image encoder is published as `models/image_encoder/model.safetensors` upstream; save it in `models/clip_vision/` with the expected `CLIP-ViT-H-14-laion2B-s32B-b79K.safetensors` filename.

### Anima Art Style mode

Switch the Anima Style Reference mode from **Character** to **Art style** to take a picture's palette, shading and texture without its subject or characters. Describe the whole image in the prompt as normal; no character name or outfit tags from the reference are carried over. No additional downloads are needed.

Controls:

- **Style picture** - the reference image to draw the art style from.
- **Style match** - how far the image moves towards the picture's colours and texture after each block. 0.6 is a good starting point; near 1 the image can break down.
- **Keep my composition** - leaves the first quarter of the steps alone so the layout comes from your prompt. Turn it off for a stronger style change that may drift toward the reference's own layout.
- **Picture size (megapixels)** - the reference is shrunk to this area before use, never enlarged. About the size of your output image works best (1 for 1024x1024).

This method adds one model pass per step, so it is slower than the character reference. It has been tested mostly on Anima Turbo.

### Guide Image (txt2img, any model)

At the bottom of the **Style Reference** card in **Txt2Img**, **Guide Image** steers the beginning of sampling toward a reference picture's layout and colours without needing an IP-Adapter, Flux Redux, or Anima adapter download (requires ComfyUI v0.40.0 or newer). Unlike **Img2Img**, sampling still starts from pure noise at full denoise, so the composition follows the reference while detail is generated fresh.

1. Tick **Guide Image** in the **Style Reference** card.
2. Drop, paste, or **browse** to an image. It is centre-cropped to your output aspect ratio and encoded with the active VAE.
3. Adjust **Guide strength** (0.00 to 1.00, default 0.60) for how strongly early steps pull toward the guide latent, and **Guide until** (0.00 to 1.00, default 0.35) for the fraction of steps from the start where the guide applies before the model finishes freely.

Guide Image applies only to the base generation pass: hires, face/segment detail passes, and Moody Moss 4K HD skip it.

### Note on Anima ReStyler

**Anima ReStyler** in [[Image Edit Mode]] uses the Anima Edit LoRA, with Reference strength and Drastic restyle controls. The older **Style Transfer** panel above uses RFInversion. **Style Reference** uses Flux Redux or IP-Adapter on its supported families, and the Anima Reference Adapter (a character reference or art-style reference) on Anima. These are distinct workflows with different model requirements; NovelAI Vibe Transfer and Precise Reference are documented in [[NovelAI Backend]].
