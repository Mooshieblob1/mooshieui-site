# NovelAI Backend

MooshieUI can generate through NovelAI's image API as a second backend alongside ComfyUI. Paste an API key in Settings and four NovelAI models appear in the normal model dropdown. Selecting one switches the whole generation page over: the controls NovelAI does not have are hidden, and NovelAI's own controls take their place.

Generations run on NovelAI's servers and may spend Anlas depending on the request and your allowance. Gallery and comparison tools remain available; local upscaling and face detection need a running ComfyUI. Image Edit, video and sampling pause/continue are ComfyUI features.

## Setup

1. In NovelAI, open **User Settings, Account** and create a persistent API token.
2. In MooshieUI, open **Settings, NovelAI** and paste it into **API Key**, then **Save**.
3. The saved-key field stays blank and shows its configured status. **Clear** removes it. Personal account keys are encrypted; desktop/admin keys remain in the owner's app config and are accessible to trusted admins.

The same section shows your **Anlas** balance, whether an **Opus subscription** is active, and your remaining **Opus Generation Allowance** with the daily refill rate. V5 is not covered by Opus unlimited: its free generations come out of that allowance, so once it is empty a V5 generation costs real Anlas until it refills, and the cost badges say so. V4.5 and V4 keep the unconditional Opus discount inside the 1MP, 28-step window. **Refresh** re-checks with NovelAI. Turn on **Show Anlas above the generate button** to pin a compact version of that readout to the generation page.

## Hosted accounts

On a shared server, regular users and moderators each add their own key in **Settings, NovelAI**. **Save** changes only that account's key, and **Clear** removes only that account's key. Without one, the NovelAI models are hidden and NovelAI requests fail without using the host's subscription.

Account keys are encrypted on the server and survive a restart. Deleting an account removes its key even when its gallery is kept. Moderators can manage shared settings but cannot read or replace the host's NovelAI key through those settings.

The desktop app, localhost connections, and admin-role accounts use the instance owner's key in the existing app config. Promoting an account to admin switches it to that owner key; demoting it restores use of its own saved key.

Server operators can supply `MOOSHIEUI_SECRET_KEY` as base64-encoded 32 bytes. Otherwise, MooshieUI creates `secrets.key` in its data directory. Keep that master key with a recoverable backup, or users must enter their NovelAI keys again. For hosted deployments, supply it through a secret store separate from the account-data volume.

## Models

Four entries join the model dropdown:

- **NovelAI V5 Full**
- **NovelAI V5 Curated**
- **NovelAI V4.5 Full**
- **NovelAI V4 Full**

The three Full models show an **18+** pill in the model picker. V5 Curated has none.

| Model | Character slots | Vibe Transfer | Precise Reference | Transparent BG |
|-------|-----------------|---------------|-------------------|----------------|
| V5 Full / Curated | 22 | Disabled in this release | Disabled in this release | Yes |
| V4.5 Full | 6 | Yes | Yes | No |
| V4 Full | 6 | Yes | No | No |

Per-character prompts, Vibe Transfer and Precise Reference are per-model capabilities. Where a model does not support one, the panel says so instead of letting you build a request that would be rejected.

Picking a NovelAI model applies NovelAI's recommended sampling defaults: 23 steps, guidance 7.0, Euler Ancestral, Karras, guidance rescale 0.

**Text in the image (V5).** On a V5 model, anything you put in quotes in the prompt is automatically formatted the way NovelAI's own site formats text to render, so `a sign saying "open"` works without extra syntax. Straight quotes, curly quotes and Japanese corner brackets are all recognised. If you write your own `Text:` line in the prompt, the automatic formatting stays out of the way. Prompts sent to NovelAI keep their line breaks, so a `Text:` line followed by the words to render on the next line reaches NovelAI as you typed it, and a blank line separates one rendered string from the next. Tags the app adds on its own, from a style preset, an active Artist Style, a Prompt Chunk or **Transparent BG**, are spliced in ahead of the `Text:` block, so nothing lands in the lettering.

**The `artist:` prefix is dropped on the way out.** Danbooru tags its posts with the bare artist name, so `artist:` is a search box filter the model was never trained on and it only spends tokens. MooshieUI strips it from the base prompt, the undesired content, and every character prompt and undesired content box before the request goes to NovelAI. It is only removed at the start of a tag, so `artist name`, `artist_name` and `subartist:` are left alone, and anything inside a `Text:` block is handed over byte for byte. Your prompt boxes and the metadata saved with the image keep exactly what you typed.

