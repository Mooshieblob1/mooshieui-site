# Comic Pages

In v2.3.49 and later, the **Comic pages** page builds a comic page panel by panel. It is in the desktop navigation and on mobile.

## Layout

- Pick one of 15 templates (1 to 6 panels), or split any panel across or down (up to 9 panels) and drag the borders to resize. Undo with the button or Ctrl+Z.
- Choose a portrait, landscape or square page and set the gutter with the slider.
- Right-to-left reading order is there for manga. Panel numbers follow the reading order.

## Panels

Each panel has a story beat, a prompt, its own negative, a **Dialogue** field and an on switch. Generate one panel or all of them.

- **Each panel** makes one image per panel at the panel's own shape on whatever model the Generate page uses, then crops them into the page. Very tall or wide panels are clamped to between 1:3 and 3:1.
- **Whole page** makes the page in one NovelAI image (up to 6 panels), with each panel's prompt placed at its position. It needs a NovelAI model. See [[NovelAI Backend]].

### Dialogue

The **Dialogue** field holds the spoken words for one panel, one speech bubble per line. On NovelAI models the lines are lettered into speech bubbles automatically. When generating in **Whole page** mode, all bubbles across the page are lettered in reading order.

Enter only the spoken words, not speaker names or quotation marks.

### Enhance for V5

When a NovelAI V5 model is selected and a [[Prompt Assistant]] is configured, each panel shows an **Enhance** button (tooltip: "The Prompt Assistant rewrites this panel by the NovelAI V5 Enhance rules, dialogue included"). It rewrites that one panel's prompt and dialogue with the rest of the page as context. **Write prompts from beats** in whole-page mode also applies the V5 Enhance rules when V5 is selected, writing each panel's prompt and dialogue from its story beat.

## Continuity

- **Cast:** describe each character once and pick them per panel. Their look is added to every panel they appear in.
- **Setting:** the page setting is added to every panel, and a panel can override it.
- **Panel check:** after a panel finishes, the tagger compares it with the cast and setting and flags missing or changed hair, eyes or setting, with a redo button.
- **Check story** has the [[Prompt Assistant]] read the panels in order and point out contradictions.
- **Write prompts from beats** has the Prompt Assistant draft each panel's prompt from its one-line story beat. It can be undone.

For speech bubbles on NovelAI V5, put only the spoken words in the `Text:` block. See [[NovelAI Backend#enhance-for-v5]].

## Saving

Panel images go to the gallery as they finish and come back after a restart. **Save page** writes the assembled page to the gallery with the panel prompts in its metadata.
