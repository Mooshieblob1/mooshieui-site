# Video Generation

In v2.3.7 and later, open **Video** from primary navigation beside **Generate** and **Music**, on desktop or mobile. Video runs the MiniMax H3 stack: you write a prompt, choose a length and a shape, and the clip lands in the gallery alongside your images with its parameters attached, plays inline in the grid and in the lightbox, and can be exported to a file you can post. With **Manual save mode** turned on in Settings, finished clips are held in the preview instead of being written to the gallery automatically. A **Save to Gallery** button writes the clip you want to keep, and a **Discard** button drops it without saving. If additional clips finish while you are reviewing one, a "+N more" indicator appears below the preview showing how many unsaved clips are waiting.

**Generate** returns to the image mode you last used during the session. Image and video prompts stay separate, and generation indicators appear on the relevant navigation entry. Video stays available while a NovelAI model is selected for images; it always runs on ComfyUI, since NovelAI has no video endpoint.

## Models

Video mode does not use your image checkpoints. Each quality tier is a stack of five files: a diffusion model for **First / Last Frame**, a separate diffusion model for **Reference Images**, a shared text encoder, and two shared VAEs. Pick a tier under **Models** and MooshieUI lists all five, tags whichever diffusion model matches your current workflow as "in use", and downloads whatever is missing.

| Tier | Size per diffusion file | Notes |
|------|------|-------|
| **NVFP4** | 12.5 GB | Blackwell (RTX 50 series) only. On older cards the weights are widened at runtime, which costs both speed and memory. |
| **int8** | 21 GB | Recommended. |
| **fp8** | 21 GB | |
| **bf16** | 40 GB | Unquantized bfloat16 weights. |
| **Custom** | varies | Bring your own files. |

The **Custom** tier skips the presets and lets you pick every file yourself: the **Diffusion Model**, **Text Encoder**, **Video VAE** and **Audio VAE** from your local model folders, plus the **Turbo LoRA**, **Sampler** and **Scheduler**. `.gguf` diffusion models and text encoders are routed through the GGUF loaders automatically. Use it for community quantizations (W4A8 and similar) or a fine-tuned H3 that the preset tiers do not know about. While Turbo is on, a LightX2V or PDD turbo preset sets the **Turbo LoRA** file itself, so the picker is locked and names the preset; pick **Larryvrh v4** under **Turbo preset** to choose your own. With Turbo off the picker is never locked.

The native Reference Images workflow uses the audio VAE for final audio decoding; it does not pass it into the reference-conditioning node.

Generating only needs four of the five files: the diffusion model for your active workflow plus the text encoder and both VAEs. Downloading a tier grabs both diffusion models at once, so switching between First / Last Frame and Reference Images later does not require a second download.

The table lists diffusion weights only, not the full download or VRAM requirement. Preset stacks additionally share a roughly 15.7 GB text encoder, 5.2 GB video VAE and 0.6 GB audio VAE; downloading both diffusion variants increases disk use again. The app lists each file and what is already installed. Video runs through ComfyUI, not NovelAI.

## Workflows

The **Workflow** selector picks the graph the clip runs through. Each workflow needs its own H3 diffusion model file.

| Workflow | What it takes |
|----------|---------------|
| **First / Last Frame** | Both frame slots are optional. Leave them empty for plain text to video, set only the first frame for image to video, or set both to interpolate between them. |
| **Reference Images** | Up to 9 images describing subjects, style, or setting. At least one is required. |

Under First / Last Frame there is a **Use first frame as last frame** toggle, which sends the opening image to the closing slot so the clip ends where it started and loops cleanly. A last frame you uploaded separately is remembered and comes back when you turn the toggle off.

Every frame and reference slot has a **Choose from gallery** button next to the upload control, for pulling in an image you already generated instead of uploading a fresh file. It opens a picker over the gallery; frame slots take one image, reference slots let you pick as many as you have room for.

