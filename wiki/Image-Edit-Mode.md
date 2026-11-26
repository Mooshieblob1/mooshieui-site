# Image Edit Mode

Image Edit is the fourth generation mode, next to Txt2Img, Img2Img, and Inpainting. Instead of generating from scratch or denoising over an existing picture, you give the model one or more reference images and describe the change you want in words. "Make the sky purple", "put the character in a red jacket", "remove the car on the left".

This is different from [[Inpainting and the Canvas Editor]], where you paint a mask to say *where* the change goes. In Image Edit you say *what* the change is and the model works out the rest, so no mask is involved.

## Supported models

Image Edit needs a model trained for instruction editing. These families are supported:

| Family | Reference images | Notes |
|--------|------------------|-------|
| **Qwen Image Edit** | 1 | Stock ComfyUI nodes |
| **Qwen Image Edit Plus** | up to 3 | Stock ComfyUI nodes |
| **Qwen Image Edit 2.1** | up to 10 | Includes Qwen Image Edit 2.1 Turbo (8-step schedule) |
| **Flux.2 Klein** | up to 10 | 4B and 9B, distilled and Base; 9B KV files use the KV cache |
| **FLUX 3 Klein** | up to 10 | Stock ComfyUI nodes (ComfyUI v0.41.0 or newer) |
| **Flux.1 Kontext** | 1 | Stock ComfyUI nodes |
| **MiniMax-H3-Image** | up to 16 | Stock ComfyUI nodes (ComfyUI v0.45.0 or newer) |
| **MOSS-Image** | 1 to 4 | Uses the MOSS-Image Edit LoRA, downloaded automatically |
| **Ming-Image Design** | up to 8 | Stock ComfyUI nodes |
| **SenseNova U1.6** | up to 16 | Stock ComfyUI nodes (ComfyUI v0.46.0 or newer); supports **Self-correction** |
| **Krea 2** | 1 or 2 | Needs an edit LoRA; pick the method under Edit LoRA |
| **Anima ReStyler** | 1 | Needs the Anima Edit LoRA |

The family is detected from the loaded model, and the matching workflow is selected automatically. A badge in the Image Edit panel shows which one is active.

Qwen Image Edit Plus taking three references is what makes it useful for combining pictures, for example putting a subject from one image into the setting of another.

**FLUX 3 Klein** (distilled or Base) takes up to 10 references. The panel starts with three slots and adds one each time you fill the last. Refer to the images by order in the prompt (the first image, the second image) and describe the whole result, not only the change. The output size follows your width and height.

**Anima ReStyler** works differently from the instruction families: instead of applying a described change, it redraws the character from your reference image in the Anima style, and the output matches the reference image's own size. It runs on an Anima checkpoint plus the Anima Edit LoRA, which downloads from within the app with the **Download Anima Edit LoRA (350 MB)** button. The LoRA comes from Civitai, so an API key or a VPN may be needed.

If you switch to Image Edit while a model that cannot edit images is loaded, the panel warns you and asks for an edit-capable model. Load one from [[Models and the Model Hub]].

## Using it

1. Select an edit-capable checkpoint.
2. Switch the mode tab to **Image Edit**.
3. Fill the reference slots. Each slot accepts a dropped file, a paste from the clipboard, or the **browse** link to pick a file.
4. Write the edit instruction in the positive prompt.
5. Generate.

The prompt is an instruction, not a description of the finished picture. "Make the sky purple" works better than a full scene description, because the model is being asked what to change rather than what to draw.

Reference images are downscaled so the long edge is at most 1536px before upload. For the Qwen families the first slot also sets the output dimensions, snapped to a multiple of 16. Flux.1 Kontext rescales internally, so its output size follows the model rather than the slot.

Uploads work the same in the desktop app and in browser mode.

## Settings

Steps, CFG, sampler, scheduler, and seed behave as they do elsewhere, and the usual per-family defaults apply when you load a model. Denoise is not used: an edit pass is not a partial-denoise pass the way img2img is.

Anima ReStyler adds two of its own:

- **Reference strength** - how closely the output follows the reference image. 1.0 keeps the composition and details intact; lower it (try 0.5 to 0.8) to let the prompt and style change the image more.
- **Drastic restyle** - runs the original ReStyler split-screen recipe, generating the reference and a blank canvas side by side and cropping the new half as the output. Much stronger style changes, at roughly twice the generation time.

## Krea 2 Image Edit

With a Krea 2 model loaded, the **Edit LoRA** picker lets you choose one of three methods. Each method downloads its own LoRA the first time:

| Method | What it does |
|--------|--------------|
| **General Edit** | Plain-language edits: remove, recolor, relight, swap the background, add objects, rewrite text, restyle. Use Turbo at 8 steps, CFG 1 for most edits; for removals try Raw at around 20 steps, CFG 3. |
| **Identity Edit** | Takes the person from your reference and places them in a new scene, pose, outfit or lighting. Describe how much of them is visible and the new context. |
| **Style Reference** | Generates a new picture from your prompt in the style of one or two reference images. |

**General Edit** and **Identity Edit** accept up to 2 reference images. Image 1 is the picture to edit; add a person as Image 2 to place them into it. Keep the total under 2 MP for best results. **Style Reference** uses one or two style images and the prompt describes the new picture.

**Reference fidelity** controls how closely the output holds to the reference (higher preserves more likeness; lower gives the edit instruction more room). **Restage freely** places the person next to the canvas rather than pinned to its layout, so pose and framing can change more.

## Camera Angle (Qwen Image Edit Plus)

With a Qwen Image Edit Plus model loaded, the panel shows a **Camera Angle** switch. Turn it on to re-shoot the reference from another angle:

- **Direction** - eight steps of 45 degrees around the subject, from **Front** to **Back**.
- **Height** - **Low**, **Eye level**, **Elevated** or **High**.
- **Distance** - **Close-up**, **Medium** or **Wide**.

The matching shot phrase is added to the start of your prompt, and **Added to the prompt** shows exactly what goes out. The words follow the Multiple-Angles LoRA's vocabulary, the same ones ComfyUI's CameraAngle node uses. When that LoRA is installed it is applied at strength 0.9 with its trigger word, which makes the angle much more precise. Without it only the shot words are sent. Use **Download Multiple-Angles LoRA (295 MB)** in the panel to install it.

Results land in the gallery tagged with the Image Edit mode, so you can filter for them later. See [[Gallery and Metadata]].
