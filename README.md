# MooshieUI — website

The marketing + docs site for **MooshieUI**, a beginner-friendly interface for
[ComfyUI](https://github.com/comfyanonymous/ComfyUI). Built with **SvelteKit**
and the MooshieUI design system — dark canvas, one Mooshie Yellow action,
hairline borders, Hanken Grotesk type, Lucide-weight line icons, compact spacing.

## Pages

- **`/`** — landing page: hero with a cursor-tracking 3D tilt on the app
  screenshot, feature grid, desktop-vs-browser modes, a "closer look" walkthrough,
  and OS-neutral get-started cards.
- **`/build`** — build-the-desktop-app-from-source guide with copyable terminal
  steps.
- **`/docker`** — self-host-with-Docker guide for the browser/server build.

## Design system

Tokens are lifted verbatim from the MooshieUI design-system bundle and live in
`src/lib/styles/` (colors, typography, spacing, effects, fonts, base), pulled
together by `src/app.css`. The same file layers the **Tweaks** theme variants —
theme (charcoal / midnight / cream), accent (honey / mooshie / terracotta),
backdrop, corners, and type — toggled live via the floating Tweaks panel
(`src/lib/components/Tweaks.svelte`) and persisted to `localStorage`. The
trustworthy default is **charcoal + honey + flat + soft + Hanken Grotesk**.

Brand assets (logo, favicon, app screenshot) are in `static/assets/`.

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # static production build → ./dist
npm run preview  # preview the production build
```

The site is fully prerendered (`adapter-static`), so it deploys to any static
host.

## Production domain and Cloudflare Pages

The production address is **https://mooshieui.com**. The public origin and
sitemap paths are maintained in `src/lib/site.js`. The layout uses that origin
for page-specific canonical URLs and social images; `/robots.txt` and
`/sitemap.xml` are generated as static files during the build.

Cloudflare Pages uses `npm run build` with output directory `dist`, matching
`svelte.config.js` and `wrangler.toml`. Custom domains and redirects are configured
in Cloudflare's dashboard.

See [the domain migration guide](docs/cloudflare-domain-migration.md) for the
ordered setup, exact redirect values, and verification steps. Connect and verify
the new domain before deploying the metadata change and enabling redirects.

## Source

Reverse-engineered from the MooshieUI design-system handoff bundle and the
upstream repo: [`Mooshieblob1/MooshieUI`](https://github.com/Mooshieblob1/MooshieUI).
