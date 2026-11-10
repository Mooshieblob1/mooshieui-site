# Models and the Model Hub

## Smart model detection and architecture presets

MooshieUI recognizes a broad set of model architectures and auto-applies an optimal sampler, scheduler, steps, CFG, and resolution for each. Families include (among others): SD 1.5, SD 2.x, SDXL, Illustrious/NoobAI, Pony Diffusion, SD3/SD3.5, the Flux family (Flux.1 Dev/Schnell/Krea, Flux 2 Klein variants and FLUX 3 Image Klein), MOSS-Image, Chroma, Z-Image, Wan, Qwen, Krea 2, Ideogram 4 (Flux2 VAE path), AuraFlow, PixArt, HunyuanDiT, Stable Cascade, Kolors, Anima (COSMOS), Mugen (SDXL + Flux2 VAE), and Nanosaur (1.2B DiT).

The instruction-editing families (Qwen Image Edit, Qwen Image Edit Plus, Flux.1 Kontext, and FLUX 3 Klein) are detected too, and unlock [[Image Edit Mode]] when loaded.

Behavior worth knowing:

- **Accelerated models** (turbo, lightning, lcm, hyper in the name) get reduced steps and lower CFG automatically.
- **Rectified flow** models inject the correct ModelSampling node with architecture-specific shift values.
- **FluxGuidance** is injected for Flux Dev; Flux Schnell is detected and skipped.
- **Hash-based identification** - models are recognized by SHA256 hash (CivitAI AutoV2), so renamed files still resolve.
- **Structural identification** - MooshieUI inspects the safetensors tensor keys and identifies the architecture from the weights themselves, and when those weights clearly disagree with the filename the weights win (so an SDXL model misnamed like a Flux one is still classified as SDXL). Anima (COSMOS), Cosmos Predict2, Wan 2.1, Flux, Qwen-Image, SD3, SDXL, and SD 1.5 are all recognized this way, whatever the file is named, so an Anima fine-tune renamed without an `anima`/`yume` token (for example PerfectDeliberate) or a quantized FP8 build is still classified as the Anima family. An Anima fine-tune that ships its own text encoder named after the model (for example `name_txt.safetensors` beside `name.safetensors`) gets that encoder picked automatically. This matters twice over: it selects the matching text encoder for split models, and it routes ControlNet through the Anima LLLite path where that is required. See [[ControlNet and Style Transfer]].

## Availability on the connected server

Generation pickers use filenames advertised by the connected ComfyUI server. Recommended entries distinguish **Available in ComfyUI**, **Downloaded locally, unavailable to ComfyUI**, and **Unavailable in ComfyUI**. A file on the desktop is not automatically available to a remote worker. Refresh after installing the required files on that server; selecting a missing remote model does not start a local download.

When the connection changes, previous server inventory and stale refresh results are discarded. Renamed or nested files resolve to an advertised server filename; ambiguous basenames remain separate choices.

## Misfiled models still load

ComfyUI's own loaders only accept files from their own folder, so a diffusion model (unet or DiT only) dropped into the checkpoints folder, or a full checkpoint sitting in diffusion models, used to fail at generation time. MooshieUI now reads the weights to tell which kind a file really is, switches to the matching loader without asking, and loads the file by its full path. Misfiled models simply work, with nothing to move and no error to decipher.

Quantized GGUF files are the exception, since their loader comes from a third-party node that takes no path. Keep those in the folder their category expects.

A component in the wrong picker is different, because it cannot be loaded as something else. Text encoders and VAEs on their own cannot generate images, so when one is picked as the model, MooshieUI shows a red error under the picker that names the file, says what it is, and says where it goes (for example under **Text Encoder** or **VAE**). The same check covers a text encoder or model picked under **VAE**, and a VAE or model picked under **Text Encoder**, and **Generate** stops with the same message instead of failing inside ComfyUI. Detection reads the file's tensor layout, GGUF text encoders included, so renaming a file does not change the result.

## Model information

Selecting a model shows what the file itself declares: the preview thumbnail stored inside it, plus **Date**, **Implementation**, **SHA256**, **Merged from**, **Preprocessor**, **Encoder layer** and **ModelSpec version** where the author filled them in. An architecture worked out from the weights rather than declared in the file is marked **inferred**. Anything else the file declares is listed under **Other ModelSpec fields**, so nothing a model author wrote is hidden.

## GGUF quantized models

`.gguf` diffusion models and text encoders generate like any other model, so you can run large architectures (Krea 2 and similar) on cards that cannot hold the full-precision weights.

