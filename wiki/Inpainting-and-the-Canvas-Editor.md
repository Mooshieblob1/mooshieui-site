# Inpainting and the Canvas Editor

Inpainting mode lets you edit parts of an image using a built-in canvas instead of the ComfyUI node graph. The canvas opens automatically when you switch to inpainting mode.

## Multi-layer canvas

The canvas editor is a full multi-layer editor:

- **Tools** - Brush (B), Eraser (E), Rectangle (U), Lasso (Q), Eyedropper (I), Move (V), and Pan (H), selected from the canvas toolbar. Hold Alt to quick-pick a color with the eyedropper; releasing Alt returns to your previous tool.
- **Draw mode** - in inpainting mode the toolbar has an Inpaint Mask / Regular Inpaint toggle that decides whether your strokes paint the mask or paint regular pixels. Switching from an existing image starts in Inpaint Mask mode; strokes painted on regular layers in Regular Inpaint mode are composited over the base image when you generate.
- **Layer panel** - layers are grouped into Inpaint Masks and Layers, each collapsible with a count badge and its own add button. Every row shows a live thumbnail, an enable toggle, and a lock, and you can reorder, duplicate, delete, or double-click to rename. The selected layer gets an opacity slider.
- **Dimensions** - the canvas auto-syncs its size with your generation settings. Loading an image into inpainting (**Send to inpaint** from the gallery, drop, browse, or paste) sets the canvas and the generation size to the image instead, so the mask matches it pixel for pixel. Very large images are scaled down to a 4 megapixel cap first.
- **Live preview** - the in-progress generation is shown as an overlay on the canvas.
- On generate, the editor exports the base image (with any Regular Inpaint layers composited on top) and the mask.

## Mask painting

Paint a mask over the area you want to regenerate, using the brush, the Rectangle tool, or the Lasso for a freehand selection. Denoise strength (0 to 1) controls how much the masked area changes.

With NovelAI selected, **Image settings** replaces the ComfyUI denoise slider under the image upload: **Strength** (0.01 to 1.00, default 1.00), **Focused inpainting** (crops and upscales small masked regions to ~1 MP and blends them back), and **Keep the area outside the mask** (feathered composite over the untouched original). **Noise** is only shown in img2img, as NovelAI inpainting keeps added noise at zero. See [[NovelAI Backend]] for model-specific inpainting behavior.

While you are painting, the mask stays visible. Once a result finishes it hides so you can see the clean output, and it comes back automatically during a re-roll or as soon as you paint more mask.

## Reviewing and accepting results

Each Generate re-rolls the masked region from the original base image, so you can keep rolling variations of the same area without your earlier attempts stacking up.

- **Accept** - when a result is ready an Accept button appears at the bottom of the canvas (and in the staging strip). Accepting promotes the current result to be the new base image so you can continue editing from it.
- **Undo inpaint** - steps back through previously accepted bases.
- **Staging strip** - lists the edit sources from the current session so you can send any of them back into inpainting.

## Correcting a paused generation

For a paused ComfyUI Text to Image run, **Paint a correction** opens its preview here. Paint the correction, mask the area to replace and choose **Continue with edit from step …**. This blends the edit into the paused latent and runs the remaining sampling steps. See [[Generation Basics]] for continuation constraints and session lifetime.

## Outpainting

The **Outpaint** generation mode extends an image beyond its original borders without manually resizing or masking on the canvas:

- Load a source image directly or click **Send to outpaint** from the gallery.
- Set pixel padding on any combination of **Top**, **Bottom**, **Left**, and **Right**, or use the quick presets (**Sides**, **Top/Bot**, **All +256**, **Reset**).
- Adjust **Feather width** to control how smoothly new pixels blend across the padded boundary, while watching the expanded frame in the live preview.
- Works across ComfyUI image models (using `ImagePadForOutpaint` and appropriate inpaint/latent mask conditioning) and NovelAI models.
