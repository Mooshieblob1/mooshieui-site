# Comic Pages

In v2.3.49 and later, the **Comic page** builder creates multi-page comics and doujin books panel by panel. It is in the desktop navigation and on mobile.

## Model and settings

In v2.4.2 and later, the **Model and settings** section picks the model, sampler and pixel budget for your comic. They are kept apart from the Generate page, and the Comic page always generates still images, so a Generate page in Video mode does not block it.

Aspect ratio, batch size, and seed controls are hidden here: each panel's layout box controls its own aspect ratio (or the **Page** shape in **Whole page** mode), while **Resolution** sets the per-panel pixel budget (`~Npx`, shown in the collapsed header).

## Books and pages

- **Book switcher:** use the toolbar dropdown, rename button, `+` (**New book**), and delete button to organize separate multi-page comic projects.
- **Page Strip:** below the canvas, switch pages or use **+ Add page**, **Duplicate page**, **Move page left**, **Move page right**, and **Delete page**.
- **Page** shape (**Portrait**, **Square**, **Landscape**), **Gutter** slider, and reading direction (**Reads left to right** / **Reads right to left**) apply across the book.

## Layout

Switch between **Grid** and **Freeform** mode in the toolbar:

- **Grid:** pick one of 15 **Layouts** templates (1 to 6 panels), split any panel across (**Split ⇆**) or down (**Split ⇅**) up to 9 panels, drag dividers to resize, or **Remove panel**. Undo with **Undo** or `Ctrl+Z`.
- **Freeform:** converts the current grid cleanly into freely movable boxes. Drag a panel to move it (edges and centers snap to neighboring panels and page bounds; hold `Shift` to bypass snapping), drag any of the 8 handles on the selected panel to resize, add boxes with **+ Panel**, and change overlap order with **Layer up** and **Layer down**. Overlapping panels render with a crisp white outer halo.
- **Pan, zoom, borders, and takes:** enable **Pan** mode (or hold `Alt` and drag) to pan a panel's cropped image, scroll on a selected panel to zoom, and click **Reset crop** to recenter. Pick a panel **Border** style (**Standard**, **Borderless**, **Rounded**, or **Slanted**), and step through **Previous take** and **Next take** to switch between generated variations for that panel.
- **Non-destructive switching:** switching to a layout with fewer panels (or removing a populated panel) stashes the extra panels and their generated images under a `+{count}` indicator next to **Layouts**, restoring them when you pick a larger layout.

## Panels and prompting

Tag-assisted fields (**Style for every panel**, **Setting**, **Page setting override**, **Cast** **Appearance**, and each panel's **Prompt**, **Negative**, and **Setting for this panel**) use the same Danbooru tag autocomplete, spellcheck, weight adjustment, and LoRA keyword suggestions as the main Generate page. **Story beat** and **Dialogue** stay plain text.

- **Each panel** makes one image per panel at the panel's own shape and pixel budget, then crops them onto the page. Very tall or wide panels are clamped to between 1:3 and 3:1.
- **Whole page** makes the active page in one NovelAI image (up to 6 panels), with each panel's prompt placed at its position. It needs a NovelAI model. See [[NovelAI Backend]].

### Dialogue and speech bubbles

- **Dialogue** holds the spoken words for one panel, one speech bubble per line. On NovelAI models the lines are lettered into speech bubbles automatically (`Text:` block). When generating in **Whole page** mode, all bubbles across the page are lettered in reading order. Enter only the spoken words, not speaker names or quotation marks.
- **Vector speech bubbles:** click **+ Bubble** on the toolbar to place a vector speech bubble on the page, or **From dialogue** on a panel to convert its dialogue lines into vector bubbles across any model. Select a bubble to edit its text, drag its resize or tail handles, and adjust **Shape** (**Speech**, **Thought**, **Shout**, **Caption**), **Font** (**Sans**, **Serif**, **Comic**, **Mono**), **Size**, and **Vertical JP** (top-to-bottom Japanese `tategaki` lettering).

### Enhance for V5

When a NovelAI V5 model is selected and a [[Prompt Assistant]] is configured, each panel shows an **Enhance** button. It rewrites that one panel's prompt and dialogue with the rest of the page and prior pages as context. **Write prompts from beats** also applies the V5 Enhance rules when V5 is selected.

## Continuity and cast

- **Cast:** shared across all pages of the book. Use **+ Add character** to describe someone from scratch, or **+ From Characters** to import name, prompt tags, and portrait reference from your saved characters. Assign cast members per panel with the **In panel:** chips.
- **Setting:** the book **Setting** applies to every panel, with an optional **Page setting override** (for multi-page books) and **Setting for this panel** override.
- **Character ref:** pass a reference image to generated panels on supported models (NovelAI Precise Reference, Flux/Klein/Qwen/MOSS Image Edit, and Anima Ref Adapter):
  - **Off:** no image reference.
  - **Page 1 Panel 1:** reuses Page 1 Panel 1's generated image across all pages of the book.
  - **Previous panel:** passes the immediately preceding panel's image (crossing from one page's last panel into the next page's Panel 1).
  - **Cast portraits:** passes the portrait reference images of the cast members assigned to each panel.
- **Panel check:** with **Check each finished panel with the tagger and flag a changed look or setting** enabled, the tagger compares each finished panel against its cast and setting and flags missing or changed traits, with a **Check again** button.
- **Check story** and **Write prompts from beats** send the active page plus summaries of earlier pages to the [[Prompt Assistant]] so dialogue, props, and actions stay consistent across pages.

## Saving and exporting

- Panel images save to the gallery as they finish and restore on reload.
- **View page** previews the assembled page; **Save page** saves the active page to the gallery with panel metadata.
- **Save all** (shown for multi-page books) saves all pages with art to the gallery in order.
- **Export CBZ** packs all pages with art into a numbered `.cbz` comic archive (`001.png`, `002.png`, ...).
- **Export PDF** exports all pages with art as a multi-page `.pdf` document matching each page's aspect ratio.

## MCP

AI assistants can generate single comic pages over MCP with `create_comic` (using `layout`, `rows`, or freeform `boxes` with `z` layer order) and remake panels with `redo_comic_panels`. See [[AI Assistants and MCP]].
