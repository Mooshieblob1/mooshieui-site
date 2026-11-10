# Server, LAN and Multi-User

MooshieUI can run as a headless web server that serves the same Svelte UI over your network, including a dedicated mobile layout for phones and tablets.

## Phone layout

On a phone the app uses a bottom bar with **Generate**, **Video**, **Gallery**, **Music** and **More**. **More** holds Artists, Characters, Scenes, Image to 3D (when its experimental toggle is on), the Model Hub (when allowed), Settings, Interrogate, notifications, bug reports, the connection status and **Switch to desktop layout**. A dot on **More** means unread notifications or a lost connection.

On the Generate page the header holds the settings tabs, Profiles, the mode switcher and the Canvas Editor toggle. A dock above the bar keeps **Prompt**, **Model**, **Library** and the Generate button in reach. Tap or drag the grab bar on an open panel to close it. Prompts are the first section by default.

## Running the server

See [[Installation]] for Docker and remote-ComfyUI setup. The desktop app's browser server binds `127.0.0.1` when LAN access is off and `0.0.0.0` when it is on. The headless server always enables LAN access and binds all interfaces. The default internal port is `3200`; the supplied Compose file's `MOOSHIEUI_PORT` sets the published host port. Outside Compose, the internal port comes from `ui_server_port` in the app config.

The desktop browser-mode heartbeat watchdog can shut down the app after its browser closes; LAN mode disables that idle shutdown. In v2.3.36 and later the desktop window does not need browser mode to share: with LAN access on, the app starts the web server on your network at launch and keeps its window open, so other devices can connect while you work in the app. The headless server runs independently of any browser tab.

## Sharing on your network (LAN mode)

Turn on LAN access in Settings > App Mode, from the desktop window (v2.3.36 and later) or from browser mode. In v2.3.22 and later the LAN section lists the addresses other devices can use, each with a **Copy** button:

- `http://mooshieui.local:PORT` comes first (desktop builds). The desktop app announces this name on the local network, so devices on the same Wi-Fi can open it without knowing the PC's IP. If another machine already uses the name, MooshieUI takes `mooshieui-2.local` and shows that instead. If a device can't open the `.local` address (some Android phones and Windows PCs), use the IP address instead.
- Then this PC's network IP addresses. VPN, VM and container adapters are skipped, and each address uses the port and scheme the server actually listens on.

The server only becomes reachable from other devices after a restart, and the section says so right after LAN access is turned on.

### Windows Firewall

On Windows, turning on LAN access checks the firewall. If other devices would be blocked, MooshieUI adds an allow rule named "MooshieUI LAN access" after one admin (UAC) prompt, and removes any block rules Windows added for it earlier. The LAN section shows the firewall state and an **Allow in firewall** button while it is still closed. The rule covers Private and Domain networks only. If Windows treats your network as Public, the section warns that other devices can't connect; set it to Private in Windows Settings > Network & internet if it is your home network. The firewall can only be changed from the PC running MooshieUI.

### Access from outside your home network

**Allow access from outside your home network** (off by default, admin only) asks your router (UPnP) to forward the server's port to this PC and shows the public address with a **Copy** button. The port closes again when you turn the option off or close MooshieUI, and the router lease expires within an hour if the app crashes. Anyone on the internet can then reach the sign-in page, so give every account a strong password; without HTTPS, passwords are sent unencrypted.