**V5 Curated inpainting** currently runs on V4.5 Curated's inpainting model, because V5 Curated's own is still training upstream. NovelAI's own client does the same.

## Characters

NovelAI keeps characters apart rather than blending them into one description. The **Characters** panel gives each one its own positive and negative box, so "one in a red coat, one in a blue coat" stays that way.

**Position** decides who stands where. **Let NAI decide** leaves the placement to NovelAI. **Custom** turns on explicit positions and adds an **Edit positions** button, which opens a canvas drawn at the aspect ratio you have selected, with one numbered circle per enabled character. Drag a circle anywhere on it, or tab to one and nudge it with the arrow keys. Characters dropped on top of each other are flagged, because overlapping placements tend to come back as low quality results. The panel itself can be dragged wider, and a double-click resets its width.

V5 seats up to 22 characters; V4.5 and V4 stop at 6. The **Add** button disables at the cap and the panel states the number when you reach it.

Positioning is only honoured with two or more characters. With a single character, V5 centres the subject regardless of where the circle sits, and NovelAI's own site behaves the same way.

## Image references

Two reference types, and they cannot be combined. Adding to one clears the other.

- **Vibe Transfer** carries the mood, palette and style of a reference image into the result. Each new image costs Anlas to encode, and the panel shows the amount before you commit. **Normalize strengths** scales multiple vibes so they add up to 1, matching the option in NovelAI's own client.
- **Precise Reference** copies a character or a style with more control than Vibe Transfer. Each image picks what to take from it (Character, Style, or Character and style) and carries a **Strength** slider and a **Fidelity** slider, where Fidelity is how closely the result follows the reference image. Reference images are reshaped to one of the three canvas sizes NovelAI's encoder accepts before they are sent, so you can use any aspect ratio and the image you are generating is unaffected. Each Precise Reference costs 5 Anlas per image, even on Opus, and the cost estimate includes it.

## NovelAI options

The **NovelAI options** panel carries the settings that only exist on this backend:

- **Quality tags**: Standard, Light, or None. Appends NovelAI's own quality tags to the prompt the same way the official client does. Light is offered on V5 models only.
- **Undesired content preset**: Heavy, Light, Human focus, Furry focus, or None. The preset's tags are put ahead of your undesired content before sending. Both dropdowns list only what the selected model supports.
- **Effort**: **Medium** or **High**, shown for V5 Full only. Medium runs NovelAI's distilled V5 Full checkpoint, which NovelAI says costs about 40% fewer Anlas at comparable quality. It fixes 14 steps, Euler Ancestral and the Heavy undesired content preset; your own undesired content is not sent on Medium, so steer unwanted content with negative emphasis in the prompt instead (for example, `-3::hat::`). CFG rescale is also disabled on Medium. High is the default. Face-detail crops always run at High.
- **Variety+** adds variation to the first steps for livelier compositions.
- **Dynamic thresholding** reins in oversaturated color at high guidance.
- **Guidance rescale** and **Undesired content strength**. Setting the latter to anything other than 1.00 costs 30 percent more Anlas, and the panel says so.
- **Legacy undesired content** for matching older images.
- **Transparent BG** on V5 asks for a real alpha channel. Local post-processing and face detailing are skipped when it is enabled to avoid flattening transparency.

A token counter sits under each prompt box, showing the estimate against NovelAI's limit.

## Cost

The generate button shows an **estimated** Anlas cost before submission. Estimates are calculated by the app, not a billing quote from NovelAI. Check your refreshed balance/allowance for actual usage; face crops, vibe encoding and enhancement operations can add their own costs.

## Queueing

NovelAI runs one image request per account at a time. In v2.3.36 and later MooshieUI sends queued NovelAI generations one after another per account, in queue order, so a batch no longer times out. A busy answer (429) is retried on its own after a short wait. Two different API keys still run side by side.

## Local post-processing

Upscaling runs on your own machine after NovelAI returns the image, so it costs no Anlas. Pick a local checkpoint in the **Local post-processing** panel. Faces have their own panel now, see Face detailer below. Anima at denoise 0.15 to 0.2 works well as a refiner. Split-file models are handled: the panel names the text encoder and VAE it paired, or tells you which companion file is missing. See [[Upscaling and Face Fix]].