- Turn on **Use Split Model Components**, then pick the `.gguf` file under **Diffusion Model**. Quantized encoders work the same way under **Text Encoder**, which lists files from both the `text_encoders/` and `clip/` folders.
- Routing is automatic. ComfyUI's core loaders cannot read `.gguf`, so MooshieUI sends those files to the ComfyUI-GGUF loaders instead. There is nothing to configure.
- The ComfyUI-GGUF nodes install during ComfyUI setup and are re-checked on every start. If the install fails, ComfyUI still starts normally and only GGUF models are unavailable until it succeeds.
- Detection works on GGUF files too. The family now resolves from the GGUF header itself (its architecture field and tensor names) as well as the filename, sidecar metadata, and hash, so a renamed GGUF still lands on the right family; the accelerated variant and recommended encoder round out the preset. A file like `Krea-2-Turbo-Q5_K_S.gguf` gets the correct settings instead of falling back to unknown. Wulver (a Krea 2 fine-tune whose filenames carry no Krea marker) is also detected: files without `non_turbo` in the name are classified as Krea 2 Turbo, and `non_turbo` files get the standard Krea 2 defaults.

Put `.gguf` diffusion models in your diffusion models folder and quantized encoders in `text_encoders/`. The model manager (below) handles both categories.

## INT8-Fast quantized models

INT8 W8A8 and ConvRot builds (Flux 2, Flux 2 Klein, Z-Image, Chroma, Krea 2, Qwen-Image, Anima and Ideogram 4) need the ComfyUI-INT8-Fast loader rather than ComfyUI's core loader. It is NVIDIA-only.

- Turn on **Use Split Model Components**, pick the INT8 file under **Diffusion Model**, then turn on the **INT8-Fast loader** toggle. **Enable ConvRot** underneath is on by default and should stay on for ConvRot files.
- The node pack is not installed by default. The toggle shows **Install ComfyUI-INT8-Fast** the first time; installing restarts ComfyUI.
- If a filename looks like an INT8 or ConvRot build while the toggle is off, MooshieUI points this out under the model picker. A generation that fails with `unknown quantization format for layer` is the same problem.
- The toggle is disabled (greyed out) when the selected diffusion model is a `.gguf` file. The tooltip reads "Not available for .gguf models (already optimized)" to explain why. Use the GGUF loaders for those files instead.

## FLUX 3 Image Klein

FLUX 3 Image Klein comes as a distilled model and a Base model. Both are detected from BFL and community file names, CivitAI base model names and the file's own tensors, so a renamed file still gets the right preset: 16 steps at CFG 1 for distilled, 50 steps at CFG 3.5 for Base, Euler on simple. Klein needs the Qwen3-VL 4B text encoder (the same one Krea 2 uses) and the Flux 2 VAE. If either is missing it downloads on its own, and generating with a different encoder or VAE stops with a message naming the right one. Klein also works in [[Image Edit Mode]] with up to 10 references. It needs ComfyUI v0.41.0 or newer.

The Model Hub quick links include **FLUX 3 Klein INT8 (HF access)** and **FLUX 3 Klein Base INT8 (HF access)**. These come from BFL's gated Hugging Face repo, so they need a Hugging Face token from an account that has accepted the FLUX license. ComfyUI loads these INT8 ConvRot files itself, so leave the INT8-Fast loader off for FLUX 3.

## MOSS-Image

OpenMOSS's MOSS-Image comes as MOSS-Image (SFT) and MOSS-Image Base, for txt2img and img2img. Both are detected from Comfy-Org and community file names, CivitAI base model names and the file's own tensors; only a `base` marker in the name selects Base, since both share the same tensors. The preset follows Comfy-Org's templates: 25 steps at CFG 2.5, er_sde on simple, 1024x1024, with the negative prompt kept on. MOSS-Image needs the Qwen3.5 9B text encoder and the Flux 2 VAE. If either is missing it downloads on its own, and generating with a different encoder or VAE stops with a message naming the right one. It needs ComfyUI v0.43.0 or newer, which the managed ComfyUI uses from v2.3.34.

The Model Hub quick links include **MOSS-Image INT8**, **MOSS-Image Base INT8** and **Qwen3.5 9B W4A8 (MOSS-Image)**, from Comfy-Org's ungated repo. ComfyUI loads these INT8 files itself, so leave the INT8-Fast loader off for MOSS-Image.

## Krea 2 uncensored mode

Krea 2 reads your prompt through Qwen3-VL-4B, a chat model trained to refuse some requests, and its TextFusion layers (which turn that encoder output into conditioning for the image model) learned to tone those concepts down. Things can come out weakened or missing, and not only NSFW ones. When a Krea 2 model is selected, an **Uncensored mode** panel appears under the **Text Encoder** picker.

- Uncensored mode combines two fixes for the two stages: an abliterated (Heretic) copy of the same encoder at the same fp8 precision (DreamFast/Qwen3-VL-4b-Heretic-ComfyUI), and Capitan01R's TextFusion refusal-reduction LoRA (v2.0 full rank) at strength 1.0.
- **Download and turn on** fetches whatever is missing (about 7.4 GB for both) and switches the mode on when the downloads finish. If you set up the uncensored encoder in v2.3.16, the panel shows **Finish setup** to add the LoRA (2.6 GB). You also get a one-time notification with a **Download and turn on** button that does the same; download progress shows in the download banner.
- **Turn on** and **Turn off** switch between uncensored mode and the standard encoder. The panel shows **Active** while it is on. The choice is remembered across models and restarts, and picking an encoder by hand in the **Text Encoder** picker updates it too.
- The LoRA is applied automatically to Krea 2 generations only and does not appear in your LoRA list, so it never carries over to another model family. It is skipped if you already have a version of it enabled yourself, and it is recorded in the image metadata.
- It cannot add concepts the image model itself never learned. If something still does not appear in uncensored mode, the limit is in Krea 2's own training.

