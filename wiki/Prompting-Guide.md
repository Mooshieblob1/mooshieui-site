# Prompting Guide

MooshieUI has a rich prompt system layered on top of the plain positive/negative text boxes. This page covers everything you can do beyond typing tags.

## Quick reference of prompt syntax

| Syntax | What it does |
|--------|--------------|
| `(tag:1.2)` | Weight a tag (A1111 native, passed straight to ComfyUI) |
| `1.2::tag::` | Weight prefix, translated to `(tag:1.2)` at send |
| `{tag}` / `[tag]` | Emphasis / de-emphasis (x1.05 / x0.95 per layer, nests) |
| `(tag)1.2` | InvokeAI trailing weight, translated to `(tag:1.2)` at send |
| `(tag)++` / `(tag)--` | InvokeAI emphasis (x1.1 / x0.9 per mark); `word++` works too |
| `{a\|b\|c}` | Random alternation: pick one option per generation |
| `{2$$a\|b\|c}` | Pick exactly 2 distinct options, joined with ", " |
| `{1-3$$a\|b\|c}` | Pick a random count in a range |
| `{3::a\|1::b}` | Weighted alternation: `a` is three times as likely as `b` |
| `@[Chunk Name]` / `@preset:<slug>` | Splice a saved Prompt Preset in at that exact spot (wildcards roll here) |
| `@artist_name` | Insert an artist tag (normalized, parentheses escaped) |
| `<fromto[N]:before\|\|after>` | Prompt scheduling: swap text at step/fraction N |
| `<from:N>text</from>` | Scheduling: add text starting at N |
| `<to:N>text</to>` | Scheduling: add text until N |
| `<range:N:M>text</range>` | Scheduling: add text only between N and M |
| `<segment:target>prompt</segment>` | Re-detail a region matching `target` (eyes, face, hair, hands, etc.) |

Everything below explains where to set these up. The weight conversions in this table describe the ComfyUI path. NovelAI requests use NovelAI-compatible weights; ComfyUI scheduling, regional conditioning and segment refinement do not become NovelAI sampling features. See [[NovelAI Backend]].

## Random prompt syntax

MooshieUI supports Dynamic-Prompts-compatible alternation syntax in both the positive and negative prompt boxes, on ComfyUI and NovelAI. Each submission resolves the alternation before it reaches the backend. The gallery stores the resolved text, so importing metadata restores those choices without rerolling. Identical pixels also depend on the model, settings and runtime.

**Basic alternation** - pick one option at random:

```
{red|green|blue} car
```

**Picking multiple options** - pick exactly N distinct options, joined with ", ":

```
{2$$fluffy|sleek|shiny|matte} texture
```

Pick a random count in a range:

```
{1-3$$bokeh|depth of field|lens flare}
```

Use a custom separator (between the two `$$` markers):

```
{2$$ and $$watercolor|oil paint|pencil sketch}
```

**Weights** - make one option more likely with an `N::` prefix (default weight is 1):

```
{3::masterpiece|1::rough sketch}
```

**Nesting** - inner blocks are resolved first:

```
{a sunny {morning|afternoon}|a rainy evening}
```

**NovelAI brace emphasis is preserved.** Any `{...}` block that contains no top-level `|` is left completely untouched, so `{tag}` for emphasis and `{tag:1.5}` for weighted emphasis continue to work exactly as before, and prompt scheduling tags are unaffected.

**Seed determinism** - alternation is seeded from your seed value, so the same seed always picks the same options. When seed is -1 (random), a fresh integer is chosen for each submission. The negative prompt rolls from a separate stream (seed + 1) so positive and negative options do not correlate.

**UI indicator** - when the prompt box contains alternation syntax, a small **random** badge appears next to the prompt header. Hover to see an example roll with the current seed. Click to preview a different roll without generating. The prompt box always shows your template; only the submitted prompt changes.

## Weighting and emphasis

