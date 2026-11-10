# Settings and Accessibility

## Persistence

Settings are saved to disk automatically and restored on next launch: generation mode, prompts, model selections, sampler/scheduler/steps/CFG/seed/dimensions, and all upscale settings. Collapsed/expanded state of the left, right, and bottom panels persists too, so your layout is restored the way you left it. In browser mode, settings also sync per user. In v2.3.22 and later, the desktop app and browser mode on the same machine share one copy of your saved data: settings, saved characters, prompt presets, artist styles and favourites, LoRA presets, prompt history, notes, and gallery boards, favourites and ratings. Something saved in one mode shows up in the other, even with both open. Data you already had in both modes was merged once on first start after updating. Window layout, caches and generation tabs stay separate.

While the app starts, an "Initializing..." overlay covers the content area until your saved settings have loaded and ComfyUI is reachable. This keeps a half-loaded session from saving over your settings. The overlay clears as soon as ComfyUI connects, and right away if auto-start is off or startup fails, so the status banner and its start button stay usable.

## Finding a setting

Settings is split into categories, each on its own page, picked from a sidebar on the left: App Mode, Connection, Appearance, Performance, Quality Tags, GPU Workers, Models, Model Requests, Paths, Notifications, Gallery, Autocomplete, Interrogator, Prompt Assistant, AI assistants (MCP), CivitAI, NovelAI, Cloud voice and video, Queue, Account, Help & Updates, and Developer. Available categories depend on your role and deployment.

- **Search settings** - the search box above the sidebar narrows it to the categories whose name or contents match. If nothing matches, the page says "No settings match your search."
- The category you were on is remembered, so reopening Settings returns you to it.
- On narrow screens the sidebar becomes a row of chips across the top.

## Appearance and i18n

- **Languages** - 12 languages (English, German, Spanish, French, Italian, Japanese, Korean, Polish, Portuguese, Russian, Chinese Simplified, Chinese Traditional). Switch instantly in Settings -> Appearance with no restart. All keys exist in every locale; missing keys fall back to English.
- **Theme** - **Dark** or **Light**, with a **Palette** of built-in colour schemes (Mooshie, Nord and others).
- **Custom themes** - **Create theme** opens an editor for your own colours in dark and light mode, with an optional **Background image**, **Background fade** and **Logo image**. While a custom theme is active the built-in palette is ignored. **Export themes** and **Import themes** move them between installs.
- **Hide MooshieUI branding** - a custom theme option that hides the MooshieUI branding, including the support card in Help & Updates.
- **Font Scale** - scales the interface text from 0.75x to 1.5x.
- **Layout** - **Switch to mobile layout** or **Switch to desktop layout** picks between the touch layout and the full desktop interface on this device.
- **Style presets** - optional Fooocus-style presets can be enabled to show in the prompt panel (off by default).
- **Experimental: Image to 3D** - shows the [[Image to 3D]] page and the gallery's **3D** button. Off by default, saved per device.

## Autocomplete settings

- Choose tag sources (Danbooru, Anima, and custom).
- Add a custom tag source by URL or file (JSON or CSV).
- Set maximum suggestions (1 to 50).
- Enable the clickable overlay to edit tag weights inline. See [[Prompting Guide]].
- **Tag spell check** - underline tags that aren't known Danbooru tags and offer "did you mean" corrections on right-click. Toggle on or off.
- **LoRA keywords first** - suggest the trigger words of switched-on LoRAs at the top of the list. On by default.

## Accessibility

- **Vision simulator** - apply a color-vision filter over the whole UI (none, protanopia, deuteranopia, tritanopia).
- **Dyslexic-Friendly Font** - uses the OpenDyslexic font throughout the interface.
- **Help bubbles** - toggle info-tip help bubbles on or off.

Both settings persist and sync to the server.

## Connection

