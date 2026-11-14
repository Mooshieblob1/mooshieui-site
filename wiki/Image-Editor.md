# Image Editor

MooshieUI has a built-in image editor for touching up results without losing their generation metadata. Editing in an outside program usually strips the prompt and settings from the file. Here, every save writes the source image's metadata onto the edited pixels, following your metadata settings.

## Opening it

- **Edit** on the generation preview's hover buttons.
- **Edit** on a gallery tile, in the grid or in Detailed View.

The editor opens full screen. Layout and shortcuts follow Photoshop: tools on the left, tool options and actions along the top, adjustments and layers on the right, and a status bar with zoom, image size and a metadata badge.

## Tools

| Tool | Key | Notes |
|------|-----|-------|
| Move | V | Drag the active layer, or drag a handle to resize it (Shift frees the proportions). Arrow keys nudge by 1 px, Shift+arrow by 10. |
| Hand | H, or hold Space | Pan the view. |
| Zoom | Z | Also the mouse wheel. Ctrl+0 fits, Ctrl+1 is 100%, Ctrl+= and Ctrl+- zoom in and out. |
| Crop | C | Free, Original, 1:1, 4:5, 2:3, 3:2, 16:9, 9:16. Enter applies, Esc cancels. |
| Brush | B | Size, hardness and opacity. `[` and `]` change size, Shift+`[` / `]` hardness. |
| Eraser | E | Same options as the brush. |
| Clone stamp | S | Alt+click sets the source. |
| Eyedropper | I | Or Alt+click with the brush. |
| Rectangular marquee | M | Ctrl+A selects all, Ctrl+D deselects, Ctrl+Shift+I inverts. |
| Lasso | L | Freehand selection. |
| Text | T | Click to place a line, type in the options bar, pick font, size, bold, italic and colour. |

A selection limits the brush, eraser, clone stamp, Fill (Alt+Backspace) and Clear (Delete). Adjustments always apply to the whole image.

The top bar also has rotate left and right, flip horizontal and vertical, and Image size (Ctrl+Alt+I) with a proportions lock.

## Layers

- New layer (Ctrl+Shift+N), duplicate or copy the selection to a new layer (Ctrl+J), merge down (Ctrl+E), reorder and delete.
- Each layer has visibility, opacity and a blend mode (15 modes, Normal to Luminosity). Up to 16 layers; they are flattened when you save.
- **Layer masks**: Add mask creates a mask from the selection, or the whole layer. With Paint on, the brush hides and the eraser reveals, and Fill and Clear do the same for a selection. Enabled turns the mask off without losing it.
- Text stays editable through crop, resize and Move. Painting on it, rotating, flipping or merging turns it into pixels.

## Adjustments

Adjustments are non-destructive until you save. Double-click a slider to reset it.

- **Light**: brightness, contrast, highlights, shadows.
- **Curve**: click to add a point, drag to shape, double-click a point to remove it.
- **Color**: temperature, tint, saturation, vibrance, hue.
- **Detail**: sharpen, blur.
- **Effects**: vignette.
- **Preset**: save the current adjustments under a name and apply them to any other image. Presets are stored per browser or device.

## Undo and saving

- Undo (Ctrl+Z) and redo (Ctrl+Shift+Z or Ctrl+Y) go back 30 steps. Very large images keep fewer steps, since each paint stroke keeps a copy of its layer.
- **Save to gallery** (Ctrl+S) adds a new gallery item. The original is never overwritten.
- **Save as file** (Ctrl+Shift+S) writes a PNG with the same metadata embedded.
- Closing with unsaved changes asks **Discard changes?** first.

## NovelAI images

Editing a PNG made by NovelAI keeps NovelAI's own PNG text chunks on the saved file, so novelai.net still recognises it and can read its settings. NovelAI's hidden alpha-channel data cannot survive edited pixels; the text chunks are what is kept.

## See also

- [[Gallery and Metadata]] for how metadata is stored and read back.
- [[Inpainting and the Canvas Editor]] to change part of an image with the model instead of by hand.