The gallery works the other way too: hover any still image and use **Make video** to send it straight into a new video generation as the first frame, or **Add as video reference** to add it to the reference slots. Both actions switch you to Video mode with the slot already filled.

## Length, shape and resolution

**Duration** is requested in seconds (1–15). H3 accepts frame counts of the form 17n+5 at 24 fps, so the count snaps **up** to a valid length. For example, a 4-second request becomes 107 frames at 24 fps (about 4.46 seconds). Read the panel's resulting frame count and duration.

**Aspect Ratio** offers the usual presets plus **Match image shape**, which takes the shape of the uploaded frame instead. With no frame uploaded it falls back to 16:9 and says so.

**Pixel Budget** sets the total pixels per frame in megapixels. Width and height are derived from the budget and the aspect ratio, snapped to multiples of 32, and the resulting resolution is printed under the slider.

Pixel budget and duration drive VRAM use. MooshieUI shows a rough estimate without CPU offloading, compared with estimated usable GPU memory. This is not measured free memory or a minimum GPU requirement: ComfyUI can offload to system RAM, and custom models and memory settings affect actual use. The note is advisory and never blocks generation; it can suggest a lower pixel budget. A separate warning appears if VRAM Mode is set to high in Settings, which keeps the whole model resident and usually makes video much slower. When the H3 model would leave less than 6 GB of the card free, MooshieUI launches ComfyUI without High VRAM anyway, so the 20 GB INT8 model on a 24 GB card no longer stalls before the first step.

## Writing the prompt

H3 was not trained on free prose. It expects prompts written as labelled sections, and prompts that ignore the format tend to produce weak motion.

The **H3 prompt format** guide next to the prompt box explains the whole thing, in four tabs:

- **Structure** lists each section in order and what belongs in it, with your current setup (task, frame count, fps, seconds) shown at the top.
- **Rules** covers the parts that matter most: Shot 1 carries no timestamp and every later shot opens with one in increasing order, the visual style is stated once right after `[Shot 1]`, camera moves need a type, an amplitude and a speed, speaker tags sit outside the quotation marks, and on-screen text is copied exactly inside double quotes and never translated.
- **Full example** is a complete prompt for the setup you have right now. Replace the content, keep the shape.
- **Template** is the same thing as a skeleton with angle-bracket placeholders, with a copy button.

**Enhance for H3** above the prompt box writes the format for you with the [[Prompt Assistant]]. Describe the video you want, or tick **Edit current prompt** and say what to change, such as "make the camera slowly push in". With it ticked and the box empty, it rewrites your current prompt into the H3 format. For image-to-video and first/last-frame clips the first frame goes along so the opening matches it, and **Reference images** can add more pictures to describe (external vision models only). **Review rewrite** shows the result next to your prompt before **Replace** applies it; a result that misses part of the format, or a Live2D idle rewrite, is flagged there.

There are two formats. The standard format has 3 fields and covers ordinary text to video. The reference format has 6 sections and is what you want when you are feeding labelled inputs such as `<Subject 1>` or `<Picture 1>`, since it carries the summary, the per-input descriptions, and the retention strengths that say how closely each one should be followed.

## Timeline

For anything longer than a single shot, turn on **Use timeline** to storyboard the shot list rather than describing it all in one block of prose.

The timeline has three tracks. **Shots** is the sequence itself: each segment carries its own prompt, a start and a length in frames, and optionally a still or a clip as its source. **Motion refs** and **Audio refs** are optional and replace the generated motion or sound where they sit.

Alongside it are:

- **Cast**, up to three recurring characters with a description and a photo, referenced from shot prompts as `@character1`, `@character2` and `@character3`.
- **Sound**, split into an overall soundscape (ambient sound inside the scene) and non-diegetic music (score sitting over it).

The header shows how much of the render window the shot list currently fills, and warns you when the timeline runs past it. Turning the timeline off hands control back to the settings panel.