If the upscaler set in the Refiner is a recommended model that is not installed, it is downloaded automatically before the generation starts. A non-recommended upscaler that is missing stops the generation with a message naming the file. If the local pass is skipped or fails, a **Local refine skipped** or **Local refine failed** notification in the notification bell says why; the original NovelAI image is saved as-is. When a Krea 2 model is selected as the local refine checkpoint, the pass uses Krea 2's own sampling: CFG 1, euler / simple for Turbo; CFG 4, er_sde / sgm_uniform for Raw.

The **Refine** button on the live preview follows the same split. With a NovelAI model selected and a key saved it opens NovelAI's **Enhance** instead of the local chain, because a paid img2img pass at a larger canvas is a different operation with its own controls. With no key it falls back to the local chain, and if no local checkpoint is picked here it says so rather than failing on a missing model. The missing-upscaler check also runs when Refine triggers a local pass.

## Face detailer

In NovelAI mode the Face Fix panel is replaced by **NovelAI Face Detailer**, its own panel with its own settings. Faces are found locally with a YOLO detector, which needs ComfyUI running with `ultralytics` installed; only the repaint goes out to NovelAI.

**Detailer Engine** picks who repaints each face:

- **NovelAI (matches style)** sends each face crop back to the same NovelAI model that drew the image, as img2img at low strength, then blends it back with a soft edge. The face keeps the style of the picture.
- **Local checkpoint** uses the checkpoint from the Local post-processing panel. Always free, but it paints faces in its own style.

On the NovelAI engine each face is a separate request. **Anlas Policy** controls its step limit: **Fit Opus size/step limits** keeps crops within 1 MP and caps steps at 28; **Allow paid crops** keeps the requested face steps. Crops use **Guide Size**, capped within 1024×1024 under either policy. Fitting the window is only covered when your account/model has an available free allowance. A plan without that allowance, or an exhausted V5 allowance, still incurs Anlas charges, and the panel warns you.

