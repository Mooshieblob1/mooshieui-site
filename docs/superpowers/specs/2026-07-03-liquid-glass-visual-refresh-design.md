# MooshieUI Visual Refresh: Liquid-Glass Effects on the Existing Palette

## Context

A design spec was supplied for an unrelated product ("Mindloop," an AI-newsletter platform) built with Svelte + Tailwind + shadcn/ui + Framer Motion, a pure-black/white monochrome palette, Inter + Instrument Serif typography, a `.liquid-glass` CSS treatment, a `fadeUp(delay)` scroll-reveal animation pattern, and newsletter-specific page sections (email subscribe hero, ChatGPT/Perplexity/Google comparison, video-backed CTA).

MooshieUI is an existing, mature marketing site for a ComfyUI desktop/browser app, built with SvelteKit 2 + Svelte 5, a hand-rolled CSS custom-property design-token system (`src/lib/styles/*.css`), and a runtime "Tweaks" theme switcher (`src/lib/theme.js`, `src/lib/components/Tweaks.svelte`) that lets visitors toggle between palette/accent/backdrop/corner-radius/font variants.

This spec resolves the conflict between the pasted design system and the real site: it keeps MooshieUI's actual content, structure, and dark-charcoal/Mooshie-Yellow brand identity, and borrows only the *effects* layer from the pasted spec (liquid-glass styling, Inter/Instrument-Serif typography, and the fade-up scroll animation pattern).

## Decisions locked in

These were confirmed directly with the user and are non-negotiable constraints on the design below:

1. **Palette**: remove the Tweaks theme-switcher system entirely. Do not adopt pure black/white monochrome. Permanently fix the site to its current default palette (`theme-charcoal` + `accent-honey` + `bg-flat` + `round-soft`). Only the pasted spec's *effects* — liquid-glass, typography, animation — are borrowed, not its colors.
2. **Tech stack**: full migration — add TypeScript, Tailwind CSS, shadcn-svelte, and a Svelte-compatible motion library (not `framer-motion`, which is React-only).
3. **Content**: keep all existing sections (Nav, Hero, Features, Modes, CloserLook, Download, Footer) with their current copy and structure. Restyle only. Drop all newsletter-specific concepts (email subscribe, AI-search comparison, social platform icons, "Start Writing" CTA).
4. **Media**: static imagery only (`static/assets/app-screenshot.avif`). No new video, no `hls.js`.

## Goals

- Layer liquid-glass surfaces, Inter/Instrument-Serif typography, and a scroll-driven fade-up animation system onto the existing MooshieUI site.
- Remove the Tweaks theme-switcher system and all dead CSS/JS it leaves behind, collapsing today's defaults into the site's one permanent look.
- Migrate tooling (TypeScript, Tailwind, shadcn-svelte, motion library) additively — used where the redesign touches things, not as a wall-to-wall rewrite of already-correct, design-system-sourced CSS.

## Non-goals

- No monochrome/pure-black palette.
- No new page sections, no content/copy changes to kept sections.
- No video backgrounds, no HLS streaming, no `hls.js`.
- No full utility-class rewrite of every existing component's scoped CSS.
- No changes to `/build`, `/docker` guide pages, `CodeBlock.svelte`, `GuideFooter.svelte`, or `Icon.svelte` beyond automatically inheriting the updated global tokens (fonts, colors) — they are not otherwise touched.

## Architecture & tech approach

Add TypeScript, Tailwind CSS, shadcn-svelte, and `@humanspeak/svelte-motion` on top of the current SvelteKit app, configuring Tailwind's theme to read the *existing* CSS custom properties (`--bg`, `--text`, `--accent-500`, `--border-700`, etc.) rather than introducing a parallel color/spacing scale. This keeps the design-system token files (`colors.css`, `typography.css`, `spacing.css`, `effects.css`) as the single source of truth; Tailwind and shadcn-svelte are additive utilities for new/touched markup, not a replacement for the token system.

