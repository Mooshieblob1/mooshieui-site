# Installation

MooshieUI can run as a desktop app, a self-hosted web server, or a thin client against a remote ComfyUI.

## One-click setup (Windows/Linux releases)

1. Download a release from [Releases](https://github.com/Mooshieblob1/MooshieUI/releases): the `_x64-setup.exe` installer for Windows, or an `.AppImage`, `.deb` or `.rpm` for Linux. For Mac, see [macOS (Apple Silicon)](#macos-apple-silicon).
2. Run the app. The setup wizard will:
   - download [uv](https://github.com/astral-sh/uv) (fast Python package manager)
   - install an isolated Python runtime (normally 3.11; the AMD Windows preview uses 3.12)
   - download the ComfyUI version pinned by your MooshieUI release
   - create a virtual environment
   - auto-detect your GPU (NVIDIA CUDA / AMD ROCm / Intel XPU / CPU)
   - install PyTorch with the right backend (including CUDA 13.0 for Blackwell GPUs)
   - install ComfyUI dependencies and MooshieUI's custom nodes
3. Start generating. ComfyUI launches automatically with no visible terminal windows.

The installer streams real-time output as a matrix-style backdrop with per-step progress bars and a checklist.

> Disk space: roughly 5 to 10 GB for Python, PyTorch and ComfyUI, plus model downloads. Install typically takes 5 to 15 minutes depending on your connection.

On a slow connection the CUDA PyTorch download can take a long time. Since v2.3.41 setup waits for it instead of failing with "Failed to acquire lock on the client cache" after 5 minutes, and setup's downloads stop when you close MooshieUI, so a hidden leftover download cannot hold up the next attempt. If the setup log still reports a lock timeout, it explains what usually holds the lock and what to do.

**Update ComfyUI** targets the version pinned by the app. An interrupted update remains retryable. If ComfyUI crashes at startup because its environment needs repair, use the error dialog's **Repair and restart** action to reinstall the dependencies for the installed version.

### Music runtime

Music requires native YuE2 support, which ComfyUI includes from v0.36.0. Managed installs and the default Docker build use a pinned, tested ComfyUI release (v0.43.0 as of v2.3.41). Older installations missing those nodes can use **Update and restart ComfyUI** from Music, then download a YuE2 checkpoint. Remote hosts need their operator to update and restart ComfyUI. See [[Music Generation]] for setup, model requirements and license details.

### AMD ROCm on Windows (preview)

On Windows, setup detects a specific allowlist of AMD GPUs (RX 9070 / 9070 XT, RX 9060 XT, Radeon AI PRO R9700, RX 7900 XTX, Radeon PRO W7900, RX 7700 — note RX 7700 XT is not supported) and installs AMD's ROCm 7.2.1 preview build of PyTorch instead of the CPU fallback. This path uses an isolated Python 3.12 environment (the preview wheels are cp312-only) instead of the usual 3.11. Unsupported AMD GPUs on Windows still fall back to CPU mode.

## Managed ComfyUI connections

New managed installations prefer port **18288**. Existing saved port settings are retained; when the preferred port is occupied, MooshieUI selects a free port and updates its connection. You can leave another ComfyUI application running.

Restart, setup and shutdown stop only processes identified as MooshieUI's own. Verified kept-alive processes can be reclaimed after reopening the app. To use an existing ComfyUI installation intentionally, choose **Remote** in connection settings (see [Use your own ComfyUI](#use-your-own-comfyui-no-docker-no-managed-venv)).

Windows setup checks installed Git locations even when Explorer has an older PATH. If necessary, it downloads a portable Git copy and verifies the archive checksum. Setup and update operations run one at a time, and an update prepares the pinned source before applying it.

## Self-host / server mode (Docker)

MooshieUI can run headless and serve the same web UI over your network.

```bash
# Required on first launch: create your configuration
cp .env.example .env
# Edit .env and set a strong MOOSHIEUI_ADMIN_PASS before continuing.

# build and run
docker compose up -d --build
```

Then open `http://localhost:3200` (or your configured `MOOSHIEUI_PORT`).

Sign in with `MOOSHIEUI_ADMIN_USER` and the password you set. Account creation rejects empty passwords, passwords shorter than four characters, and `changeme`; use a strong unique password. In v2.3.8 and later the container exits at startup if `MOOSHIEUI_ADMIN_PASS` is `changeme` or `REPLACE_ME`, and new usernames use letters, numbers, `_` and `-`, up to 32 characters. There is no public self-registration. These variables bootstrap a new account and do not reset the password of an existing one.

The default compose file includes a persistent data volume (`mooshie-data`), a models-directory mount (`MODELS_PATH`, default `./models`), admin bootstrap via `MOOSHIEUI_ADMIN_USER` / `MOOSHIEUI_ADMIN_PASS`, and NVIDIA GPU reservation. The Docker image targets NVIDIA CUDA and needs Docker GPU support; the desktop AMD/Intel setup paths do not apply to this image. `MOOSHIEUI_PORT` changes the published host port; the container uses port 3200.

In v2.3.8 and later the image runs as the unprivileged user `mooshie` (uid and gid 10001). Data volumes and model folders created by older images belong to root, so hand them over once when upgrading:

```bash
docker run --rm --user 0 -v mooshie-data:/data --entrypoint chown <image> -R 10001:10001 /data
sudo chown -R 10001:10001 ./models
```

Compose prefixes the volume with the project name, so check `docker volume ls` for the exact name. If `/data` or `/data/models` is not writable, the container prints these commands and exits. On Kubernetes, set the pod's `securityContext.fsGroup` to 10001 (see `deploy/k8s/deployment.yaml`).

See [[Server, LAN and Multi-User]] for roles, auth, and LAN exposure.

## Use your own ComfyUI (no Docker, no managed venv)

MooshieUI's managed install always puts ComfyUI in its own Python environment. If you would rather run ComfyUI yourself, with your system Python, conda, a portable build or anything else, MooshieUI can connect to it instead and skips its own install completely.

1. **Install and start ComfyUI your way.** Use ComfyUI v0.43.0 or newer, which is the version managed installs use. MOSS-Image needs at least v0.43.0.
2. **Add MooshieUI's custom nodes.** From a clone of this repository, run the installer against your ComfyUI folder:
   ```bash
   git clone https://github.com/Mooshieblob1/MooshieUI
   MooshieUI/comfyui-nodes/install.sh /path/to/ComfyUI
   ```
   On Windows, run it from Git Bash, which comes with Git for Windows. Then install the nodes' Python requirements with the same Python your ComfyUI runs on (the script prints the exact command):
   ```bash
   python -m pip install -r /path/to/ComfyUI/custom_nodes/mooshie-nodes/requirements.txt
   ```
   Restart ComfyUI so it loads the new nodes. Run the script again after updating MooshieUI to pick up node changes.
3. **Connect.** On first launch choose **Remote server**, enter your ComfyUI address (usually `http://127.0.0.1:8188` for a local install) and click **Validate remote server**. You can change it later in **Settings -> Connection**.

Node packs from other authors (ComfyUI-GGUF, comfyui_controlnet_aux, Frame Interpolation and so on) are only installed automatically when MooshieUI manages ComfyUI. Install the ones you need yourself, for example with ComfyUI-Manager. MooshieUI names the missing pack when a feature needs one.

With your own ComfyUI, MooshieUI does not start, stop or update it, and **Update and restart ComfyUI** is not available. Keep it up to date yourself.

## Remote / cloud ComfyUI (RunPod, Vast.ai, etc.)

Use this when MooshieUI runs on your desktop but ComfyUI runs on a cloud GPU.

1. **Deploy the MooshieUI server build on the cloud instance.** The Docker image ships ComfyUI, PyTorch, and all MooshieUI custom nodes pre-installed. This is the easiest way to get the required nodes onto a remote server. For a ComfyUI you already run, see [[Installation#use-your-own-comfyui-no-docker-no-managed-venv]].
   ```bash
   docker compose up -d --build
   # or: docker pull ghcr.io/mooshieblob1/mooshieui:latest
   ```
2. **Expose ComfyUI.** Either use the web UI on port `3200`, or expose the configured ComfyUI port and use the desktop app as a thin client. New managed installs prefer `18288`; existing installs may retain `8188` or another saved port. Match the proxy URL to the actual configured port.
3. **Connect from desktop.** On first launch choose **Remote server**, paste the public ComfyUI URL, and click **Validate remote server**. MooshieUI skips the local install entirely. You can change the endpoint later in **Settings -> Connection**.

If validation reports missing custom nodes, redeploy or update the server build and fully restart ComfyUI before retrying.

## macOS (Apple Silicon)

Since v2.3.9 every release includes an Apple Silicon DMG, with automatic updates. It passes the automated Mac checks but has not been tested feature by feature on real Macs, so please report anything that breaks.

Use **macOS 14 or later**. Download `MooshieUI_<version>_aarch64.dmg` from the [latest release](https://github.com/Mooshieblob1/MooshieUI/releases/latest).

1. Compare the DMG's SHA-256 with the release's `SHA256SUMS` using `shasum -a 256 <filename>.dmg`.
2. Open the DMG and copy MooshieUI into Applications.
3. Open it from Finder. The app is ad-hoc signed and **not notarized by Apple**. If macOS blocks it, try opening once, then use **System Settings > Privacy & Security > Open Anyway**. See [Apple's instructions](https://support.apple.com/en-us/102445).
4. Complete setup with **Apple Silicon (Metal)**, or explicitly choose **CPU only**. Setup installs native ARM Python and constrained PyTorch packages and checks a real Metal tensor operation before accepting MPS.

Keep default attention and precision. Apple memory is shared with macOS; model size and optional node support still need testing on the target machine. Xcode Command Line Tools may be needed for Git-based custom nodes or dependencies without prebuilt wheels. Intel Macs can use the browser connected to a remote MooshieUI server.

See [Mac installation and validation](https://github.com/Mooshieblob1/MooshieUI/blob/main/docs/MACOS.md) for what the automated checks cover and the hardware checklist still to be confirmed on real Macs.

## Development setup (all platforms)

Prerequisites: Node.js 22.12+ or 24+, stable Rust, and the Tauri v2 prerequisites for your platform. The locked Svelte Vite plugin requires Node `^20.19 || ^22.12 || >=24`; Node 18 is not supported by the current frontend toolchain.

```bash
git clone https://github.com/Mooshieblob1/MooshieUI.git
cd MooshieUI
npm install
npm run tauri dev
```

See [CONTRIBUTING.md](https://github.com/Mooshieblob1/MooshieUI/blob/main/.github/CONTRIBUTING.md) for frontend checks and both Rust build targets. `npm run dev` starts only the frontend; `npm run tauri dev` starts the full desktop development app.
