# MooshieUI — website

The marketing + docs site for **MooshieUI**, a beginner-friendly interface for
[ComfyUI](https://github.com/comfyanonymous/ComfyUI). Built with **SvelteKit**
and the MooshieUI design system — dark canvas, one Mooshie Yellow action,
hairline borders, Hanken Grotesk type, Lucide-weight line icons, compact spacing.

## Pages

- **`/`** — landing page: hero with the app screenshot, feature grid, desktop-vs-browser modes, a "closer look" walkthrough,
  and OS-neutral get-started cards.
- **`/build`** — build-the-desktop-app-from-source guide with copyable terminal
  steps.
- **`/docker`** — self-host-with-Docker guide for the browser/server build.
- **`/wiki`** — the MooshieUI wiki: sidebar, search (Ctrl/Cmd+K or `/`), on-this-page
  contents, diagrams, and a Markdown view with Copy all on every page.
- **LLM files** — `/wiki/<page>.md` (one page), `/llms.txt` (index) and
  `/llms-full.txt` (the whole wiki and the repository docs in one file).

## Wiki content

The wiki text comes from the GitHub wiki (`Mooshieblob1/MooshieUI.wiki.git`) and
is kept as a snapshot in `wiki/`, with the source commit in `wiki/source.json`.
Key documents from the MooshieUI repository (README, CONTRIBUTING, SECURITY,
AGENTS and the `docs/` references) are copied from `main` into `wiki/repo/` and shown
under "Project docs" and "Technical reference"; the list is
`src/lib/wiki/repo-docs.js`. Don't edit any of these files here; edit the GitHub
wiki or the MooshieUI repository.

- `npm run wiki:sync` pulls the latest wiki, the listed repository docs and the
  release tag list (`wiki/releases.json`, used to link version numbers).
- The **Sync wiki** workflow runs that every 6 hours (or on demand from the Actions
  tab) and commits any change to `main`, which redeploys the site.
- Rendering lives in `src/lib/server/wiki.js`. The wiki has no images, so diagrams and
  screenshots are added site-side in `src/lib/server/figures.js`, placed by heading text.
- Page and group icons are mapped in `src/lib/wiki/icons.js`; the sidebar order comes
  from the wiki's `_Sidebar.md`.
- `src/lib/wiki/meta.js` maps each page to the MooshieUI release its feature first
  shipped in (from `CHANGELOG.md`), shown as an "Added in" badge. Add an entry when a
  new feature page lands. Version numbers in page text become chips, linked to their
  release notes when they are MooshieUI release tags.

## Design system

Tokens are lifted verbatim from the MooshieUI design-system bundle and live in
`src/lib/styles/` (colors, typography, spacing, effects, fonts, base), pulled
together by `src/app.css`. The site ships one theme; there is no theme switcher.

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