In the first/last-frame workflow, stills at the start and end of the clip become its first and last keyframes. In v2.3.8 and later, a shot whose still starts partway through is pinned at that shot's start frame instead of being dropped, using ComfyUI's `MiniMaxH3AddGuide` (ComfyUI v0.34.0 or newer). A clip segment contributes its first frame. How closely H3 follows a mid-clip anchor has not yet been measured on a GPU.

## Going faster

In v2.3.6 and later, use **Generation method** to choose **Standard** or **Turbo**.

| Turbo preset | Steps | Use |
|---|---|---|
| Larryvrh v4 | 4-8, default 6 | First/last-frame and reference workflows |
| LightX2V FL2V v1.2 | 4 | First/last-frame workflow |
| LightX2V FL2V v1.0 | 8 | First/last-frame workflow |
| LightX2V Ref2V v1.0 | 8 | Reference workflow |
| PDD FL2VA · 8 | 8 | First/last-frame workflow |
| PDD Ref2VA · 8 | 8 | Reference workflow |

Choose the matching **Turbo preset**. LightX2V presets pair fixed steps with Euler/simple and their required sigma shifts; Larryvrh uses the Turbo sampler. The app preserves custom sampler settings when switching methods. Switching workflows maps LightX2V to its matching eight-step preset, and PDD to the other PDD preset. Managed setup can install adapters; remote servers need the matching model files and nodes on that server.

The PDD presets (v2.3.8 and later) use Alibaba PAI's Parallel Decoding Distillation adapters with eight Euler/simple steps. They need ComfyUI v0.35.0 or newer on the connected server.

Historical VDN selections migrate to Standard. VDN is no longer selectable after local testing found it slower and unstable. Performance depends on the stack, resolution and duration; extra Turbo steps do not guarantee better motion.

**TeaCache** skips the model's forward pass on steps where the output barely changed from the last one, reusing the cached result instead. Faster with a small risk of softer motion, and stacks with Turbo. It is skipped with the PDD presets, where each step uses its own output heads. Turning it on installs the TeaCache nodes, then restarts ComfyUI.

**Live preview** (v2.3.8 and later) plays a rough animated preview of the whole clip while it samples, decoded with the small taeh3 autoencoder. It adds a little time and memory to each step. Turning it on downloads taeh3 (23 MB) into `models/vae_approx` with no restart. On a remote ComfyUI server, put `taeh3.safetensors` in that folder yourself.

**Frame Interpolation** generates in-between frames after sampling, so playback looks smoother without changing the clip's length. **Interpolation** sets how many frames are created per original frame, and the panel tells you the resulting playback fps. Advanced exposes flow scale, fast mode, and ensemble. Turning it on installs the interpolation nodes and a 20 MB checkpoint, then restarts ComfyUI.

**Engine** picks which interpolator runs. RIFE is fast and light. GMFSS is slower but built for anime, with cleaner line art and flat shading and less warping. Both ship in the same node pack, so switching needs no extra install, but GMFSS downloads its own checkpoints on first use and that first job pauses for a while with no progress shown.

You can also smooth a clip after the fact: the **Smooth** action on a gallery video runs interpolation on it without regenerating, with the same RIFE or GMFSS choice. Length and audio stay the same.

## Concise motion and Live2D prompts

For a simple shot, keep the motion request brief and specific. **Live2D this image** guides gentle breathing, quick natural blinks, small secondary motion, a fixed camera and quiet ambience. Avoid prescribing a movement for every detail. The enhancer preserves explicitly requested closed eyes or different blink behavior. A matching final frame helps return to the opening pose, but does not guarantee a seamless loop.

## Retained drafts, retakes and 2× refinement (experimental)

Enable **Keep draft for 2× refinement** before generating a small draft, usually about 0.5 MP or less. The doubled dimensions must fit within 2.2 MP. Save the result, open its video player and choose **Retake or refine**. Under **2× refinement**, install the 59 MB H3 latent upscaler if prompted, then choose **Queue 2× refinement**. Defaults are eight steps and strength 0.35. The result is a new clip with the original audio preserved.

