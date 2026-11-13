# NovelAI Prompting

How to write prompts for NovelAI Diffusion V5 and V4.5/V4 in MooshieUI. The prompting rules come from NovelAI's official documentation at [docs.novelai.net](https://docs.novelai.net/en/image/basics); the MooshieUI parts describe what the app does with your prompt. For setup, models, costs and the options panel see [[NovelAI Backend]].

## The basics

- **Tags, prose, or both.** NovelAI understands Danbooru-style tags and full sentences, and you can mix them. Tag suggestions in NovelAI's own site show how well the model knows a tag; MooshieUI's autocomplete draws on the Danbooru tag database (see [[Prompting Guide#autocomplete|Autocomplete]]).
- **Important things first.** Keep the subject and what matters most in the front half of the prompt. NovelAI's suggested order is `1boy, 1girl, characters, series, everything else`. On V3 and older, earlier tags weigh more; V4 and later are less sensitive to order, but the convention still helps.
- **Mind the length.** Each model has a token limit, and MooshieUI shows a counter under every prompt box against it.

| Model | Prompt limit (NovelAI) | Text rendering limit |
|-------|-------------------------|----------------------|
| V5 Full | about 1,471 tokens over the base prompt | 750 characters |
| V5 Curated | about 703 tokens over the base prompt | 374 characters |
| V4.5 Full, V4 Full | about 512 T5 tokens over the base prompt and all character prompts combined | 118 characters |

V4.5 and V4 use the T5 tokenizer, which does not support most Unicode characters (emoji, Japanese). V5 supports prompting in Japanese and other languages.

## Special tags

| Kind | Tags | Models |
|------|------|--------|
| Quality | `best quality`, `amazing quality`, `great quality`, `normal quality`, `bad quality`, `worst quality` | All |
| Aesthetic | `masterpiece` (V4.5+), `top aesthetic` (V4+), `very aesthetic`, `aesthetic`, `displeasing`, `very displeasing` | As noted |
| Complexity | `low complexity`, `medium complexity`, `high complexity`, `ultra complexity` | V5 |
| Year | `year 2014` (any year) | All |
| Dataset | `fur dataset` (V4+), `background dataset` (V4.5+), at the very start of the base prompt | As noted |
| Transparency | `transparent background`, `has alpha`, `alpha transparency` | V5 |
| Other | `location` (indoors or outdoors, unspecified), `depthness`, `attractive male`, `meta:novel era`, `meta:golden era`, `visual novel art` / `bg` / `cg` / `chibi` / `sprite` | `location` all, the rest V5 |

NovelAI suggests `high complexity` for normal, good-looking images; `ultra` and even `low` can suit stylised ones.

Some tags were renamed because `|` is reserved: write `peace sign` (not `v`), `double peace`, `bar eyes`, `open \m/`, `neutral face`, `neco-arc eyes`, `square bikini` (not `eyepatch bikini`) and `character image` (not `tachi-e`).

**Transparent backgrounds.** On V5, MooshieUI's **Transparent BG** option asks for a real alpha channel, like NovelAI's toggle. You can also prompt the tags yourself; NovelAI notes that strengthening helps, for example `2.1::transparent background::`.

**Artists.** Write the artist's name as a plain tag. MooshieUI removes an `artist:` prefix before the request goes out (see [[NovelAI Backend#models|Models]]), and the `@` prefix used for Anima is not added on NovelAI, because `@` starts a Prompt Chunk reference there.

## Emphasis

| Syntax | Effect | Models |
|--------|--------|--------|
| `{tag}` | × 1.05 per pair, nests: `{{tag}}` is × 1.1025 | All |
| `[tag]` | ÷ 1.05 per pair | All |
| `1.5::rain, night ::` | Numeric weight for everything up to the closing `::` | V4+ |
| `0.5::coat ::` | Numeric weakening (between 0 and 1) | V4+ |
| `-1::hat ::` | Negative emphasis: removes or inverts a concept | V4.5+ |

A bare `::` also closes any open braces, so `{{{{{rain ::` needs no counting. In Undesired Content the meaning flips: `{}` avoids a tag more, `[]` less.

**Negative emphasis** is NovelAI's targeted alternative to Undesired Content. `-1::hat ::` (or `-3::hat ::` for a stubborn hat) takes off a character's usual hat; `-1::monochrome ::` brings colour back; `-2.5::flat color ::` adds detail; `-1::simple background ::, location` gets characters out of a white void. Use Undesired Content for long lists of things to avoid, and negative emphasis for one concept at a time.

**What MooshieUI converts.** You can write ComfyUI-style weights on NovelAI too. When the prompt is sent, `(tag:1.2)` becomes `1.2::tag::`, and weights of exactly 1.05 and 0.95 become `{tag}` and `[tag]`. NovelAI syntax such as `1.2::rain, night::` or `-1::hat::` is sent exactly as written, and prompts imported from NovelAI images keep their NovelAI syntax. Your prompt box keeps what you typed. See [[Prompting Guide#weighting-and-emphasis|Weighting and emphasis]] for every accepted form.

## Quality tags and Undesired Content presets

The **Quality tags** option in the NovelAI options panel appends NovelAI's quality tags to the end of the prompt, the way NovelAI's own toggle does. They do not show in your prompt box but count against the token limit.

| Model | Standard | Light |
|-------|----------|-------|
| V5 Full, V5 Curated | `, very aesthetic, masterpiece, no text` | `, very aesthetic, amazing quality, no text` |
| V4.5 Full | `, location, very aesthetic, masterpiece, no text` | Not offered |
| V4 Full | `, no text, best quality, very aesthetic, absurdres` | Not offered |

These match NovelAI's own toggle for every model. Up to v2.3.41, MooshieUI left the leading `location` out on V4.5 Full; releases after v2.3.41 include it.

The **Undesired content preset** (Heavy, Light, Human focus, Furry focus, or None) puts NovelAI's preset tags ahead of your own Undesired Content. The panel only lists what the selected model supports. On V5 Full with **Effort: Medium**, the preset is fixed to Heavy and your own Undesired Content is not sent, so use negative emphasis instead.

## Several characters

V4 and later can keep characters apart: a **base prompt** for the scene and style, and one **character prompt** per character. V5 takes up to 22 characters, V4.5 and V4 up to 6. In MooshieUI these are the boxes in the **Characters** panel (see [[NovelAI Backend#characters|Characters]]).

- Put the **count tags** in the base prompt (`2girls, 1boy, outdoors`), and start each character prompt with `girl`, `boy` or `other` without a number.
- Characters are placed in list order, top to bottom and left to right, unless you set positions. With **Position: Custom**, MooshieUI's position editor works like NovelAI's; V4 and V4.5 snap to a 5 × 5 grid. NovelAI advises keeping positions consistent with the list order and backing them up in the prose.
- If something leaks from one character to another, use that character's own negative box.
- **Action tags** say who does what: `source#hug` on the hugger, `target#hug` on the one being hugged, `mutual#hug` on both. NovelAI notes these are not always reliable.
- NovelAI's site also accepts `|` to separate the base prompt from character prompts in one box, but only when no character boxes exist. Prompt mixing with `|` is V3 and older only.

## Text in the image

V4 and later can render text; V5 handles English, Japanese and Chinese, V4.5 and V4 English only.

1. Add `text, english text` to the prompt.
2. End the base prompt with `Text:` followed by the words. `Text:` must be the very last thing, or whatever follows it may appear in the image. Separate several strings with a blank line.
3. Describe in prose how and where the text should look, unless tags like `speech bubble` already make that clear. Repeating the text in the prose helps reliability.

**In MooshieUI** on V5, anything in quotes in the prompt is turned into a `Text:` block for you, and tags the app adds (style presets, Artist Styles, Prompt Chunks, Transparent BG) are placed ahead of it. Prompts sent to NovelAI keep their line breaks, so a hand-written `Text:` block arrives as typed. See [[NovelAI Backend#models|Models]].

If short text does not appear, set Quality tags to None: the quality tags include `no text`. On V4, writing the text in capitals can help spelling.

## Steps, guidance and samplers

Picking a NovelAI model sets 23 steps, guidance 7, Euler Ancestral and Karras. NovelAI's guide suggests guidance around 5 to 6 on V3 and later as a starting point: lower is softer and more painterly, higher is sharper but can overcook. **Dynamic thresholding** in MooshieUI (NovelAI calls it Decrisper) and **Guidance rescale** tame colour problems at high guidance.

Keep steps low while you look for a composition, then refine the one you like with **Enhance** (see [[NovelAI Backend#enhance-upscale-and-variations|Enhance, Upscale and Variations]]). On Opus, NovelAI does not charge Anlas for single images at 28 steps or fewer at normal sizes (V5 has a usage limit on these).

**Effort** (V5 Full only): **Medium** runs NovelAI's distilled model at 14 steps with Euler Ancestral, for about 40% less cost. Guidance still applies, guidance rescale does not, and Undesired Content is fixed as described above.

## Image references

- **Vibe Transfer** (V4 and V4.5 in MooshieUI) carries the mood, colours and style of up to 16 images. Keep all strengths adding up to 1 or less (**Normalize strengths** does it for you). Lowering **Information extracted** drops fine texture first, keeping more composition and less style; it also helps when a reference's plain background keeps leaking in. Encoding a vibe costs 2 Anlas, and each vibe beyond four adds 2 Anlas per image.
- **Precise Reference** (V4.5) copies a character, a style, or both. **Strength** is how much the reference is followed (high values copy pose and expression too); **Fidelity** is how hard it is to override from the prompt. 5 Anlas per reference per image. It cannot be combined with Vibe Transfer.

## See also

- [[NovelAI Backend]]
- [[Prompting Guide]]
- [[Anima Prompting]]
- NovelAI docs: [Tagging](https://docs.novelai.net/en/image/tags), [Strengthening and weakening](https://docs.novelai.net/en/image/strengthening-weakening), [Quality tags](https://docs.novelai.net/en/image/qualitytags), [Undesired Content](https://docs.novelai.net/en/image/undesiredcontent), [Multi-character prompting](https://docs.novelai.net/en/image/multiplecharacters), [Text rendering](https://docs.novelai.net/en/image/textrendering), [Effort](https://docs.novelai.net/en/image/effort), [Vibe Transfer](https://docs.novelai.net/en/image/vibetransfer), [Precise Reference](https://docs.novelai.net/en/image/precisereference), [Models](https://docs.novelai.net/en/image/models)