On ComfyUI, MooshieUI translates supported forms to native `(tag:weight)` syntax at send time. NovelAI uses its own outgoing syntax instead. Your prompt box keeps what you typed; only the outgoing payload is converted.

Supported forms:

- **A1111 native** `(tag:1.2)` - passed straight through.
- **Weight prefix** `1.2::tag::` -> `(tag:1.2)`.
- **Brace emphasis** `{tag}` -> `(tag:1.05)` and `[tag]` -> `(tag:0.95)`. These nest, so `{{tag}}` compounds to roughly `(tag:1.10)`.
- **InvokeAI trailing weight** `(tag)1.2` -> `(tag:1.2)`, with the number outside the parentheses.
- **InvokeAI emphasis** `(tag)++` and `(tag)--` raise or lower by x1.1 / x0.9 per mark, so `(tag)++` is about `1.21` and `(tag)--` about `0.81`. A bare word works too: `word++`, `word--`.

Blend and swap operators are intentionally not translated.

**Weight buttons:** with the clickable overlay on (see Autocomplete below), the +/- buttons nudge a tag's weight by 0.05 in place, keeping whatever syntax you used. An A1111 tag stays A1111, a `1.2::tag::` stays that form, an InvokeAI `(tag)1.2` stays InvokeAI, and a plain tag gets wrapped in A1111 syntax. Landing exactly on 1.0 collapses back to the bare tag. Emphasis-mark forms (`(tag)++`, `{tag}`) are recognized but not numerically nudged, so the buttons grey out for them.

## Combined prompt view

