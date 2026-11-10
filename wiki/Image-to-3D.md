# Image to 3D

The **3D** page turns one picture of a character or object into a 3D model, back side included. It runs on ComfyUI's own nodes, so no custom nodes are needed.

**Experimental, off by default.** Turn on **Experimental: Image to 3D** in Settings > Appearance to show the **3D** page and the gallery's **3D** button. The setting is per device. Results are often much rougher than the published examples. Both methods work best on a single object or figure on a plain background; anime illustrations, scenes and flat 2D artwork come out rougher.

## Methods

Pick a **Method** at the top of the form:

- **Textured mesh (Pixal3D)**, the default. [Pixal3D](https://github.com/TencentARC/Pixal3D) by Tencent ARC (MIT) on ComfyUI's TRELLIS.2, MoGe and mesh nodes. It makes a solid mesh with baked colour, roughness/metal/occlusion and normal maps, saved as `.glb`, which opens in Blender, game engines and any glTF viewer. Its VRAM needs are not published; expect more than Idol and minutes rather than seconds.
- **Gaussian splat (Idol)**. [Idol](https://huggingface.co/speridlabs/idol) by Speridlabs (Apache 2.0), a fine-tune of TripoSplat. It makes a cloud of soft points that looks right from every side, but only splat tools open it. It is faster and lighter, at about 7 GB of VRAM.

Both need ComfyUI v0.41 or newer. The managed ComfyUI is already new enough; for an older remote server, its operator must update it, then press **Refresh** on the 3D page.

## Model files

When files are missing, the page lists them and offers **Download Pixal3D** or **Download Idol**. Only missing files are fetched, from Comfy-Org's ungated repackages, so no Hugging Face token is needed. On a shared server only admins and moderators can download; other accounts see a note to ask the host.

| Method | Folder | File |
|--------|--------|------|
| Pixal3D | `models/diffusion_models` | `pixal3d_int8_convrot.safetensors` |
| Pixal3D | `models/clip_vision` | `dino_v3_L_naf_fp32.safetensors` |
| Pixal3D | `models/vae` | `trellis_2_shape_vae_bf16.safetensors`, `trellis_2_texture_vae_bf16.safetensors` |
| Pixal3D | `models/geometry_estimation` | `moge_2_vitl_normal_fp16.safetensors` (MoGe 2) |
| Idol | `models/diffusion_models` | `idol_fp16.safetensors` |
| Idol | `models/clip_vision` | `dino_v3_vit_h_bf16.safetensors` |
| Idol | `models/vae` | `idol_decoder_fp16.safetensors`, `flux2-vae.safetensors` (shared with FLUX.2 / Klein) |
| Both | `models/background_removal` | `birefnet.safetensors` (only for Remove background) |

Pixal3D is about 10 GB in total and Idol about 3.8 GB.

## Make a 3D model

1. Set the **Source image**: drop or paste an image, use **Choose file** or **From gallery**, or press **3D** on a still image in the [[Gallery and Metadata|gallery]]. Use a PNG, JPEG or WebP.
2. Keep **Remove background** on unless the image already has a transparent background. It cuts the subject out with BiRefNet.
3. Pick a **Detail** level. For Pixal3D, **Standard** is 300,000 faces with 2048 px textures and **High** is 700,000 faces with 4096 px textures. For Idol, Draft to Maximum sets 131,072 to 1,048,576 Gaussians; more is denser but not sharper.
4. Under **Advanced**, set the **Seed** (-1 for random). Pixal3D's sampler settings follow its own pipeline. Idol also offers **Steps** and **Guidance**, which default to Idol's own reference settings (50 steps, guidance 4).
5. Press **Make 3D model**. Progress shows the queue position and each stage. 3D jobs never enter the image gallery or image progress.

## Viewer

The result opens in a built-in WebGL 2 viewer, in the desktop app and in browser mode. Drag to orbit, right-drag or Shift-drag to pan, scroll or pinch to zoom, and double-click (or **Reset view**) to reset. Arrow keys work when the viewer has focus. **Spin** turns the model on a turntable.

## Library and export

Finished models are kept under **Your 3D models**, per account, in this browser (like the music library), so they are not shared between devices. Give a model a **Name**, or **Delete** it.

- **Save .glb** (meshes) writes the textured mesh.
- **Save .ply** (splats) writes the file ComfyUI produced (standard 3DGS PLY).
- **Save .splat** (splats) writes the compact format most web splat viewers open.

Splats open in SuperSplat, Blender add-ons and other Gaussian splat tools. They use the usual 3DGS convention (+Y down), so some tools show them upside down until you flip them. ComfyUI also keeps its own copy in `output/3d/`.