If it does not work, the section says why: no router answered (turn on UPnP in the router's settings, then switch the option off and on again), the router refused, another device already uses the port, or the router has no public address of its own because your provider shares one or there is a second router.

Admin commands that read or write files at a path sent by the client (saving files, uploading or importing from a folder, changing the gallery folder) only run from the PC running MooshieUI, so a stolen admin password cannot be used to read or write arbitrary files on it.

### HTTPS

The web server can serve HTTPS itself. Set `MOOSHIEUI_TLS_CERT_PATH` and `MOOSHIEUI_TLS_KEY_PATH` to a PEM certificate (full chain) and its private key before starting the server; both are needed, and with only one set the server logs a warning and stays on HTTP. In Docker, mount the files into the container and add both variables to the service's `environment:` list in `docker-compose.yml`; the supplied compose file does not pass them through from `.env`. Browsers only allow some features, such as copying to the clipboard, on HTTPS or `localhost`, so this is worth setting up for regular LAN use. A reverse proxy or tunnel that terminates HTTPS in front of MooshieUI works too.

## Roles and permissions

Four roles control what each user can do:

| Role | Capabilities |
|------|--------------|
| **Admin** | Full control. Opening the app on the server's own computer at `localhost` or an IP address is admin without signing in, unless that is turned off (see [Authentication](#authentication)); a LAN account can also be promoted. Admins use the shared root gallery. |
| **Moderator** | Shared settings, model files and local LLM models, except settings that decide what the host runs, which folders it uses or how the server is exposed (generation mode, LAN access, paths). Installs only the node packs MooshieUI offers. Moving the installation, changing the gallery folder and saving to arbitrary paths are admin-only. |
| **User** | Generate and use their own gallery. |
| **Anonymous** | Unauthenticated remote visitor; must sign in to use protected commands and gallery resources. |

Other multi-user behavior:

- Per-user gallery isolation. Each user and moderator account gets its own gallery folder; only admins see the shared root gallery.
- In v2.3.8 and later, generated images, videos and exports are served only to the account that made them, and each account keeps its own browser-side preferences. API keys and other secrets are sent only to admins.
- To reach the desktop gallery from a phone, promote that login: open the account's gear menu in Settings > App Mode and press **Make Admin** (**Revoke Admin** undoes it). The user refreshes the page afterwards. Images already generated under the account stay in its own folder. An admin cannot change its own role.
- Regular users and moderators each manage their own encrypted NovelAI key in Settings > NovelAI. Admins use the instance owner's key. See [[NovelAI Backend]] for key storage and account promotion behavior.
- Per-user storage limit (default 1 GB).
- User/moderator gallery images and videos expire after 7 days by default; an admin can disable this with **Never auto-delete gallery images** in Settings > Gallery. The shared root gallery is exempt from automatic expiry.
- Non-admin users can submit model-download requests for admin/moderator approval (see [[Models and the Model Hub]]).

## Authentication

- Bearer-token auth for API requests.
- Passwords hashed with Argon2id, with an upgrade path from legacy SHA-256 hashes.
- Account lockout after 15 failed logins (15-minute lockout). In v2.3.8 and later, one address is also refused for 15 minutes after 10 failed logins, so a single client cannot lock someone else's account.
- Changing a password signs out that account's other sessions.
- New usernames use letters, numbers, `_` and `-`, up to 32 characters.
- Sessions last 7 days.
- Bootstrap the first admin with `MOOSHIEUI_ADMIN_USER` / `MOOSHIEUI_ADMIN_PASS` before the first server launch. Empty or short passwords and `changeme` are not accepted. Existing accounts keep their stored password when these environment variables change; there is no public self-registration.

Admin without a token needs all of these: the connection comes from the same computer, the address is `localhost`, a `*.localhost` name or an IP address, the request comes from MooshieUI's own page, and no proxy relayed it. A website you visit cannot use your browser to send commands, and opening the server by machine name or through a tunnel or reverse proxy means signing in like any LAN user.

A request carrying `Forwarded`, `X-Forwarded-For`, `X-Forwarded-Host`, `X-Real-IP`, `CF-Connecting-IP` or `True-Client-IP` counts as relayed. Browsers never send these, but most proxies and tunnels do, including cloudflared. A proxy that rewrites the host name to `127.0.0.1` and adds none of them, as a bare nginx `proxy_pass` does, still looks local. For that setup, add `proxy_set_header X-Forwarded-For $remote_addr;` or `proxy_set_header Host $host;` to the proxy, or turn off automatic sign-in as described below. Forwarded headers never grant a role.

In v2.3.8 and later, **Sign in automatically on this computer** in Settings > App Mode turns off admin without a token entirely, so everyone signs in with an account, including you. It applies immediately. On the headless server, `MOOSHIEUI_TRUST_LOCALHOST=false` does the same and overrides the setting; the supplied Compose file passes it through from `.env`. Automatic sign-in stays on until an admin account exists, so turning it off cannot lock you out.

Personal NovelAI credentials are encrypted in the data directory. Preserve the generated `secrets.key`, or supply a persistent `MOOSHIEUI_SECRET_KEY` (base64-encoded 32 bytes) to the server process. In Docker, setting an extra value in `.env` alone does not pass it into the container: add it to the service's `environment` or your deployment's secret configuration. See [[NovelAI Backend]].

## Auto-update

- **Desktop** - the updater checks GitHub releases, shows a dismissable banner, downloads with a progress bar, and offers "Restart Now."
- **Browser/LAN** - the client polls the server for a newer build; admins and moderators see a banner when a server update is available.