By default the positive and negative prompts sit in two separate boxes. A small split-pane toggle at the right end of the prompt action row, next to the **Regional prompt** button, switches to a **combined view**: a single box with a **Positive / Negative** tab switcher above it, in the style of NovelAI. (On the combined view's Negative tab that row is hidden, so the toggle sits in the prompt header instead.) The toggle's tooltip reads "Switch to combined prompt view" and flips to "Switch to split prompt view" to go back. Your choice is remembered between sessions.

Both views drive the same two prompts underneath, so token counts, autocomplete, weighting, spell check, presets, and additive blocks all behave identically, and generation output is unchanged. In combined view the quality, style, preset, and artist badges stay visible on both tabs, and the Negative tab shows a small marker when the current model ignores the negative prompt.

## Additive prompt blocks

Below the positive and the negative prompt box is an **Add Prompt Block** button. It adds an extra prompt box that behaves like its own mini prompt (autocomplete, weights, token gauge, spell check all work inside it). At send time every block joins together in order into one clean prompt, the same result you would get by chaining ComfyUI concatenate nodes. A combined token count above the positive box shows the estimate across every block.

This exists mainly for split-encoder models (Anima and other Qwen-based checkpoints) where the text encoder reads your formatting literally. To keep those prompts clean:

- **ComfyUI prompts** remove `BREAK`/`<break>` markers and flatten line breaks when sent. Your box keeps its layout. (`BREAK` as a whole word is removed; `BREAKFAST` is left alone.) **NovelAI prompts retain line breaks**, including manual `Text:` lettering blocks; added style/chunk tags are placed ahead of that block.
- Blank blocks contribute nothing, and duplicate commas from joining are collapsed automatically.

Each block has an optional name field and a **Save as preset** button that drops its content straight into your Prompt Presets, so a reusable block (a quality tail, a negative baseline) can be recalled later or referenced with `@preset:<slug>`. Importing a prompt from an image, or restoring one from history, clears the extra blocks since that restored prompt is already complete.

<a id="prompt-presets-and-wildcards"></a>

## Prompt Chunks (presets) and wildcards

Saved **Prompt Chunks** (also called Prompt Presets in older labels and metadata) provide reusable text and multi-line wildcard lists. They coexist with inline `{red|blue|green}` random syntax. Classic `__filename__` text-file wildcards are not the app's wildcard mechanism.

**Where:** use **Chunks** in the prompt toolbar, or the **Chunks** tab in the Styles manager. Create a chunk and give it a name.

**Authoring a wildcard:** put each choice on its own line. Commas within a line stay grouped, so `1girl, solo` on one line is picked as a single block rather than split apart. Example content:

```
blue hair
red hair
green hair, twintails
```

**Two ways to use a preset:**

1. **Activate it** (no prompt syntax needed). Click the preset and choose a mode:
   - **Prepend** - whole content inserted at the start of the positive prompt
   - **Append** - whole content inserted at the end
   - **Wildcard (random)** - one line picked at random per generation, re-rolled each time
   - **Wildcard (in order)** - walks the lines in order, one per generation, wrapping around. The Generate button can queue the whole ordered run in one click.

   Activated content is spliced in at generation time and does **not** appear in your prompt textbox.

2. **Inline token** `@[Chunk Name]` or `@preset:<slug>` - drop it anywhere in your prompt to splice the preset in at that exact spot. The bracket form takes the preset name as written (`@[Cool hair colors]`); the slug form is the name lowercased with non-alphanumeric runs collapsed to `_` (`@preset:cool_hair_colors`). The editor shows the exact token to copy. A multi-line preset rolls one random line per occurrence, and each occurrence rolls independently, so `@preset:hair, @preset:hair` rolls twice. A single-line preset is inserted verbatim. Unknown slugs are left untouched so typos are visible.

Presets can be imported/exported as `.txt` files and sync across browser sessions.

## LoRA presets

Separate from prompt presets. A LoRA preset stores a named set of LoRAs, each with its own model/CLIP strength and enabled state. Apply in **replace** mode (swap the current LoRA set) or **merge** mode (add/update without removing what you already have). After applying, MooshieUI reports any LoRA filenames that were not found locally.

## Prompt scheduling

Use the **Schedule** builder (a tab in the bottom panel) to generate SwarmUI-compatible scheduling tokens with a live preview instead of typing them by hand. Four modes:

- **From/To** -> `<fromto[pivot]:before||after>`
- **From** -> `<from:N>text</from>`
- **To** -> `<to:N>text</to>`
- **Range** -> `<range:N:M>text</range>`

The builder auto-picks the least intrusive separator and shows the resulting token before you insert it.

## Segment detailing

Type `<segment:target>prompt</segment>` in the positive prompt to re-detail a matching region. MooshieUI auto-detects these tags and shows an editable panel listing each segment's target and local prompt. Built-in target suggestions include eyes, face, hair, hands, mouth, and background. The panel hides itself when no segments are present.

## Regional prompting

Open the **Regional Prompt** modal to paint regions on a canvas and give each one its own prompt and strength (0 to 2). Tools include select, box, circle, and lasso, with drag-to-create and 8-point resize handles, plus reorder/duplicate/delete and snap-to-grid. Two strategies are available: **conditioning** and **inpaint chain** (Anima models force the inpaint-chain strategy).

## Artists and characters

- **Artists tab** (bottom panel): browse a server-hosted artist gallery, mark favourites, and insert artist tags. Inserting handles conflicts with any existing `@artist` tag (replace or add), and clicking an artist that is already in the prompt removes it again. Only the line holding that tag is rewritten; the rest of the prompt, including a NovelAI `Text:` block, stays as you typed it. The `@artist_name` syntax is normalized (underscores become spaces, parentheses are escaped). Favourite cards show the same preview image the Artists page does: switch every card with **Image 1** / **Image 2** in the tab toolbar, or one card with its ⇄ button. The choice is shared with the Artists page and remembered between sessions. The **No-preview** toggle also shows artists the model knows that don't have a CDN preview image yet; each of those cards has a ⚡ **Generate** action to render a preview locally using the same parameters the CDN previews used.
- **Artist categories**: right-click any artist card to assign it to a category, or to create a new one. Cards with no category show a dashed "+" chip where the category dot would be, and the filter bar above the grid has a **New category** button. Once categories exist you can filter the grid by them, and searching stays inside whichever filter (including Favourites) is active.
- **Sort and group favourites**: the Artists tab toolbar sorts favourites newest or oldest first, by name (A to Z or Z to A), or by most or fewest posts, and groups them by category or by first letter with collapsible headers. The choice is remembered. Right-clicking a favourite card also lets you open category management or unfavourite it. On the Artist Gallery page, a **Date Added** sort appears while the favourites filter is on.
- **Animadex character browser**: search a character index filtered by copyright, hair color, hair length, eye color, and gender; sort by count or random; toggle "LoRAs only." Search includes characters with fewer than 50 posts and combines duplicate aliases. Selecting a character walks through a guided insertion flow that writes the character tags into your active prompt.

Choose **Character name only**, **Name + series (copyright)**, or **Name, series, and appearance tags**. Inserting tags keeps existing subject counts and composition. When the flow offers **Add character** or **Replace character**, Add increases the girl count and changes solo to multiple girls; Replace keeps the scene's count and composition. Appearance tags do not add conflicting counts or solo tags.

## Artist Styles

**Where:** open the bottom panel and pick the **Artist Styles** tab.

An Artist Style is a named set of artist tags with a weight, saved so you can switch a whole look on and off in one click. Style Creator saves combinations with multiple artists here, and you can also build a style by hand in the style editor.

**Favourite an existing single-artist style.** In v2.3.7 and later, a style containing one artist has a **Favourite artist** button. It adds the artist to **Artists** with the standard Miku preview and keeps the original style, its weights and its thumbnail. Existing favourites keep their category. Imported styles without a stored artist ID need a matching tag in the loaded Artists index before the button becomes available.

**Thumbnails.** A style saved from Style Creator keeps the image it was picked from as its tile. Clicking the tile opens the picture full size in an overlay that covers the whole app, not just the bottom panel, and it loads the original gallery image rather than blowing up the small tile. If the gallery entry has been deleted the tile itself is shown instead.

A style with no picture shows a **no thumb** tile that doubles as a **Generate thumbnail** button. It renders one image from whatever you currently have in the prompt boxes plus that style's artist tags, ignoring any other styles you have active, and saves the result as the tile. The style editor has the same action as **Generate**, next to **Use last gen** and **Upload**. Both are unavailable while a generation is already running, and on a style that has no artists in it.

## Style Creator

**Where:** open the bottom panel and pick the **Style Creator** tab. It is available on the normal backend and on the NovelAI backend.

Style Creator is for finding artist tag combinations you would never have thought to try. Each round it draws random artists from the Artists index, generates a candidate image per combination on one shared seed, and shows them full screen in a lightbox. A pick with multiple artists becomes a saved Artist Style with that image as its thumbnail. In v2.3.7 and later, a pick containing one artist becomes an artist favourite with the standard Miku preview.

**A round:**

1. Press **Start**. Normally two cards generate using the same seed and generation settings, with different artist tags. NovelAI's **Two per round** toggle can reduce this to one. The lightbox opens straight away and shows a spinner until each image lands.
2. Move the mouse over the image to bring up the control bar at the bottom, and move away again to hide it. The bar has a view toggle: **Side by side** splits the frame between both cards, **One at a time** gives one card the whole frame. The choice is remembered for the next round. In one at a time mode, **Switch** flips to the other card and the left and right arrow keys do the same, with a counter next to the button showing which card you are on. A round that only drew one card always uses the whole frame.
3. For a combination with multiple artists, press **Pick** to save it, **Pick and edit** to save it and open the style editor, or **Save both** to keep both candidates. Single-artist cards instead show **Favourite artist**, with **Favourite both** when both candidates contain one artist. These cards have no style name or editor controls. **Skip** rejects the round and draws again.
4. Rounds keep coming until you press **Stop**, which is on the lightbox control bar as well as in the Style Creator tab. Stopping while a pair is on screen leaves that pair up, so you can still pick or skip it before the run ends.
5. **Start** resumes a stopped run. A round still waiting for a pick stays on screen until you pick or skip it.

**Escape** closes the lightbox without ending the round. The Style Creator tab then shows a **Show round** button that puts it back on screen.

**Settings in the Style Creator tab:**

- **Anchor artists** - pin one or more artist tags that every card must include. Type a tag and press **Add**, or use **Load from style** to pull the artists out of a style you already saved. **Clear anchor** empties it. A tag that is not in the Artists index is kept as typed and marked in amber.
- **Artists per combination** - how many artists each card gets. With an anchor set this becomes **Extra artists**, the number drawn on top of the anchor. A candidate with an anchor plus one extra artist still saves as an Artist Style because it contains multiple artists. In two-card rounds, the anchor is also shown on its own as **Anchor only** for comparison; picking that reference saves nothing.
- **Favourites only** - draw only from artists you have favourited in the Artists tab.
- **Vary weights** - give the drawn tags randomised weights instead of a flat 1.0, so the same set of artists can be tried at different strengths.
- **Two per round** (NovelAI only) - on when you want both cards generated. Turn it off to generate one card per round and halve the Anlas spend. The badge next to it shows the estimated Anlas cost per round at your current settings.

**What it will not repeat.** Every combination you pick or skip is remembered, and so is every Artist Style you have already saved. A combination counts as the same one regardless of tag order, so the same artists in a different order or reversed will not come back. Individual artists are free to reappear in new combinations. **Clear history** wipes the picked and skipped record, but saved styles stay blocked because you already have them. When nothing new can be drawn you get "Every combination has been tried", which means it is time to clear the history or change the settings.

**Other behaviour:**

- The artist pool skips anything already in your anchor or already in your positive prompt, and skips very low post count entries.
- The seed is whatever you have pinned in the generation settings. If the seed is random, one seed is rolled per round and shared by both cards.
- For combinations with multiple artists, the style name is pre-filled from the artists in the card (and from the source style, if the anchor came from one). Edit it in the box on the control bar before you pick. Typing in that box does not steal the arrow keys, so you can move the caret normally.
- On the NovelAI backend the artist tags are written without the leading `@`, matching how NovelAI expects them.
- On the NovelAI backend the two images are generated one after the other rather than at the same time, because NovelAI rate limits parallel generations. The lightbox says so while the second one is waiting.
- Style Creator needs the Artists index, so an Artist Gallery manifest URL has to be configured. On the NovelAI backend it also needs a NovelAI API key in **Settings > NovelAI**.

## Image interrogation (reverse a prompt from an image)

Open the interrogator from the sidebar button near the bottom of the left rail (tooltip: "Interrogate Image"). It opens a compact window with two choices, **Paste from Clipboard** and **Browse for Image**. You can also drag an image onto that sidebar button and hold for about a second to pop the window open, then drop the image on it to start. Either way the image runs through a WD v3-family ONNX tagger (EVA02 by default).

The **Interrogator** section in Settings picks which tagger runs. The dropdown lists the built-in WD v3 models, which download on first use, and **Add custom tagger folder** registers any local folder that holds a `model.onnx` and `selected_tags.csv` pair from a compatible tagger. Custom entries are marked `(custom)`, can be removed from the same section without touching the files, and are validated when loaded, so a model whose input shape or tag list does not match is reported instead of producing garbage tags.

The image stays in view beside the results (above them on narrow screens), uncropped, whichever way you opened it. Results are grouped into character/artist/general/copyright categories with confidence percentages and a content rating badge. Select the tags you want and apply them to your prompt as **replace** or **append**. Anima `@artist` tags are converted automatically. To interrogate an image already in your gallery, right-click it and choose **Get Image Tags** (see [[Gallery and Metadata]]).

**Describe in words** below the tags writes a natural-language prompt for the image instead, for Flux, Krea, H3 and other models that read prose rather than tags. Pick **Short** or **Detailed** and press **Describe**. You can edit the result, **Copy** it, **Append to prompt** or **Replace prompt**. It uses the [[Prompt Assistant]] provider when one is set up (the model has to be able to see images); otherwise it uses a local model that can, **JoyCaption Beta One** when installed or **Qwen3-VL 4B Instruct**. With neither, the panel offers to install one. Installing one here does not change your prompt assistant model.

The WD v3 taggers have no artist category, so **Detect artists (Kaloscope 3.0)** in Settings > Interrogator (on by default) fills it in: each interrogation also runs the Kaloscope 3.0 artist classifier (about 44,000 Danbooru artists) and adds up to 3 artists scoring at or above the **Artist Threshold** (default 0.10). The model is about 169 MB and downloads the first time. Guesses can be wrong, so check them before using them. The Artists section always shows: when no artist reaches the threshold it lists Kaloscope's closest guesses unticked (click one to add it), and when detection is off it says so with a **Turn on** button.

**Detect saved characters** in the same section (also on by default) asks the [[Prompt Assistant]] which of your saved characters for the current model are in the image (see [[Generation Basics#characters-tab|Characters tab]]). Matches show as chips above the tags. Picking one switches off the tags its saved prompt already covers, and applying to the prompt inserts the saved character, into a NovelAI character box when there is room. Nothing is added until you pick one. It needs the prompt assistant to be set up.

## Autocomplete

As you type, MooshieUI suggests tags from the Danbooru and Anima tag databases (and any custom source you add). You can:

- add a custom tag source by URL or file upload (JSON or CSV)
- set the maximum number of suggestions (1 to 50)
- enable the **clickable overlay**, which makes every tag in the prompt individually clickable so you can adjust its weight inline with +/- buttons (see [Weighting and emphasis](#weighting-and-emphasis) for how it preserves each syntax)

Autocomplete is aware of scheduling brackets and will not trigger inside `<...>` tokens.

**LoRA keywords first:** when a LoRA with trigger words is switched on, its matching keywords show at the top of the suggestions with a **LoRA** badge (hover to see which LoRA). They are the same words the LoRA gallery shows as chips. Picking one inserts it exactly as written, and in the main positive prompt it is removed again when you switch the LoRA off. Keywords are not offered in negative prompts. Turn this off in Settings > Autocomplete.

**Tag spell check:** with this enabled in Settings, tags that aren't known Danbooru tags are underlined, and right-clicking one offers "did you mean" corrections from the Danbooru tag set. The browser's native spell check is disabled inside the prompt so it doesn't fight the tag checker. Spell check only runs for tag-based models (SDXL, Illustrious, Pony, SD 1.5, Anima) and NovelAI; natural-language models such as Flux, Krea and Qwen are not checked. Inside a tag prompt, lines that read as sentences are skipped. Common quality, year and score tokens (`masterpiece`, `very aesthetic`, `year 2024`, `score_9_up`) count as known. In NovelAI mode the checker also knows V5 custom tags, quality toggle tokens, `artist:` tokens, `source#` / `target#` / `mutual#` prefixes and `-N::tag::` weights, and skips the `Text:` block.

## Prompt history

The **Prompts** tab in the bottom panel keeps your past generation prompts with timestamps. Mark entries as favourites (they float to the top), search the full text, and re-apply any entry with one click. Mobile has a dedicated prompt history page.

## Notes

The **Notes** tab in the bottom panel is a freeform scratchpad for prompt ideas, parameter tweaks, and things to try. Notes save automatically as you type and persist between sessions; in browser/LAN mode they sync to your user profile so they follow you across devices, and the desktop app and browser mode on the same machine share them.

## See also

- [[Prompt Assistant]] for AI-assisted prompt enhancement and composition
- [[Generation Basics]] for the core controls
