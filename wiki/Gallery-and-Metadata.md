# Gallery and Metadata

## Gallery

- **Persistent** - saved images and videos are discovered from the gallery directory; SQLite caches metadata. Saved items remain available across sessions, subject to retention settings. With **Manual save mode** enabled, finished results wait in the preview until you choose **Save to Gallery**; **Discard** drops an unsaved result.
- **Thumbnail grid** - responsive, sortable by date.
- **Lightbox** - click any image for full size: scroll-wheel zoom at the cursor, double-click to reset, Escape or click-outside to close. Deleting from the lightbox moves on to the next image (the previous one at the end of the list) instead of closing, so you can review and cull at full size. The metadata panel includes how long the image or video took to generate.
- **Image management** - rename, delete, copy to clipboard, and upscale from the gallery. Deleting from a tile, a Detailed View row or the selection bar removes the images at once and shows a **Deleted N** toast with **Undo** for 7 seconds. The files only go to the bin when the toast closes, and **Undo** brings them back with their board, favourite and rating. Originals in a linked folder, and deletes from a right-click menu, ask **Delete this image?** first. The lightbox trash button and the bottom panel's selection bar delete in one click for quick culling. Deleted images and videos go to the OS Recycle Bin (Windows), Trash (macOS), or desktop trash (Linux) rather than being permanently removed. If no usable bin is available, the file is deleted for good.
- **Touch screens** - tapping a tile opens the preview. To reach a tile's buttons, tap the **⋯** (Actions) button in its bottom-right corner; tap it again to close the tray. Keyboard focus inside a tile also shows the tray.
- **Video actions** - hover a still image for **Make video** (send it to a new video generation as the first frame) or **Add as video reference** (add it to the reference slots). See [[Video Generation]].
- **3D** - on a still image, opens the 3D page with that image as the source. See [[Image to 3D]].
- **Boards** - sort images into named boards. **Create Board** adds one, **Assign board** on an image moves it there, and the **Board Filter** shows one board, **All Boards** or **Unsorted**, with each board's image count. With a board picked, **Rename board** and **Delete board** appear beside the filter. Renaming to an existing board's name merges the two, and deleting a board sends its images back to Unsorted. A row of board chips above the grid sets the filter in one click; drag a tile (or a selected tile, to move the whole selection) onto a chip to move it there. The gallery can also be grouped by board. **Sort by Artist** assigns images to boards automatically from the artist tags in their prompts. Boards belong to your account and sync across devices.
- **Edit in Photopea** - the pencil button in the lightbox opens the image in the embedded [Photopea](https://www.photopea.com/) editor. **File > Save** (Ctrl+S) inside Photopea saves the result back to the gallery as a new image; the original is kept. Photopea loads from photopea.com, so it needs an internet connection.
- **Compare** - hold any two images against each other in a slider, fade, difference or side-by-side view. See [[Image Comparison]].
- **Mode labels** - output records its generation mode, including Image Edit and video.
- **Show Generation Time** - a checkbox in the gallery toolbar that displays each item's generation time directly on the grid and details view, instead of only on hover.

- **Large galleries** - only the rows near the screen are drawn, and thumbnails are cached on disk (up to 1 GiB), so galleries with thousands of images scroll and reopen quickly.

In hosted/multi-user mode regular users and moderators have isolated galleries. Their saved images and videos expire after 7 days by default; an admin can disable this with **Never auto-delete gallery images** in Settings > Gallery. The shared root gallery used by desktop/localhost/admin accounts is not expired by this cleanup. Account storage quotas are separate from expiry.

## Selecting and bulk actions

Every tile and Detailed View row has a checkbox (shown on hover, always shown on touch screens or once anything is selected). A plain click still opens the image.

- **Shift+click** selects a range, **Ctrl/Cmd+click** picks single images, **Ctrl/Cmd+A** selects everything the current filters show. **Escape** clears and **Delete** deletes. With **Group By** on, each group header has its own checkbox.
- **Arrow keys** move a cursor through the grid. **Shift+arrow** extends the selection, **Space** selects, **Enter** opens the image.
- The bar at the bottom moves the selection to a board, sets rating, favourite or NSFW, compares two images, or deletes.
- **Export** (desktop) asks for a folder and writes a copy of every selected image there with its metadata embedded. Videos are copied as they are.

Changing a filter drops selected images it hides, so a bulk action never touches an image you cannot see.

## Finding repeats

The **Repeats** filter shows only images generated more than once with the same prompt, negative, seed, model, sampler settings and size, grouped per set with the oldest first. **Select extras** selects every copy but the oldest, ready to delete. Images from one batch share a seed but are not counted as copies of each other. This compares saved settings, not pixels.

## Characters in the gallery

Once you have saved characters, the gallery matches them to images by the tags in each image's prompt, with no model run. A card tagged `1girl` only matches images with a girl; otherwise the character's name as a tag, or most of its identity tags (hair, eyes, ears and the like), make a match. NovelAI images are checked one character box at a time.

- The **Character** filter shows each character with a count, and **Group By** can group by character. Detailed View lists the characters found under the file name.
- **Sort by Character** moves Unsorted images with exactly one character into a board named after it.
- **Scan for characters** runs the built-in tagger on images with no saved prompt (imports, stripped metadata), on the selection or on everything shown. Each image is tagged once and remembered. Over 100 images it asks first; while it runs the button shows **Stop scan (done/total)**. Linked folders and videos are not scanned.

## Folding the filters

The **Filters** button next to the search box folds the filter panel down to the search row. The choice is remembered, and a dot on the button shows when a folded filter is narrowing the gallery.

## Search, favourites and NSFW

In v2.3.21 and later the gallery toolbar has a search box and more filters.

- **Search** looks through each image's prompt, model, LoRAs and file name. Every word must appear. `"red scarf"` in quotes matches the exact phrase, and `-hat` leaves out images that contain hat. The fields `neg:`, `model:`, `lora:`, `sampler:`, `scheduler:` and `file:` search one part only, for example `neg:blurry` or `model:illustrious`. `seed:`, `steps:` and `cfg:` take a number with `=`, `>`, `>=`, `<` or `<=`, for example `steps:>=30`. The **?** button next to the box lists the syntax.
- **Favourites and ratings** - mark an image as a **Favourite** or give it 1 to 5 stars. Filter with **Favourites only** and the **Rating** filter, or sort by rating. In the lightbox, `1` to `5` set the rating, `0` clears it, `F` toggles favourite and `N` toggles NSFW.
- **NSFW** - images whose prompt contains one of the keywords in Settings > Gallery are flagged NSFW automatically, unless you have marked them yourself. The **NSFW** filter offers **Show all**, **Hide NSFW** and **Only NSFW**. **Blur NSFW** (off by default) blurs them in the gallery, the bottom strip and the image picker, and the lightbox covers them until you choose **Show NSFW image**.

Favourites, ratings and NSFW marks belong to your account and sync like boards, so browser and LAN users keep them across devices.

## Linked folders (desktop)

Settings > Gallery > **Linked folders** shows the images in other folders and their subfolders in the gallery without copying them. Search, ratings and boards work on them too, and they get thumbnails, metadata, the lightbox, copy and export. The **Source** filter switches between **All sources**, the **MooshieUI gallery** and each linked folder. Deleting a linked image asks first and moves the original file to the recycle bin. **Stop showing this folder** removes a folder without touching its files. Linked folders are not available in browser or LAN mode.

## Refresh gallery

MooshieUI v2.3.6 adds **Refresh gallery** to the toolbar. Use it after adding, replacing or deleting files outside the app. It reads the gallery directory again, refreshes metadata and thumbnails, adds newly discovered files and removes missing saved files. Unsaved results and saves already in progress are preserved. Refresh does not rename files or run the legacy metadata migration.

## Save format

**Format** in the sampler settings picks how generated images are written to disk.

| Format | Notes |
|--------|-------|
| **PNG** | The standard, widest support. |
| **JXL** | JPEG XL, lossless and roughly 40% smaller than PNG, with metadata in a SwarmUI-compatible XMP box. Not every viewer opens it. |
| **WebP** | Lossless (VP8L), smaller than PNG, and openable by any browser, phone or image viewer, so it suits images headed somewhere outside the app. |

WebP has no 16-bit mode, so choosing it locks **Bit Depth** to 8-bit and the 16-bit button explains why. Exporting a WebP out of the gallery keeps the original file rather than converting it.

## Metadata embedding

Generation parameters are embedded into your saved images so they can be read back later.

- **PNG text chunks** - standard tEXt metadata, and UTF-8 iTXt when the prompt contains characters tEXt cannot hold (Japanese, Chinese, Korean, emoji). Reading also handles iTXt and compressed zTXt, so images written by other tools that use them are not treated as having no metadata.
- **Stealth alpha** - parameters can also be hidden in the least-significant bits of the alpha channel, readable client-side without a server round-trip. It works with PNG and with lossless WebP.
- **JPEG XL (JXL)** - metadata goes in a SwarmUI-compatible XMP box.
- **WebP** - parameters are stored as an EXIF UserComment following the A1111 convention, so exiftool, CivitAI and the usual web UIs read them back.
- **NovelAI PNGs** - original provider text chunks survive saving, clipboard copying and face-detail compositing. The import dialog understands their characters and NovelAI options. See [[NovelAI Backend]].

## Video metadata and export

Gallery videos retain generation parameters and timing. Export supports MP4, animated WebP, AVIF and GIF; MP4 keeps audio. Each has a metadata carrier, and MP4/AVIF also receive an XMP box. Sharing or re-encoding can remove metadata, so retain the original when you need to recover settings. See [[Video Generation]] and the [metadata-carrier reference](https://github.com/Mooshieblob1/MooshieUI/blob/main/docs/METADATA_CARRIERS.md).

## Remix and Reuse Settings

On a saved gallery image, **Remix** restores its settings with a new random seed. **Reuse Settings** also restores the saved seed. In v2.3.7 and later, both actions restore the saved LoRA list, including separate model and CLIP strengths of zero. Restoring an image made without LoRAs clears the current LoRA selection.

Only LoRAs present in the connected server's loaded model list are restored. Missing LoRA files are skipped. **Reuse Seed** changes only the seed and leaves your LoRA selection alone.

## Invisible watermark and fingerprint

Text chunks and stealth alpha are lost when a site re-encodes an image, it is resized, or someone screenshots it. Two invisible layers let a stripped copy find its gallery record, which still holds every setting.

- **Fingerprint** (always on, no setting): every gallery save stores a perceptual hash in the gallery index. Nothing in the image file changes.
- **Watermark** (off by default): the **Watermark** Off/On chips under **Metadata** hide an invisible ID in the pixels of every saved image, with no visible change. The first use downloads about 65 MB. NovelAI PNGs, 16-bit images, videos, images under 256 px and JXL saves are not marked.

When you drop or open an image with no metadata of its own, MooshieUI reads the watermark, then looks for the closest fingerprint among the images in your own gallery folder, and restores that image's settings. The toast says **Restored ... from the watermark** or **Restored ... from a gallery match**. A MooshieUI watermark with no record in your gallery shows **Made with MooshieUI, but not in your gallery**.

## Drag-and-drop remix (metadata import)

Drag or paste a previously generated image into MooshieUI to read its embedded settings. It understands SwarmUI JSON (`sui_image_params`), A1111-style text and NovelAI metadata; NovelAI imports offer a choice of fields to restore. PNG parsing can happen client-side; other formats are read by the app. An image without metadata can still be matched to your gallery (see Invisible watermark and fingerprint above). Missing metadata cannot restore an original img2img source or guarantee identical pixels.

Imports normally adopt the image's aspect ratio at your current resolution rather than replacing the pixel dimensions. Inpainting aligns the canvas to the image, a direct drop onto Dimensions explicitly requests its size, and resolution locking changes the import behavior. See [[Generation Basics]].

This pairs well with image interrogation (see [[Prompting Guide]]) when you want to recover a prompt from an image that has no embedded metadata.