- Auto-connect to ComfyUI on startup.
- Status indicator (green/red dot) with the ComfyUI version number.
- Switch between local and remote ComfyUI in Settings -> Connection. See [[Installation]] for remote setup.
- A GPU status panel shows VRAM used/total and the ComfyUI process state, polled live.
- Managed local ComfyUI prefers port 18288 for new installs, retains saved settings, and selects another free port when needed. Restart and shutdown target only MooshieUI-owned processes. Choose Remote to use another running ComfyUI installation.
- **Free VRAM when idle** - off by default. When on, pick **Unload after** (5, 10, 15, 30 or 60 min). After that long with no generations, the managed ComfyUI unloads its models and gives back VRAM and RAM. ComfyUI keeps running, and the next generation reloads the model (a few seconds, longer for large models). A remote ComfyUI is never unloaded.

While you are not using the app, it also rests on its own: after 2 minutes with no mouse or keyboard input, or while the window is hidden, UI animations pause until your next input. On Windows the WebView is also hidden while the window is minimised and set to use less memory while the app rests.

## Performance

Settings -> Performance controls how ComfyUI uses your GPU.

- **VRAM Mode** - High / Normal / Low / None. Auto-detected during setup; lower it if you run out of VRAM, raise it if generation is slow and you have headroom. High is meant for 24 GB and up, and is dropped when the largest installed model would leave less than 6 GB free.
- **Keep ComfyUI running after app closes** - leaves the ComfyUI process alive in the background. Off by default, since it keeps using VRAM while the app is closed. With it off, a ComfyUI left running by a crashed or killed MooshieUI is stopped on the next launch instead of reused, and on Windows the managed ComfyUI closes with the app however it exits.
- **Attention Backend** - swaps ComfyUI's attention implementation for a faster one: **Default (PyTorch SDPA)**, **SageAttention v1/v2**, or **FlashAttention v1/v2**. These are NVIDIA-only accelerators, so each option is greyed out when your hardware cannot use it, with the reason shown inline:
  - "Requires an NVIDIA GPU" when no supported GPU is detected.
  - "Requires compute capability N+ (detected M)" when the GPU is too old for that backend.
  - "Requires the CUDA toolkit (nvcc) to build from source" for the backends that compile on install when the toolkit is missing: FlashAttention v1/v2 on every platform, plus SageAttention v2 on Linux. On Windows, SageAttention v2 installs a prebuilt wheel matched to the venv's PyTorch, CUDA, and Python versions, so it does not need the toolkit.

  Picking a supported backend installs the needed packages (on Windows the SageAttention options also pull in `triton-windows`), verifies they import, and asks you to restart ComfyUI for the change to take effect. If an install fails it is rolled back and your previous backend is kept, so a bad install never leaves ComfyUI unable to start. A status panel below the selector shows what is currently installed in the active venv and your detected compute capability.

## Gallery and account settings

- **Manual save mode** holds completed images and videos in the preview until you choose **Save to Gallery** or **Discard**.
- **Never auto-delete gallery images** disables the default seven-day cleanup of user/moderator galleries, including videos. Admin/root-gallery files are exempt from that cleanup already.
- **Flag NSFW images by prompt keywords** sets the keywords that mark images as NSFW for the gallery's NSFW filter and blur. **Reset to defaults** restores the list. See [[Gallery and Metadata]].
- **Linked folders** (desktop) shows images from other folders in the gallery without copying them. See [[Gallery and Metadata]].
- **Import Images from Directory** copies images from a SwarmUI output, ComfyUI output or any other image folder into your gallery, keeping their metadata.
- **Interrogator** selects a built-in WD v3 tagger or registers a custom folder containing `model.onnx` and `selected_tags.csv`. **Detect artists (Kaloscope 3.0)** and **Detect saved characters** are both on by default for new installs (existing settings are kept); see [[Prompting Guide]].
- **AI assistants (MCP)** turns on the local MCP server that lets AI assistants generate and search your gallery; see [[AI Assistants and MCP]].
- **NovelAI** manages your saved API key and Anlas/Opus readout. Users and moderators use their own encrypted key; admins use the owner's key. See [[NovelAI Backend]].
- **Cloud voice and video** stores ElevenLabs and fal.ai API keys for the [[Anime Scenes]] page, one write-only field per provider. Builds up to v2.3.41 also show a Segmind field; nothing uses that key, and later builds only show it so a saved key can be cleared. A saved key is never shown again, and **Clear** removes it. On a server each account has its own encrypted keys; the owner's keys are never sent to any client.