**Face Prompt** controls what each crop is conditioned on. **Auto** merges identity tags from your prompt with tags read off the crop by the tagger (the interrogator's model; without it auto falls back to prompt identity only). **Generic** uses quality tags only, and **Custom** uses your own text. The full prompt is never sent with a crop, so scene and pose tags cannot bleed into a face. On the local engine auto uses prompt identity only, since the tagger does not run there.

**Steps** in the face detailer follows the main Steps setting. Changing the detailer slider gives it a separate value until you next change the main Steps setting. The free-window policy still caps crop requests where needed. New settings start with **Confidence** at 0.4 and **Strength** at 0.5.

Each face pass streams its own preview and step progress. A notification explains skipped, failed or partially completed passes, including no detected faces, batches with more than one image, and V5 transparent backgrounds. Successful crops remain in a partially completed result.

Composited face-detail results retain the original NovelAI PNG text metadata as well as their post-processing information. Importing a V5 image ignores its placeholder zero for undesired content strength; older models can still restore a real zero.

### Refiner order and oversized faces

This behavior requires **v2.3.2 or later**.

With the local refiner enabled, the order is **NovelAI generation → local refiner/upscale → NovelAI face detailing → final image**. Detection uses the refined image at its actual dimensions. The refiner reports progress and previews under the same generation, and releases its GPU worker before the NovelAI face requests. If face detailing fails, the refined image is retained; if the local refiner fails, the face pass can still use the original NovelAI image.

Each detected face uses **one crop request**. Crops wider or taller than 1024 px are downscaled to fit within **1024×1024**, repainted, then resized back and blended into the original face area. The final image keeps its original dimensions. Aspect ratio is maintained subject to NovelAI’s 64 px request grid.

**Guide Size** still controls the working resolution, including enlarging small faces. The 1024×1024 ceiling applies even to imported settings above 1024 and to **Allow paid crops**. There is no tiled face pass. Close-up faces are still processed when the detailer is enabled; turn it off when the original face already looks good.

**Each face is a separate NovelAI request**, consuming model allowance or Anlas. The base generation estimate excludes these detector-dependent requests. The Opus size/step policy caps each request at 1 MP and 28 steps, but coverage still depends on your plan and remaining allowance. Completed faces remain in a partial result if a later request fails. The existing single-image and transparent-background limits remain.

## Director Tools

Director Tools run one of NovelAI's image passes over a picture you already have. Cost follows the size of the source image, not the tool you pick. Opus covers one image of 1MP or under; a larger or upscaled source costs Anlas on every plan (around 30 at 2MP, 60 at 3MP). **Background Removal is never covered and costs about three times as much.**

| Tool | What it does |
|------|--------------|
| **Background Removal** | Cuts the subject out onto transparency |
| **Line Art** | Reduces the image to clean line work |
| **Sketch** | Redraws it as a rough sketch |
| **Colorize** | Adds color to line art or a sketch |
| **Change Emotion** | Changes the expression on a face |
| **Declutter** | Removes text, panels and other clutter |

Open the modal from any image you already have: right-click a session output, right-click the live preview once a generation has finished, right-click a gallery image, or use the **Director Tools** button in the gallery (a labelled button in details view, a **DT** button on hover in grid view). Opening a gallery image full size gives you a **Director Tools** button in the lightbox toolbar as well. Every entry only appears while a NovelAI model is selected and a key is saved, and never on a video.

Colorize and Change Emotion take two extra fields. **Guidance (optional)** is free-text direction, for example "blonde hair, blue eyes". **Defry** (0 to 5) sets how far the tool may stray from the source, with 0 staying closest. Change Emotion also requires an **Emotion**, one word in English, and will not run without it. The other four tools ignore all three fields and hide them.

Results arrive in the session grid and the gallery like any other generation. Ctrl+Enter submits from a text field, Escape closes.

## Enhance, Upscale and Variations

Three NovelAI passes over an image you already have, sharing one modal with a tab each: **Enhance**, **Upscale 2x** and **Variations**. None of them is the local upscaler, and none is the prompt **Enhance for V5** below.

Open the modal from the lightbox toolbar, from the hover buttons on a gallery tile, or by right-clicking a gallery image. All three get their own button, in the same order everywhere, because they cost very different amounts and the cheap one should not sit behind the expensive one. They only appear while a NovelAI model is selected and a key is saved, and never on a video.

Results arrive in the session grid and the gallery like any other generation. Started from the lightbox, the result takes over the lightbox rather than landing silently behind it. Escape closes the modal, and Ctrl+Enter submits from whichever modal is on top.

### Enhance

Redraws the image at a larger size. This is NovelAI's own upscale-and-redraw pass.

**Upscale Amount** is **1x**, which redraws at the original size, **1.5x**, or **Max**, the largest whole multiple that still fits NovelAI's 3MP ceiling for this particular image. A button hides itself when the source is already close enough to the ceiling that there is nothing to gain. Each one shows the size it will produce and an estimated Anlas cost, and says **Free on Opus** when the Opus allowance covers it.

**Magnitude** is how much the redraw may change the image, from 1 to 5, with 3 as the default. The slider moves in whole steps, but you can type a value with two decimals (1.25 and so on) into the box next to it. **Show Advanced** replaces it with the raw **Strength** and **Noise** the magnitude was standing in for, seeded from wherever the slider was.

There is no prompt box. Enhance uses the prompt, undesired content and characters that are in the generation panel right now, so change them there to change what the enhance draws. Leaving them as they are keeps the image close to what it was.

### Upscale 2x

Enlarges the image 2x with NovelAI's own upscaler, a V5 model. No prompt is sent, so the prompt and characters in the generation panel are ignored. The factor is fixed, so there is no amount to choose, only a **Result** size to read.

The price follows the size of the image going in, not the size coming out, which makes it far cheaper than a redraw. The upscaler takes images up to 3MP; past that the tab says so and points you at Enhance instead.

### Variations

Redraws the image several times at the same size, using the prompt in the generation panel.

**Variations** is how many to make, 1 to 8, with 4 as the default. Every one is charged in full. **Variety** is how far each may stray from the source, from 0.10 to 0.90, with 0.40 as the default.

A finished set opens in the lightbox as a grid rather than as one image. The toolbar toggles between **Show all variations** and **Show one image**, and any tile can be opened on its own or fed straight back into one of the three passes. The grouping is session state and is never written to disk, so a batch reopened after a restart is a plain set of gallery images again.

## Enhance for V5

With a V5 model selected, the prompt box offers **Enhance for V5** in place of the normal **Enhance**. V5 wants a natural language scene body and structured character boxes, which is the opposite of what the danbooru-style enhance produces, so this is a separate path. V4.5 and V4 keep the existing one.

It uses the configured [[Prompt Assistant]] (local or external LLM). It spends no NovelAI Anlas, though an external LLM may have its own charges. Describe a scene in its instruction box, paste a prompt to rewrite, or give an instruction like "make my prompt more cinematic". **Copy existing prompt** fills it from what you already have. **Rewrite language** picks the language the scene description is written in, and Auto detects it from your prompt.

**Edit current prompt** sends your current prompt, undesired content and character boxes along with your instruction, so the rewrite edits what you already have instead of starting over.

The rewrite also remembers the session: earlier instructions and answers go along with each new one, so "now make it night" applies to the last rewrite even without **Edit current prompt**. With it ticked, your current boxes win over the remembered answer. **New session** in the window starts over; see [[Prompt Assistant]].

**Saved characters**: the rewrite knows the NovelAI characters saved in the [[Generation Basics#characters-tab|Characters tab]], and the window lists their names. A full name, a first name or surname alone, or a close approximation resolves to the saved character, who gets a character box from the saved appearance with their avoid list in UC. Text that plainly means someone else is left alone, and characters you do not mention are never added. A variant is picked when the text asks for what it describes. For a saved canon character (for example Brock from Pokemon), the rewrite uses the canon tags and look plus your saved details; where they disagree, the review lists the differences and asks **Keep saved details** (the default) or **Use canon**, which redoes the rewrite.

**Reference images** attaches up to four pictures you can point at in the instruction, for example "put the outfit from image 1 on her". Add them with **Upload**, **Paste** or **Gallery**, and give each an optional **Label** if you would rather name one than number it. The assistant describes what it sees in words before it rewrites, so this needs a model that can see images. The bundled local model cannot, so attach references only with a vision-capable model on an external provider; see [[Prompt Assistant]].

**Curate it** is a checkbox in the input stage, next to **Rewrite language**. Off by default; it resets each time the window opens. When ticked, the rewrite targets V5 Full against the Heavy UC preset. Applying the rewrite also switches to V5 Full and applies a fixed set of settings: Standard quality tags, Heavy UC, guidance 5, 25 steps, Euler Ancestral with Karras, guidance rescale 0, Variety+ off, batch 1 and High effort, and appends a set of extra avoids to the undesired content box, skipping any already there. **Undo** after applying reverses both the prompt fields and the settings change. Your width and height are kept, only rounded to NovelAI's 64 px grid.

**Keep artists** keeps the artist tags from your current prompt in the rewrite, weights and emphasis included (weighted spans, `{}` and `[]`, and `artist:` prefixes). Any the rewrite drops are added back at the end of the base tag line. The choice is remembered.

**Minors rule** (v2.3.40 and later) sits in the same row and is on by default. When the request mentions a child or a school-age character, it adds a rule telling the model to keep them non-sexual. Some hosted providers refuse ordinary SFW school or family prompts because of that rule's wording; turning it off sends the normal SFW guidance instead. A minor together with explicit content is still never sent, and a request that mixes a minor with suggestive words always gets the rule.

The rewrite follows NovelAI's V5 Full and V5 Curated prompting rules. The base prompt is a tag line that locks identity plus a few natural language sentences for camera, layout and mood, with `high complexity` by default. Emphasis is used to lock or kill a motif, not sprinkled on every tag. Every tag has to change the image: a named character's canon look is not restated (momo velia deviluke already has pink hair), and undesired content holds only what would otherwise show up, so `chibi` or `mitten hands` stay out of an ordinary character's list. It can be empty when the **Undesired content preset** is on; quality filler such as `masterpiece` or `best quality` is never added, since **Quality tags** covers that. Artist names ending in digits are put first inside a `1.2::...::` span, and a character box is made to start with `girl`, `boy` or `other` rather than a count or a `Character 1` label.

Nothing is applied until you choose. The review screen lists the base prompt, undesired content, and each character side by side as **Now** and **Proposed**, with a checkbox on each and a running token count against the budget. **Apply selected** takes only what you ticked, and **Undo V5 rewrite** reverses it afterwards.

A rewrite that drops a character removes the box rather than leaving it behind. Asking for a one character scene with two boxes open used to rewrite the first and leave the second standing, so the extra character still went into the image. Each box the rewrite no longer wants now appears in the review as a ticked row reading `(empty)` under **Proposed** with a **removed** chip, and untick it if you would rather keep that box. A box the rewrite adds is marked **new** the same way.

### Keeping outfits apart

With two or more characters, clothes tend to leak between them: a garment restated in the base prompt, or the same piece in two boxes. Since v2.3.41 the rewrite keeps every garment in exactly one character box. The base prompt holds only the count, framing, setting, the shared action and one short sentence placing each character, and it is retried once if its tag line repeats a box's clothing or hair tag. Each character's side is named in both the base and the box, and an interaction the prompt describes (a hug, a headpat, holding hands) gets its `source#`, `target#` or `mutual#` tags. With **Edit current prompt** or a follow-up, existing box outfits are kept word for word unless the instruction changes them.

After every rewrite, each box's own undesired content also gets the other characters' distinctive garments, skipping anything that character wears or already avoids, so a girl in a black hoodie never gets `hoodie` in hers. The review shows each box's undesired content as **Now** and **Proposed**, and **Apply selected** writes it.

The review flags leak risk before you generate:

- **Possible overlap:** chips appear under a row when a clothing or hair tag in the base tag line is also in a box, or a garment is in two boxes. Click a chip to keep the tag in that box only, take it out of the base and the other boxes, and add it to their undesired content (unless they wear it). Hair two boxes share is not flagged, since twins or sisters can look alike on purpose.
- **Isolate outfits** does the same cleanup with no LLM call: it takes restated outfit and hair tags out of the base tag line (prose is left alone), gives each box without placement words its side from the position grid when **Custom** positions are on, and adds the opposite-outfit undesired content. Garments two boxes share stay and keep their chip, since matching clothes can be intended. It is in the review toolbar, on the Enhance input stage and in the **Characters** panel header (V5 models with two or more filled boxes). From the input stage or the panel it opens the review on your current prompt, so nothing changes until you apply, and **Undo V5 rewrite** works as usual.
- When two characters share a hair colour or two or more body tags but wear different clothes, a line reads **Similar bodies, different outfits: opposite-outfit UC recommended**, with an **Add** button (or **Added** once it is there).

### Scene objects and layout

Since v2.3.42, objects and where things sit relative to them (`table in foreground`, `behind table`, `sitting in chair`) go in the base prompt as short tags plus one short sentence. Character boxes keep pose and side of frame only, with no object words, and clothing the object hides is left out. The rewrite never adds tags such as `opaque` or `not on table`, never puts an object the scene contains in undesired content, and moves layout tags it finds in a box to the base tag line. If a layout keeps failing, untick **Use memory notes** (see [[Prompt Assistant]]) so earlier notes do not pull the old composition back in.

## Aspect ratios and resolution

NovelAI mode accepts any aspect ratio: the same eight presets as a local model, plus anything you type. Width and height always land on multiples of 64, rounded down so the area never exceeds what the side length allows (2:3 at a 1024 side is 832x1216, 16:9 is 1344x768). Switching backends only snaps the current width and height to that grid; it never recalculates them from the ratio.

## Copying NovelAI images

**Copy to clipboard** on the preview and **Copy to Clipboard** in the gallery preserve the original NovelAI PNG text metadata. On desktop, copying waits for a pending gallery save so an image copied immediately after generation can use the saved file. You can paste the PNG back into NovelAI and recover its recorded settings.

## Importing NovelAI images

Drop a NovelAI image onto the app and it asks what you want to do with it: **Image2Image**, **Vibe Transfer**, or **Precise Reference**. If the file carries NovelAI metadata, it offers to import that instead.

The import screen lets you choose which parts to take: prompt, undesired content, characters, settings, seed. Characters can **Append** to the ones already in the panel or replace them, and **Remove Existing Characters** clears the panel first so an image with no characters of its own does not leave the old ones behind. **Clean Imports** strips the quality tags this app adds on its own along with inline syntax no backend here supports. On a NovelAI image it also strips NovelAI's own quality tags, since **Quality tags** puts them back at send time. Importing the settings restores the **Quality tags** and **Undesired content preset** the image was generated with. With **Clean Imports** off, the prompt and undesired content keep the tags and preset text exactly as the image carries them, so the import turns **Quality tags** off and sets the preset to **None** so nothing is sent twice.

An image made with img2img has no source image in its metadata, so importing its settings starts a fresh image2image rather than reproducing the original. The dialog says so at the time.

Importing the settings applies the model and sampler but leaves width and height as they are.

## Inpainting and img2img

While a NovelAI model is selected, NovelAI's own inpainting and img2img replace the ComfyUI ones. The canvas and mask painting work as they do elsewhere, see [[Inpainting and the Canvas Editor]]. **Strength** and **Noise** sit directly under the image upload as **Image settings**, in the place the **Denoise** slider takes with a local model. In inpainting the same block adds **Keep the area outside the mask**, which pastes the untouched original back over everything outside the mask.

Loading a source image adopts its shape as the aspect ratio at your current side length, so a 1024x1536 source at a 1024 side becomes 832x1216. It never copies the raw pixel size, and a locked resolution ignores it. The image (and the mask, in inpainting) is fitted to those dimensions right before it is sent. Inpainting is the exception: the canvas takes the image's exact size so the mask lines up.
