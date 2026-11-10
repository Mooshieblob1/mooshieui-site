# Image Comparison

The comparison viewer holds two images against each other so you can judge one against the other without opening them in a separate program. For parameter sweeps that build a grid of variations in one go, see [[Compare Grid]] instead.

## Opening a comparison

1. Press **Compare with...** on an image. It is pinned as side **A**.
2. Pick a second image and press **Compare with pinned image**. The viewer opens with that image as side **B**.

**Cancel compare** drops the pin without opening anything. Compare is reachable from the gallery grid, the gallery list, the lightbox toolbar, and the right-click menu on a freshly generated image.

## Modes

| Mode | What it does |
|------|--------------|
| **Slider** | Drags a divider across the pair, **Horizontal** or **Vertical**. |
| **Fade** | Blends between A and B with a **Blend** slider. |
| **Difference** | Shows only what changed, for spotting a subtle seed or CFG shift. |
| **Side by side** | Puts the two images next to each other. |

Difference needs two images of the same size. When they differ the viewer says so, and the other three modes still work.

## Moving around

- Both images zoom and pan together, so a detail stays aligned as you look closer. Scroll to zoom, drag to pan, double-click to reset.
- **Left** and **Right** arrows step image B through the rest of the gallery. Hold **Shift** to step image A instead, so you can keep one image fixed and flip through candidates against it.
- With the divider focused, the arrow keys nudge it.
- **Swap A and B** flips the pair, **Reset zoom and pan** returns to the fitted view, and **Escape** closes the viewer.