## Recommended models (auto-download)

In managed local mode, a few curated checkpoints can auto-download on selection with a live progress bar and file size, including a NoobAI/Illustrious checkpoint Anima Base v1.0 (~5.6 GB), and Anima Turbo and Aesthetic v1.1. The exact recommended list evolves between releases, so treat the in-app list as the source of truth.

## Model Hub (CivitAI / HuggingFace browser)

Browse and download models from inside the app:

- Filter by type (Checkpoint, LoRA, ControlNet, Upscaler, VAE, Textual Inversion), sort (Highest Rated, Most Downloaded, Newest), time period, architecture, and file format (SafeTensor, PickleTensor, GGUF, Diffusers, CoreML, ONNX, Other).
- Add a CivitAI API key for gated content.
- **Open on CivitAI** opens the model's page. Mature models open on civitai.red, where CivitAI serves them; pasted civitai.red model links work too.
- One-click download routes the file to the correct folder with a real-time progress bar.

Switch the source from **CivitAI** to **Direct URL** to install from any legal direct model link (Hugging Face, a mirror, a private host). Paste the **Model URL**, confirm the **Filename**, and choose where it lands under **Category**: Checkpoint, Diffusion Model, LoRA, Upscaler, VAE, ControlNet, Textual Inversion, or Text Encoder. Diffusion Model is the right home for a bare DiT checkpoint that carries no built-in text encoder. Hugging Face links must be `/resolve/main/` file URLs, not model page URLs; the field tells you if you paste the wrong one. Quick links cover common downloads, including SDXL Base 1.0, the OmniSR upscalers, the Qwen3-VL 4B FP8 encoder that Krea 2 uses, and Krea 2 - Wulver v0.5 FP8 (Turbo).

## CivitAI-enriched galleries

The bottom-panel LoRA and Checkpoint galleries auto-fetch CivitAI metadata (name, preview images, model ID) for your local files and cache it for 24 hours. Their CivitAI links open mature models on civitai.red. The LoRA gallery lets you set a thumbnail from a CivitAI image URL. Both support search and sort by name, date, or family, plus right-click actions. The sort dropdown also has **Folder** and **Tree** modes that group your LoRAs by their on-disk folders (Tree mirrors the Model Manager's collapsible folder view), handy when your LoRAs are organised into subfolders.

## Bulk CivitAI scan

Above the search bar in the LoRA gallery, a **Scan all models on CivitAI** button hashes every LoRA, checkpoint, diffusion model, and embedding in your library, queries CivitAI by hash, and writes a `.civitai.info` sidecar file next to each match. This populates the gallery thumbnails, names, and model IDs in one pass rather than waiting for them to be fetched on demand.

While the scan runs, a progress bar shows the current file being hashed ("Hashing filename...") and a "{current} / {total}" counter. A **Cancel** button stops the scan at any point (it drains to "Cancelling..." before halting). When complete, a summary line reports how many files were found on CivitAI, how many were not found, and how many were skipped.

Files that already have a cached `.civitai.info` sidecar are skipped by default. Once a scan has finished, the button label changes to **Re-scan all models**, which forces a fresh hash and lookup even for already-cached files. Use **Re-scan all models** if a model's CivitAI page was updated after your original scan. A **Dismiss** button closes the progress panel after the scan completes.

## YuE2 music checkpoints

Music has a separate **YuE2 checkpoint** selector under **Generation settings**. **Models and setup** offers the official INT8 (4.0 GB) and BF16 (7.8 GB) downloads, subject to the account's download permissions. These files go in `ComfyUI/models/checkpoints` and include the generator, text encoder and audio VAE. The weights have a non-commercial license. See [[Music Generation]] for runtime and hardware requirements.

Native covers also need **SheetSage2** under the separate **Audio encoder** selector. Its download is 1.39 GB and belongs in the transcription worker's `models/audio_encoders` folder. It is not a YuE2 checkpoint. See [[Music Generation]] for transcription and score review.

## Model manager

In Settings you can manage local model files across categories (checkpoints, loras, vae, upscale, controlnet, embeddings, ultralytics, text encoders, diffusion models): search by filename, delete files, move files between configured directories or to a different category (for example a checkpoint into your diffusion models folder), and see total disk usage per category.

Switch between **List** and **Tree** view: List is a flat, sorted list, while Tree groups files by the folders they're stored in so large collections mirror your actual on-disk folder structure. You can create folders (**New Folder**) and move models into them.

## Model requests (multi-user)

In hosted/multi-user deployments, non-admin users can request a model download by CivitAI URL. Admins and moderators see a pending/approved/denied queue and can approve (which starts the download) or deny with a reason. See [[Server, LAN and Multi-User]].