`@humanspeak/svelte-motion` replaces the literal `framer-motion` dependency named in the original spec — it's a Svelte 5-native library exposing the same declarative `motion.<tag>` API (`initial`, `whileInView`, `viewport`, `transition`), close enough to reimplement the spec's `fadeUp(delay)` helper faithfully. `hls.js` is dropped outright since there is no video/streaming use case under the "static imagery only" decision.

shadcn-svelte is scoped narrowly: only `Button` (and optionally `Card`) get added. The existing hand-rolled `.btn`, `.feature`, `.mode`, `.dl-card` classes already match the design system precisely; wrapping them in shadcn primitives is only worth doing where it saves real code, not for its own sake.

## Global foundations

**Palette lock-in.** The runtime theme system disappears; today's defaults become the only, permanent values:
- Delete `src/lib/theme.js` and `src/lib/components/Tweaks.svelte` (and remove the component's mount/import site).
- In `src/app.css`, collapse `body.theme-charcoal`, `body.accent-honey`, `body.round-soft`, `body.font-grotesk` into plain `:root` rules. Delete `theme-midnight`, `theme-cream`, `accent-mooshie`, `accent-terracotta`, `round-sharp`, `font-rounded`, `font-clean` and their selectors entirely (dead code with no switcher to trigger them).
- `bg-flat` wins outright: delete the `.organic-bg`/`.hero-glow` blob machinery and the `body.bg-blobs`/`body.bg-glow` variants. Remove the `<div class="organic-bg">` markup from `src/routes/+layout.svelte`. The backdrop stays flat/solid.
- `src/app.html`: remove the hardcoded `class="theme-charcoal accent-honey bg-flat round-soft font-grotesk"` on `<body>` — meaningless once the CSS collapses to `:root` with no variant classes to apply.

**Typography.** Replace the Hanken Grotesk `@import` in `src/lib/styles/fonts.css` with Inter (variable weight) as the new `--font-sans`. Add Instrument Serif (italic) as a new `--font-serif` token, used *only* as a one-word accent inside section headings/hero copy — never for body text or UI chrome. Remove the now-dead Google Fonts `DM+Sans`/`Quicksand` `<link>` in `src/app.html` (it only existed to back the font-switcher options being deleted).

**Spacing/radii.** Untouched. `spacing.css`'s 4px scale and `--radius-*` tokens (already effectively "soft" today) stay as-is. Tailwind's theme config references these variables directly rather than introducing a competing scale.

Net effect: the site looks the same on load as it does today with default Tweaks settings, minus the switcher UI and dead CSS variants, with Inter/Instrument-Serif replacing Hanken Grotesk and room made for the liquid-glass + motion layer below.

## Liquid-glass utility

Add the following class, verbatim, to the global stylesheet (e.g. a new `src/lib/styles/effects.css` addition or `app.css`):

```css
.liquid-glass {
  background: rgba(255, 255, 255, 0.01);
  background-blend-mode: luminosity;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: none;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}
.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%,
    rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,
    rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```

This reads correctly on the dark-charcoal background without modification (it's designed for a dark canvas already).

## Component-by-component treatment

**Nav** (`src/lib/components/Nav.svelte`) — already glass-adjacent (`backdrop-filter: blur(12px)` + translucent background). Apply `.liquid-glass` to the scrolled sticky bar in place of the current `color-mix` background, so it gains the gradient-mask hairline border and inset sheen. Apply `.liquid-glass` to the GitHub ghost button and primary CTA button — the clearest, most natural home for the effect.

**Hero** (`src/lib/components/Hero.svelte`) — no video or subscribe form (matches the "static imagery only" decision; none exist here today). The `.hl` accent span ("None of the node graph.") switches from solid-accent-color text to `--font-serif` italic in the accent color — the single serif-accent moment on the page. The app-window showcase gains a subtler `.liquid-glass` sheen layered underneath the existing cursor-tilt/sheen interaction (that interaction is kept as-is). Headline and showcase fade up on load via `fadeUp(delay)` instead of appearing instantly.

**Features / Modes / CloserLook / Download** — each `.feature`, `.mode`, `.dl-card` card gets `.liquid-glass` as its surface treatment, replacing the flat `--surface-900` background + solid border. Each grid's cards stagger in via `fadeUp(delay)` with increasing delay per item, **replacing** the existing `use:reveal` action calls in these components. One word per section heading/eyebrow renders in italic `--font-serif` for accent (e.g., "Same interface, *desktop* or browser"). The CloserLook mock control-panel markup is untouched content-wise; it only gains the glass border/surface.

**Footer** (`src/lib/components/Footer.svelte`) — lighter touch: no card surfaces to convert. Column groups fade up on scroll via the same motion helper. No serif-italic accent here — plain styling is appropriate for a footer.

**Out of scope**: `Icon.svelte`, `release.js`, `/build` and `/docker` guide pages and their `CodeBlock`/`GuideFooter` components are not touched directly; they inherit the updated global tokens (fonts, colors) automatically since those are global CSS custom properties.

## Animation system

Add `@humanspeak/svelte-motion` as a dependency. Define one shared helper, `src/lib/motion.js`, mirroring the original spec's pattern:

```js
export const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.6, delay, ease: 'easeOut' }
});
```

The `duration`/`ease` values mirror the existing `--dur-*`/`--ease-out` design tokens' current values for visual consistency, even though the motion library takes its own transition object rather than reading CSS variables directly.

Delete `src/lib/actions/reveal.js` and all `use:reveal` call sites. It is functionally superseded — every place it's used today (`Hero`, `Features`, `Modes`, `CloserLook`, `Download`) switches to `motion.div` + `fadeUp(delay)` from the shared helper, so there is exactly one animation system in the codebase, not two.

## Dependencies

**Added**: `typescript`, `tailwindcss` + `@tailwindcss/vite`, `shadcn-svelte` (CLI-managed; `Button` component only to start, `Card` optional if a concrete need arises during implementation), `@humanspeak/svelte-motion`.

**Explicitly not added**: `framer-motion` (React-only; replaced by `@humanspeak/svelte-motion` above), `hls.js` (no video/streaming use case under the "static imagery only" decision).

## Files changed

**Removed**:
- `src/lib/theme.js`
- `src/lib/components/Tweaks.svelte`
- `src/lib/actions/reveal.js`

**Most affected**:
- `src/app.css` — Tweaks-variant collapse into fixed `:root` values; `.liquid-glass` utility added.
- `src/app.html` — drop Tweaks body classes and the dead Google Fonts `DM+Sans`/`Quicksand` link.
- `src/lib/styles/fonts.css` — Inter + Instrument Serif in place of Hanken Grotesk.
- `src/routes/+layout.svelte` — drop the `organic-bg` blob markup.
- `src/lib/components/Nav.svelte`, `Hero.svelte`, `Features.svelte`, `Modes.svelte`, `CloserLook.svelte`, `Download.svelte`, `Footer.svelte` — template and scoped-style edits per the component-by-component section above.
- New Tailwind/shadcn-svelte config files (`tailwind.config.*`, shadcn-svelte's `components.json`), `vite.config` updated for the Tailwind Vite plugin, `jsconfig.json` → `tsconfig.json` conversion.

**Untouched**: `src/lib/icons/Icon.svelte`, `src/lib/release.js`, `src/routes/build/+page.svelte`, `src/routes/docker/+page.svelte`, `src/lib/components/CodeBlock.svelte`, `src/lib/components/GuideFooter.svelte`, `static/tokens/*.css`.

## TypeScript conversion scope

Convert build/config files and any new code to TypeScript (`tsconfig.json` in place of `jsconfig.json`). Existing component `<script>` blocks adopt `lang="ts"` where they gain meaningful type surface (e.g., typed `$props()` destructures such as `Modes`'/`Download`'s `release` prop), not as a forced line-by-line rewrite of every internal variable in components that aren't otherwise being touched.
