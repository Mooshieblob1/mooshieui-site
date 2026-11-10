# Prompt Assistant

MooshieUI's Prompt Assistant writes, edits and polishes prompts using a local llama.cpp GGUF server, a configured external LLM endpoint, or an official account sign-in companion. With the local backend, inference runs on the machine hosting MooshieUI. With an external endpoint, prompts and any attached reference images are sent to that endpoint.

## What it does

The **Enhance** button above the prompt box opens the **Enhance prompt** window. With a NovelAI V5 model it reads **Enhance for V5** (see [[NovelAI Backend]]), and in Video it reads **Enhance for H3** (see [[Video Generation]]). All three work the same way:

- **Edit current prompt** ticked, box empty: rewrites and improves your current prompt.
- **Edit current prompt** ticked, with text: applies your text as a change, for example "make it a rainy night". Anything the change does not mention stays as it was, and a tag you ask to remove stays removed.
- **Edit current prompt** unticked: writes a new prompt from your description. This replaces the old **Compose** button.

**Copy existing prompt** pastes your current prompt into the box. For image models you also choose a **Length** (Short, Medium or Detailed) and whether to **Include artists**.

**Use memory notes** (Enhance and Enhance for V5, shown when saved characters have memory) is ticked each time the window opens. Untick it when a composition keeps failing: that rewrite sends no memory notes and learns nothing, so it works from your text and the saved looks alone. Facts a rewrite learns are saved to memory only when you apply it.

**Reference images** attaches up to four pictures to point at, for example "use the outfit from image 1". Add them with **Upload**, **Paste** or **Gallery**, with an optional **Label** each. They need a model that can see images: a vision-capable model on an external provider, or the local Qwen3-VL 4B Instruct model. Other local models cannot see them and write from your text alone.

Nothing changes until you choose. **Review rewrite** shows your prompt and the proposed one side by side. **Replace** swaps it in, **Append** adds it after your prompt (not offered for H3), and **Undo** next to the button reverses it afterwards. **Cancel**, Escape or clicking outside the window while it is working stops the request (v2.3.36 and later), so the next Enhance starts right away. Once the rewrite is shown, clicking outside no longer closes it (v2.3.42); use **Cancel** or Escape.

For models that accept natural-language prompts (Krea 2, Flux, Z-Image, Chroma, Qwen-Image, and similar), Enhance writes full sentences instead of danbooru-style tags. Names, counts and positional descriptions (left/right) are preserved in prose form. Tag upsamplers such as DanTagGen still write tags regardless of the loaded model.

## Sessions

The assistant remembers the conversation. **Enhance**, **Enhance for H3** and **Enhance for V5** each keep their own session, so a follow-up such as "make it night" builds on the previous answer instead of starting over. Sessions survive closing the window and restarting the app; in LAN mode each account has its own.

Once a session has history, the window shows **Remembered exchanges** with a **New session** button to start over.

When a session grows too long for the model, the oldest exchanges are left out of the request (the window says **older ones not sent**) but stay saved. Since v2.3.42 only a rewrite you apply joins the session: closing the review without applying leaves it out, and **Undo** takes it back out. An answer that failed its format check or was cancelled is not remembered. A tag-only local model such as DanTagGen never receives the session.

## Minors and explicit content

Enhance, Remember, Update, Use and Write with AI refuse to send a request that pairs a clear minor (child, kid, schoolgirl, an age under 18, or a saved character marked as a minor) with explicit words in what you typed. In all three Enhance flows (since v2.3.42) the check also covers the prompt being edited and your earlier requests in the session, since those are sent too. Since v2.3.40 the check never reads saved memory notes, so a note mentioning a character's age cannot block an unrelated request. Suggestive words alone, ambiguous words, and phrases such as "minor changes" or "remove all sexual content" do not trip it. The refusal names the words that tripped it.

Since v2.3.41, anything that writes memory notes (Remember, Write with AI, Update suggestions and the V5 memory field) states a character's age as what it is ("an adult", "24 years old"), never as what it is not, and rewrites an old line that does. Notes already worded like "not a child or a teenager" or "no longer a child" are read as negations and do not count as a minor.

## Music writing

In Music, **Enhance style** and **Generate lyrics** use the configured assistant with YuE2 writing guidance. Generate lyrics opens a topic popup and uses the current style and **Max length**. **Use existing lyrics as context** is unchecked by default; check it to revise a draft. Fresh lyric requests exclude the existing lyrics and earlier songs. Style enhancement can use the current lyrics as context. Undo restores the previous field.

**Edit composition** also uses this assistant with guidance adapted from the upstream yue2-music skill. It proposes complete score, style and lyric edits, then checks the preservation constraints you selected before offering Apply to draft. The lyric budget leaves room for breathing, instruments and an ending, but sung timing is approximate. See [[Music Generation]] for the full workflow, library and manual lyric timing.

## How it runs

- With a local model selected, the assistant starts a llama.cpp server on demand.
- It is hardware-aware: it offloads layers to the GPU when there is room and falls back to CPU if ComfyUI is already using your VRAM.
- The local server runs with a 16k context so sessions fit. That takes roughly 0.7 to 1.7 GB more VRAM than before, which the GPU check accounts for; on a 4 GB card the recommended model now runs on the CPU.
- An idle watchdog stops the server automatically when it has not been used for a while, freeing memory.

## External LLM endpoint

If you'd rather not use the bundled local model, turn on **External LLM endpoint** in Settings and pick a **Provider**:

