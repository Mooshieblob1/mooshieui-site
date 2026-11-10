# Anima Prompting

How to write prompts for **Anima**, the 2B anime and illustration model from CircleStone Labs and Comfy Org, and what MooshieUI does with them for you. The rules here come from the official model card ([circlestone-labs/Anima on Hugging Face](https://huggingface.co/circlestone-labs/Anima)); the MooshieUI parts describe the current app. For the general prompt syntax (weights, random choices, blocks, presets) see [[Prompting Guide]].

Anima is built for illustration. It is not made for photorealism and only manages single words or short phrases of text in the image.

## Pick a version

| Version | Use it for | Settings MooshieUI applies |
|---------|-----------|----------------------------|
| **Anima Turbo** | Fast prompt iteration. The model card recommends starting here: only slightly behind Aesthetic on average, more stable, with a stronger default style and less variety. | 10 steps, CFG 1, `euler`, `sgm_uniform` |
| **Anima Aesthetic** | Polished final images in a consistent, higher quality default style. v1.0b is a plain aesthetic finetune without the merged style LoRAs; the author prefers v1.0. | 30 steps, CFG 4, `er_sde`, `sgm_uniform` |
| **Anima Base** | Maximum flexibility, diversity and artist style adherence. Plain and neutral without quality or artist tags. Train LoRAs on this one. | 30 steps, CFG 4, `er_sde`, `sgm_uniform` |

Selecting an Anima model applies these settings and shows the **Anima Recommended Settings** card in the sampler panel (see [[Generation Basics]]). The model card's own ranges are 30 to 50 steps at CFG 4 to 5 for Base and Aesthetic, and CFG 1 with 8 to 12 steps for Turbo. Resolutions between 512² and 1536² pixels work; MooshieUI starts at 1024 × 1024.

**Samplers the model card likes:**

- `er_sde`: neutral style, flat colours, sharp lines. A good default.
- `euler_a`: softer, thinner lines, sometimes a 2.5D look. Tolerates a slightly higher CFG without burning.
- `dpmpp_2m_sde_gpu`: like `er_sde` but more varied and "creative"; can get too wild on some prompts.
- `euler`: a little more creative than `er_sde`. Good with Turbo and Aesthetic, which are already stable.

For a more painterly look, turn on **Painterly textures (beta57)** in the sampler panel. It switches the scheduler to `beta57` from the RES4LYF node pack, which the model card suggests because it puts more emphasis on low-noise steps.

## Tags, natural language, or both

Anima was trained on Danbooru-style tags, natural language captions and mixtures of the two, so all three work.

- Write tags in **lowercase with spaces**, not underscores: `long hair`, not `long_hair`. Score tags are the only exception (`score_7`).
- When Danbooru and Gelbooru name a tag differently, use the **Gelbooru** version.
- The model was trained with random tag dropout, so you do not need every relevant tag.
- Natural language works best when it is descriptive: aim for at least two sentences. Very short prose prompts give unexpected results.
- Use normal English capitalisation for character and series names in prose.
- Tags and prose mix in any order, and quality or artist tags can lead a prose prompt: `masterpiece, best quality, @artist name. An anime girl with medium-length blonde hair is...`

## Tag order

The model card's order is:

```text
[quality / meta / year / safety] [1girl / 1boy / 1other ...] [character] [series] [artist] [general tags]
```

Inside each section the order does not matter. A full example from the model card:

```text
year 2025, newest, normal quality, score_5, highres, safe, 1girl, oomuro sakurako, yuru yuri, @nnn yryr, smile, brown hair, hat, solo, fur-trimmed gloves, open mouth, long hair, gift box, fang, skirt, red gloves, blunt bangs, gloves, one eye closed, shirt, brown eyes, santa costume, red hat, skin fang, twitter username, white background, holding bag, fur trim, simple background, brown skirt, bag, gift bag, looking at viewer, santa hat, ;d, red shirt, box, gift, fur-trimmed headwear, holding, red capelet, holding box, capelet
```

## Special tags

| Kind | Tags |
|------|------|
| Quality (human rated) | `masterpiece`, `best quality`, `good quality`, `normal quality`, `low quality`, `worst quality` |
| Quality (aesthetic model) | `score_9` down to `score_1` |
| Year | `year 2025`, `year 2024`, ... |
| Period | `newest`, `recent`, `mid`, `early`, `old` |
| Meta | `highres`, `absurdres`, `anime screenshot`, `jpeg artifacts`, `official art`, ... |
| Safety | `safe`, `sensitive`, `nsfw`, `explicit` |

You can use the human quality tags, the score tags, both, or neither. Put a safety tag in the positive prompt (and the ones you do not want in the negative): the model card warns that short or vague prompts can produce unwanted content otherwise.

### Artists need an @

Write artist tags with an `@` in front, for example `@big chungus`. Without the `@` the effect is very weak. MooshieUI's Anima prompt box shows a reminder, the Artists tab inserts the `@` for you, and image interrogation converts artist tags to the `@` form (see [[Prompting Guide#artists-and-characters|Artists and characters]]).

### Weights need to be higher than on SDXL

Prompt weighting works, but Anima needs stronger weights than SDXL to show an effect, for example `(chibi:2)`. All the weight forms in [[Prompting Guide#weighting-and-emphasis|Weighting and emphasis]] are converted to this syntax when the prompt is sent.

## Quality tags in MooshieUI

With **Auto-apply quality tags** on (Settings > Performance, see [[Settings and Accessibility]]), MooshieUI adds Anima's quality tags at send time. Your prompt box stays as you typed it.

| | Default tags MooshieUI adds |
|-|----------------------------|
| Positive | `newest, masterpiece, best quality, score_9, score_8, safe, highres` |
| Negative | `worst quality, low quality, score_1, score_2, score_3, blurry, jpeg artifacts, sepia` plus MooshieUI's standard negative tags |

**Customize quality tags** in the same section lets you replace them. The model card's own suggestions, if you prefer them:

- Positive prefix: `masterpiece, best quality, score_7, safe, `
- Negative: `worst quality, low quality, score_1, score_2, score_3, artist name, blurry, jpeg artifacts, chromatic aberration`

**Anima Aesthetic** was fine-tuned on high quality images with every quality tag removed from the captions. The model card advises against `score_*` tags in both prompts because they push it into "slop territory", so MooshieUI strips the score tags from the injected set when the model file name contains `aesthetic`. `masterpiece, best quality` stays, which the model card says is safe.

Anima Light Lavender, a community fine-tune of Base trained on natural language captions, gets no quality tags and runs at 25 steps, CFG 4, `euler`, `simple`, as its author recommends.

## Natural language and several characters

Name a character, then describe what they look like. The model card's example:

```text
Digital artwork of Fern from Sousou no Frieren, with long purple hair and purple eyes, wearing a black coat over a white dress with puffy sleeves...
```

This matters most with several characters: a bare list of names confuses the model, a name plus a short appearance for each does not. For placing characters in separate parts of the image, MooshieUI's **Regional Prompt** works on Anima through the inpaint-chain strategy (see [[Prompting Guide#regional-prompting|Regional prompting]]).

## Non-anime styles: dataset tags

Besides anime, Anima saw about 800k non-photo artworks from LAION-POP (ye-pop) and DeviantArt. Those captions start with a **dataset tag** on its own line, optionally followed by the alt text (ye-pop) or the title of the work (DeviantArt) on the second line:

```text
deviantart
Flame
Digital painting of a fiery dragon with glowing yellow eyes, black horns, and a long, sinuous tail, perched on a glowing, molten rock formation. The background is a gradient of dark purple to orange.
```

```text
ye-pop
For Sale: Others by Arun Prem
Abstract, oil painting of three faceless, blue-skinned figures. Left: white, draped figure; center: yellow-shirted, dark-haired figure; right: red-veiled, dark-haired figure carrying another. Bold, textured colors, minimalist style.
```

On ComfyUI, MooshieUI turns line breaks into `, ` when it sends a prompt (see [[Prompting Guide#additive-prompt-blocks|Additive prompt blocks]]), so the dataset tag reaches the model followed by a comma rather than a newline. It still leads the prompt, which is the part the model card stresses. Leave auto quality tags off for these prompts if you want the dataset tag to come first, because the quality tags are added at the front.

## Anima tools in MooshieUI

- **Anima Reference Adapter**: keeps a character from a reference image; describe only the scene. See [[ControlNet and Style Transfer]].
- **Style transfer (Untwisting RoPE)**: training-free style transfer from a reference image, Anima only. See [[ControlNet and Style Transfer]].
- **Anima ReStyler** in Image Edit redraws a character from a reference in the Anima style. See [[Image Edit Mode]].
- **ControlNet (Anima LLLite)** needs ComfyUI 0.29 or newer.
- **TeaCache** and the community **RDBT-Anima LoRA** speed up generation. See [[Generation Basics]].
- **Autocomplete** suggests tags from the Anima tag database alongside Danbooru's.

## Training LoRAs

From the model card, for anyone training on Anima Base:

- **Do not train the LLM adapter.** It shapes the text embeddings before they reach the diffusion model and is easy to degrade. In diffusion-pipe set `llm_adapter_lr=0` (the example config does); other trainers have similar options.
- Use a low learning rate. For a rank 32 LoRA, start at `2e-5` and adjust.

## License

Anima is under the CircleStone Labs Non-Commercial License. The model and its derivatives are non-commercial, but the images you generate can be used commercially. See the model card for the details.

## See also

- [[Prompting Guide]]
- [[NovelAI Prompting]]
- [[Models and the Model Hub]]
- [Anima model card](https://huggingface.co/circlestone-labs/Anima)