### API keys from environment variables

The instance owner can keep API keys out of MooshieUI's config. Under each API key field (cloud voice and video, NovelAI, CivitAI and the prompt assistant's external LLM), **Use an environment variable instead** switches the field to take a variable name such as `FAL_KEY`. The key is then read from MooshieUI's environment every time it is used and never written to disk. A status line reads "Reading the key from FAL_KEY." or warns that the variable is not set. Only the owner can name a variable; other accounts keep their own saved keys.

### Help & Updates

The update check retries a couple of times before giving up. If GitHub still cannot be reached, Help & Updates says so and offers **Open releases page** next to **Try again**, so you can download the latest version by hand.

A small **Support MooshieUI** card at the bottom of Help & Updates links to **Support on Ko-fi** and **Sponsor on GitHub**. It follows the active theme, and **Hide MooshieUI branding** in Appearance hides it. The About dialog has the same two buttons.

## Quality Tags

- **Auto-apply quality tags** - prepends the recommended quality tags for supported models (Anima, Illustrious/NoobAI, Nanosaur). If results look blurry or low quality, check that this is still on.
- **Customize quality tags** - overrides the default tags. The defaults work well for most models; reset them if results get worse.
- **Advanced Mode** - stops MooshieUI from applying the recommended steps, CFG, sampler, scheduler and dimensions when you switch checkpoints, so your current settings carry over to every model. Model family detection still works. Off by default, and it asks for confirmation before turning on.

## GPU Workers

Shows each detected GPU with its VRAM, utilization, temperature, power draw and the worker assigned to it, refreshed every 5 seconds. Under **GPU worker config**, **Auto-detect** proposes one worker per GPU, and each worker has a GPU, port, label, VRAM mode and an on/off switch. With no workers configured, MooshieUI runs in single-worker mode.

## Paths (admin)

- **Data Location** and **Move Installation to New Location** - moves the runtime and its data (about 5 to 10 GB) to another folder. ComfyUI is stopped while it copies, and the app needs a restart afterwards.
- **Rerun Setup Wizard** - reopens first-run setup to pick a different GPU or reinstall ComfyUI and PyTorch.
- **ComfyUI Installation** and **Python Virtual Environment** - the folders the managed ComfyUI runs from.
- **Shared Model Directories** - point MooshieUI at a models folder from another tool (ComfyUI, A1111, Forge). Subfolders such as `checkpoints/`, `loras/` and `vae/` are picked up automatically, and **Auto-Detect** scans for folders from other AI tools.
- **Extra CLI Arguments** - extra arguments passed to ComfyUI when it launches, for example `--force-channels-last`.

## Queue

Lists the running and pending generations and refreshes every 3 seconds. Admins also get **Clear Queue**, which interrupts every active and queued generation for everyone after a confirmation. To reorder or cancel your own jobs, use the queue panel described in [[Generation Basics#queue-panel|Generation Basics]].

## Notifications

Settings -> Notifications controls OS-level completion alerts.

- **Desktop notifications** - when enabled, MooshieUI sends a system notification when an image batch finishes, a video finishes, or a generation error occurs. On desktop (Tauri) the native OS notification API is used; in browser mode the Web Notifications API is used and the browser asks for permission the first time you enable this. If permission is denied, a message reads "Permission denied. Enable notifications for MooshieUI in your system settings."
- **Only when window is unfocused** - when checked, notifications are suppressed while the app window is in the foreground and only fire when you have switched to another app.

## Diagnostics

- **Terminal log** (desktop) - a collapsible, resizable panel streaming live ComfyUI and app output, with separate "comfyui" and "app" tabs.
- **Notification bell** - keeps a history of success/warning/error/info messages with timestamps.
- **Log export** - logs are captured in a ring buffer and can be exported for bug reports.
- **Report a problem** - a bug icon in the left sidebar (below the connection indicator) opens a one-click report flow any time. Your note, app version, OS, and recent logs are bundled and filed as a GitHub issue for you, no GitHub account needed. Nothing is sent unless you choose to submit.
