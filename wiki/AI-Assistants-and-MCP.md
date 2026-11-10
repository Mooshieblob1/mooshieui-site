# AI Assistants and MCP

MooshieUI can run a [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server so AI assistants such as Claude Code, Claude Desktop, Cursor or LM Studio can generate images and music, check the queue and search your gallery.

## Turning it on

The server is off by default. Open **Settings > AI assistants (MCP)** and turn on **Enable MCP server**. The panel shows the address it runs at, the **Port** (default `3210`), and the **Token** assistants need. **New token** replaces it; apps using the old token stop working until you give them the new one.

The server only listens on `127.0.0.1`, even with LAN mode on, so only apps on the same computer can connect unless you add a public address (see below). Every request needs the token, and requests from web pages are refused. Anyone with the token can generate images and read your gallery, so keep it private.

## Connecting an assistant

The panel has ready-to-copy setup for **Claude Code** (a `claude mcp add` command) and **Other apps (JSON config)**. Claude Desktop only starts local servers as commands, so it connects through `mcp-remote` (needs Node.js). The repository's `docs/MCP.md` has the full examples. Apps on this computer that take only a URL can use the **URL only (apps on this computer)** link, which carries the token in its path.

## Claude and other cloud apps

Claude's custom connectors (Claude Desktop, claude.ai, mobile) and ChatGPT connect from their own servers, not from your computer, so they cannot reach `127.0.0.1`. They need a public https address, set up under **Claude and other cloud apps** in the same panel:

- **Cloudflare tunnel** gives the server a temporary public address through Cloudflare, with no account needed. MooshieUI downloads a pinned, checksum-verified `cloudflared` the first time. The address changes every time MooshieUI starts, so update the connector after a restart. The tunnel stops when MooshieUI closes or the MCP server is turned off.
- **Your own address** is for a tunnel or reverse proxy you run yourself (Cloudflare named tunnel, Tailscale Funnel, ngrok). Point it at the local address shown and enter its https address for a URL that never changes.

Copy the **Connector URL** and, in Claude, paste it under **Settings > Connectors > Add custom connector**. The token is part of this URL, so anyone who has it can use MooshieUI from anywhere. Keep it private and press **New token** if it leaks. Requests that arrive through a tunnel return a job id after about 75 seconds instead of waiting for the image, and the assistant checks on it with `get_job`.

## Generating images

Assistants never pick sampler, encoder or family settings on their own. Each time you run a plain txt2img generation with a model, MooshieUI saves those settings (without the prompt or input images) as that model's setup, and assistants start from it. The panel shows how many models are ready.

A model becomes usable once you have generated one txt2img image with it. NovelAI, img2img, inpainting, Image Edit and video runs do not create setups. An assistant can change the prompt, negative prompt, model, size, steps, CFG, seed, batch size (1 to 8), sampler, scheduler and LoRAs. Images are saved to your gallery with normal metadata and show up in an open window right away.

## Generating music

The `generate_music` tool makes a YuE2 song from a style, optional lyrics (leave them out for an instrumental) and a duration of up to 6 minutes, using the same backend as [[Music Generation]]. It needs no setup. Finished songs are saved as FLAC, with the planned ABC score, in the `music` folder in the app data folder. They do not appear in the Music page library.

## Tools

| Tool | What it does |
|------|--------------|
| `get_status` | ComfyUI status and GPUs, queue length, recent image and music jobs, and the saved setups |
| `list_models` | Installed checkpoints, diffusion models, LoRAs, or YuE2 music checkpoints |
| `generate_image` | txt2img from a model's setup, with optional overrides |
| `generate_music` | A YuE2 song from a style, lyrics and duration |
| `get_job` | Status and results of an image or music job |
| `cancel_generation` | Cancels assistant jobs only, never generations started in the window |
| `search_gallery` | Searches prompts and models, or lists the newest images |
| `get_image` | A preview of a gallery image and its generation settings |

## See also

- [[Settings and Accessibility]]
- [[Server, LAN and Multi-User]]
- [[Music Generation]]
