# Compare Grid (XYZ Grid)

The Compare tab (bottom panel) builds a grid of cells for side-by-side parameter comparison.

- **Per-cell parameters** - each cell has its own generation settings. Tweak prompts, checkpoints, samplers, seeds, or any setting per cell.
- **Grid generation** - pressing Generate queues every cell sequentially, sharing one random seed for a fair comparison.
- **Auto-stitching** - finished grids are stitched into a single labelled image. Annotations show only what differs between cells (for example "blue eyes" vs "green eyes") plus a MooshieUI watermark.
- **Spreadsheet naming** - cells use A1/B1/C1 labels with position-stable colors.
- **Add/remove columns and rows** - new cells clone the adjacent neighbor so you can vary one parameter quickly.

To hold two finished images against each other instead of generating a sweep, see [[Image Comparison]].
