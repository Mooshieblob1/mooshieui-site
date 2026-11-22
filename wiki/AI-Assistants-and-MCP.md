# AI Assistants and MCP

MooshieUI can run a [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server so AI assistants such as Claude Code, Claude Desktop, Cursor or LM Studio can generate images and music, check the queue and search your gallery.

## Turning it on

The server is off by default. Open **Settings > AI assistants (MCP)** and turn on **Enable MCP server**. The panel shows the address it runs at, the **Port** (default `3210`), and the **Token** assistants need. **New token** replaces it; apps using the old token stop working until you give them the new one.

The server only listens on `127.0.0.1`, even with LAN mode on, so only apps on the same computer can connect unless you add a public address (see below). Every request needs the token, and requests from web pages are refused. Anyone with the token can generate images and read your gallery, so keep it private.

## Connecting an assistant

The panel has ready-to-copy setup for **Claude Code** (a `claude mcp add` command) and **Other apps (JSON config)**. Claude Desktop only starts local servers as commands, so it connects through `mcp-remote` (needs Node.js). The repository's `docs/MCP.md` has the full examples. Apps on this computer that take only a URL can use the **URL only (apps on this computer)** link, which carries the token in its path.

## Claude and other cloud apps

Claude's custom connectors (Claude Desktop, claude.ai, mobile) and ChatGPT connect from their own servers, not from your computer, so they cannot reach `127.0.0.1`. They need a public https address, set up under **Claude and other cloud apps** in the same panel:

- **Cloudflare tunnel** gives the server a temporary public address through Cloudflare, with no account needed. MooshieUI downloads a pinned, checksum-verified `cloudflared` the first time. The status changes to running only once the tunnel has actually connected, not when the process starts. If the tunnel fails to start, the panel explains the most common cause: port 7844 blocked by a VPN or firewall. The address changes every time MooshieUI starts, so update the connector after a restart. The tunnel stops when MooshieUI closes or the MCP server is turned off.
- **Your own address** is for a tunnel or reverse proxy you run yourself (Cloudflare named tunnel, Tailscale Funnel, ngrok). Point it at the local address shown and enter its https address for a URL that never changes.

Copy the **Connector URL** and, in Claude, paste it under **Settings > Connectors > Add custom connector**. The token is part of this URL, so anyone who has it can use MooshieUI from anywhere. Keep it private and press **New token** if it leaks. Requests that arrive through a tunnel return a job id after about 75 seconds instead of waiting for the image, and the assistant checks on it with `get_job`.

## Generating images

Assistants never pick sampler, encoder or family settings on their own. Each time you run a plain txt2img generation with a model, MooshieUI saves those settings (without the prompt or input images) as that model's setup, and assistants start from it. The panel shows how many models are ready.

A model becomes usable once you have generated one txt2img image with it. NovelAI, img2img, outpainting, inpainting, Image Edit and video runs do not create setups. An assistant can change the prompt, negative prompt, model, size, steps, CFG, seed, batch size (1 to 8), sampler, scheduler and LoRAs (as well as outpaint padding with `source_image` on local models). Images are saved to your gallery with normal metadata and show up in an open window right away.

**NovelAI over MCP** is available inside the Opus free window only (at most 1 MP, 28 steps, one image per request), so it never spends Anlas. NovelAI models appear in the model list when a key is saved.

**Prompt ingredients by name** - prompts sent to `generate_image` can reference the owner's saved resources by name: `__wildcard_name__` picks a line from a wildcard file, and saved characters, artist styles and prompt chunks can be added by name (use `list_library` to see what is available).

## Editing and upscaling images

Two additional tools let assistants work on images already in the gallery:

- `edit_image` - edits a gallery image with an instruction using an Image Edit model (Qwen Image Edit, Flux.1 Kontext, FLUX 3 Klein, Anima ReStyler). Pass the gallery image ID and a text instruction; the result is saved to the gallery like any other generation.
- `upscale_image` - upscales and refines a gallery image the way MooshieUI's Refine button does, using the setup of the model that made it.

Both tools return a signed download link for the full-size result.

## Comics over MCP

Assistants can build a full comic page with `create_comic`. Provide a `layout` template, custom `rows`, or freeform `boxes` (`x`, `y`, `w`, `h` with optional `z` layer order for overlapping panels), along with panel prompts, cast appearance tags, the page setting and optional dialogue per panel. Each panel is generated separately and assembled into the page; panel images and the final page are saved to the gallery. `redo_comic_panels` remakes specific panels without regenerating the whole page.

## Gallery boards and Eagle

`list_boards` returns all gallery boards with image counts. `search_gallery` can filter by board, favourites or rating, and every result includes a signed download link. For Eagle users, `search_eagle`, `get_eagle_image` and `send_to_eagle` let assistants search the Eagle library, inspect items and add new gallery images to it.

## Generating music

The `generate_music` tool makes a YuE2 song from a style, optional lyrics (leave them out for an instrumental) and a duration of up to 6 minutes, using the same backend as [[Music Generation]]. It needs no setup. Finished songs are saved as FLAC, with the planned ABC score, in the `music` folder in the app data folder. They do not appear in the Music page library.

## Tools

| Tool | What it does |
|------|--------------|
| `get_status` | ComfyUI status and GPUs, queue length, recent image and music jobs, and the saved setups |
| `list_models` | Installed checkpoints, diffusion models, LoRAs, or YuE2 music checkpoints |
| `generate_image` | txt2img from a model's setup, with optional overrides. Supports NovelAI (Opus free window), wildcards, saved characters, styles and chunks by name |
| `generate_music` | A YuE2 song from a style, lyrics and duration |
| `create_comic` | Lay out a comic page, generate every panel and assemble it |
| `redo_comic_panels` | Remake specific panels of a finished comic page |
| `get_job` | Status and results of an image, comic or music job |
| `cancel_generation` | Cancels assistant jobs only, never generations started in the window |
| `search_gallery` | Searches prompts and models, or lists the newest images; filter by board, favourites or rating |
| `get_image` | A preview of a gallery image and its generation settings, with a signed download link |
| `list_library` | The owner's saved characters, artist styles, prompt chunks and wildcard files |
| `get_character` | A saved character's full prompt, UC and memory files |
| `edit_image` | Edit a gallery image with an instruction, using an Image Edit model |
| `upscale_image` | Upscale and refine a gallery image |
| `list_boards` | Gallery boards with image counts, plus favourited and rated counts |
| `search_eagle` | Search the Eagle library (Eagle must be open); list folders with list_folders |
| `get_eagle_image` | Preview an Eagle item with tags, notes and a download link |
| `send_to_eagle` | Add gallery images to Eagle with prompt tags and annotation |

## See also

- [[Settings and Accessibility]]
- [[Server, LAN and Multi-User]]
- [[Music Generation]]