- **ChatGPT (subscription)**
- **Gemini (Google sign-in)**
- **Anthropic (Claude)**
- **OpenAI**
- **xAI (Grok)**
- **xAI (Grok, SuperGrok sign-in)**
- **OpenRouter**
- **Nous Research**
- **Self-hosted (OpenAI-compatible)** for LM Studio, Ollama, vLLM, and anything else that speaks the OpenAI chat API.

The API-key providers come with their base URL and a default model already set, so all you add is a key. Only the self-hosted option shows an **API base URL** field. A bare base URL that omits the `/v1` path works (for example `http://localhost:11434`); the app retries at `/v1/chat/completions` automatically and also accepts a fully pasted `.../chat/completions` endpoint.

### Keys and sign-in

Paste a key into **API key** and it is saved on the machine running MooshieUI, never in the browser. Once saved the field shows **Key saved** and stays empty; pasting a new key replaces it, and **Clear** removes it. Keyless local servers need no key at all. The instance owner can instead choose **Use an environment variable instead** and name a variable that holds the key, so it is never written to disk; see [[Settings and Accessibility]].

Sign-in starts from the desktop app, where the provider can open its browser login flow. Browser clients cannot start that flow.

- **OpenRouter** opens your browser, completes the sign-in, and stores the key it issues. That key does not expire.
- **Nous Research** registers this install as its own OAuth client and signs you in the same way. It issues a short-lived token rather than a key, so the app refreshes it in the background and you stay signed in.
- **xAI (Grok, SuperGrok sign-in)** is a device code flow: the app shows a code to enter on the xAI sign-in page. This is what lets a SuperGrok subscription pay for inference instead of prepaid API credits. xAI hands out OAuth client ids by arrangement and has issued none to this project, so sign-in uses the public client id of xAI's own CLI, the same one other third-party Grok clients use, which means the consent screen names xAI's app rather than MooshieUI. **xAI OAuth client ID (optional)** overrides it if you have been issued one, and **Scope (optional)** goes with it. Neither is a secret. Whether an account may mint a token at all is decided per account, so some accounts are refused whichever client id is used.

**xAI (Grok)** without the sign-in is still there as the plain API-key provider.

### ChatGPT and Google account sign-in

Account sign-in is available in v2.3.6 and later.

Choose **ChatGPT (subscription)** or **Gemini (Google sign-in)**, then **Sign in**. MooshieUI downloads a pinned, checksum-verified official companion into its own data directory. Setup needs no global CLI installation or manual token copying. **Cancel** stops a pending sign-in; **Sign out** removes this app's local account storage. Your separately installed provider tools keep their own sign-ins.

ChatGPT uses the official Codex app server for text and images. Google uses the official Antigravity ACP companion for text, images and music audio-style analysis. Account eligibility and usage limits apply. ChatGPT subscription sign-in does not accept music audio analysis, and Claude retains its API-key route.

Leave **Model** empty to use the companion default, or choose **Load models**. Submitted prompts and attachments go to the selected provider. Agent tools are disabled. Temporary request workspaces and local conversation caches are cleaned after requests; login state remains until sign-out.

A browser/server deployment can use an account already configured on the same host and app-data directory. It uses the host operator's account, not a separate subscription for every browser user. Provider settings still require moderator permission.

See the [account sign-in guide](https://github.com/Mooshieblob1/MooshieUI/blob/main/docs/PROMPT-ASSISTANT-SIGN-IN.md) for supported platforms and validation limits.

### Model

**Model** is a free-text field with suggestions. **Load models** asks the endpoint for its model list and fills the suggestions; endpoints that do not publish a list still work if you type the model id yourself.

Switching provider clears the stored key and resets the base URL and model to that provider's defaults, so keys never travel from one provider to another. Signing out clears the stored token along with it.

Reference images in the Enhance window need a model that can see images: a vision-capable model on an external provider, or the local **Qwen3-VL 4B Instruct** model.

### Reasoning effort

**Reasoning effort** sets how long models that think before answering spend thinking: **Low (fastest, recommended)**, **Medium**, **High (slowest)** or **Model default**. It shows only for providers whose models accept an effort, and each model gets the nearest level it supports. Low is the default and suits prompt work. Before v2.3.34 no effort was sent, so some models (Grok 4.6 and 4.7, for example) thought at their slow default and often timed out. Thinking models also get a longer timeout and extra room in their answer budget.

### Fallback models

For API-key providers, **Fallback models** lists up to 4 more models on the same provider, separated by commas. They are tried in order when the model above times out, is rate limited or its server fails. A refusal (bad key, missing model, content policy) is not retried on another model. Switching provider clears the list. Sign-in companions (ChatGPT, Gemini) do not show it.

**Fall back to the local model** goes one step further: when the provider cannot answer at all, an installed local writing model answers instead (never DanTagGen), without the reference images.

## Hosted / Docker notes

- In GPU Docker builds you can point the assistant at a specific llama.cpp binary directory with the `MOOSHIEUI_LLAMA_BIN_DIR` environment variable.
- On multi-GPU hosts you may want to pin the llama server to a specific device (for example `CUDA_VISIBLE_DEVICES`) so it does not compete with ComfyUI.
- The model used by the assistant is configured by the deployment. If no assistant model is configured, a fallback tag-generation model may load instead.

## See also

- [[Prompting Guide]] for wildcards, presets, scheduling, and the rest of the prompt system.