In v2.3.8 and later, **Retake a range** in the same panel regenerates only the seconds between **From (s)** and **To (s)** with a new seed, then saves a new clip. The rest of the video and the whole soundtrack stay exactly as they were, and the new frames are generated against the original sound. It does not need the upscaler, but the ComfyUI server needs v0.34.0 or newer and the updated MooshieUI nodes.

Retained data stays on the ComfyUI server that generated it and can use up to 2 GiB per clip, separately from gallery storage. Refinement needs that original installation, its worker and model stack. An MP4 alone cannot reconstruct the retained data. **Delete retained data, keep clip** removes the extra data separately. Deleting a retained clip also cleans its draft; reconnect an unavailable server and finish queued refinements first.

CPU checks cover the learned upscaler, dimensions, conditioning and audio preservation. Full two-pass GPU quality, memory use and live remote execution remain unqualified. See the [video guide](https://github.com/Mooshieblob1/MooshieUI/blob/main/docs/VIDEO.md) for setup and recovery details.

## Watching the result

Video in the gallery gets a real player rather than a bare HTML5 element. Play and pause, mute and set volume, toggle loop, step to the previous or next frame, change playback speed, and go fullscreen. The scrubber and the timeline are sized for a mouse rather than pixel-hunted.

**Seam check** loops just the last and first second on their own so you can judge how cleanly the clip wraps, with a percentage showing how far apart the two ends are. Use it before exporting, since a bad seam is what makes a loop visibly stutter.

## Exporting

**Export** opens a popover that estimates the file size before you commit to it.

| Format | Notes |
|--------|-------|
| **AVIF** | Smallest file by a wide margin. Plays in current browsers, but Discord and most chat apps will not animate it inline. |
| **WebP** | Animates inline on Discord and in every current browser. The safe pick for sharing. |
| **GIF** | Plays anywhere, including old clients. Much larger files. |
| **MP4** | Plays everywhere and is the only format that keeps the audio. It is a video rather than an animated image, so it will not autoplay inline the way a GIF does. |

MP4 needs an H.264 encoder and is unavailable if the ComfyUI environment does not have one.

Presets cover **Smooth**, **Balanced** and **Max quality**, with a **Discord-safe** preset for GIF. **Advanced** exposes frame rate, width, quality, colors, and repeat count.

**Loop fix** decides how the ends are joined:

| Mode | What it does |
|------|--------------|
| **Auto** | Measures the seam and trims the duplicate frame when the ends already match. |
| **None** | Encodes the frames exactly as generated. |
| **Trim last frame** | Drops the final frame so a matching first and last frame do not play twice. |
| **Crossfade** | Blends the tail into the head to hide a near-match seam. |
| **Ping-pong** | Plays forward then backward. Always seamless, roughly double the size. |

Set a **Size limit** of Discord (free) 10 MB or Discord Nitro 500 MB and the popover flags an export that will not fit before you try to upload it. Finished exports can be saved, copied to the clipboard, or downloaded in browser mode.

## Using it

1. Open **Video** from the primary navigation.
2. Pick a quality tier under **Models** and download whatever is missing.
3. Choose a workflow, and fill the frame slots or reference slots it asks for.
4. Set the duration, aspect ratio, and pixel budget. Check the VRAM note.
5. Write the prompt in the H3 format. Open the guide and copy the template if you have not used it before.
6. Generate.
7. Review the clip in the player, run a seam check if it is meant to loop, then export.

## See also

- [[Generation Basics]] for the settings shared with image generation
- [[Prompting Guide]] for prompt writing in general
- [[Gallery and Metadata]] for how clips are stored and filtered
- [[Models and the Model Hub]] for image checkpoints, which are separate from the H3 stack
