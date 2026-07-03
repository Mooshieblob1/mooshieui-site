# Liquid-Glass Visual Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Layer liquid-glass surfaces, Inter/Instrument-Serif typography, and scroll-driven fade-up animation onto the existing MooshieUI marketing site, while permanently locking the site to its current default palette and removing the runtime Tweaks theme switcher.

**Architecture:** Additive tooling migration (TypeScript, Tailwind CSS v4, a hand-authored shadcn-svelte-style `Button`, `@humanspeak/svelte-motion`) on top of the existing SvelteKit 2 + Svelte 5 app. The hand-rolled CSS design-token files (`src/lib/styles/*.css`) stay the single source of truth; Tailwind's `@theme inline` reads those existing custom properties rather than introducing a parallel scale. `.liquid-glass` is a single global utility class added to card/nav surfaces. `fadeUp(delay)` from a shared `src/lib/motion.js` helper replaces the existing `use:reveal` IntersectionObserver action everywhere it's used.

**Tech Stack:** SvelteKit 2.8 / Svelte 5.1, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`, CSS-first `@theme inline` config, no `tailwind.config.*` file), `tailwind-variants` + `clsx` + `tailwind-merge` (shadcn-svelte-style `Button`), `@humanspeak/svelte-motion` (Svelte-native replacement for `framer-motion`), Cloudflare Pages via `adapter-static`.

## Global Constraints

These apply to every task below; re-read them before touching CSS or swapping an element to `motion.div`.

- **No monochrome palette.** The site keeps its current dark-charcoal + Mooshie-honey-yellow identity. Only the pasted spec's *effects* (liquid-glass, typography, fade-up animation) are borrowed — never its black/white colors.
- **Palette is permanently fixed** to today's `theme-charcoal` + `accent-honey` + `bg-flat` + `round-soft` combination. The Tweaks runtime switcher is deleted entirely, not hidden or disabled.
- **Static imagery only.** No new video, no `hls.js`. `static/assets/app-screenshot.avif` stays as-is.
- **No `framer-motion`** (React-only) — `@humanspeak/svelte-motion` is the motion library everywhere this plan says "motion".
- **No test-framework introduction.** This repo has no Vitest/Playwright today and none is added by this plan. Every task's verification is `npm run check` (svelte-check), `npm run build` (compile-time correctness), and a manual visual check in `npm run dev` — not automated unit tests.
- **No content/copy changes** beyond the four single-word serif-italic accents named in this plan (Features: "graph-wrangling", Modes: "desktop", CloserLook: "finished", Download: "minutes"). All existing section structure, copy, and props stay as-is.
- **CSS specificity rule — global `.liquid-glass` vs. component-scoped rules:** Svelte's scoped-style compiler appends a `.svelte-hash` class to every rule generated from a component's `<style>` block, giving those rules strictly higher specificity than any plain global class like `.liquid-glass` (a single class, specificity `(0,1,0)`) — **regardless of source order in `app.css`.** Placing `.liquid-glass` after a component's scoped rule in `app.css` does **not** let it override that rule's `background`/`border`/`box-shadow`. The fix used throughout this plan: directly remove the conflicting `background`/`border`/`box-shadow` (and, where liquid-glass also supplies it, `position`/`overflow`) declarations from each component's own scoped rule, leaving `.liquid-glass` to supply them. This does **not** apply to rules that are themselves global (e.g. `.btn`, `.btn-primary`, `.btn-ghost` in `app.css`) — there, `.liquid-glass`'s position *after* them in the same file legitimately wins the specificity tie.
- **Svelte-scoping rule — swapping a native element to `<motion.div>`:** doing so moves that DOM node's rendering into a child component (`@humanspeak/svelte-motion`), so Svelte's own scoping hash is **not** applied to it anymore. Any rule in the parent's `<style>` block that targets that element **as the rightmost/target compound selector** (e.g. a standalone `.sec-head { ... }` rule) will silently stop matching unless rewritten as `:global(.sec-head) { ... }`. Rules where the swapped element is merely an **ancestor** in a descendant selector (e.g. `.sec-head h2`) need no change — Svelte only ever hash-scopes the rightmost compound selector, and the `h2` there is still a native tag written directly in the same component's template. When an element has another action or binding worth preserving (e.g. Hero's `use:tilt` + `bind:this`), **wrap** it in an unstyled outer `<motion.div>` instead of swapping its tag — the inner element and all its existing scoped CSS stay untouched.
- **Card corner-radius is a literal `24px`, not `var(--radius-lg)`/`var(--radius-xl)`.** Today, `body.round-soft .feature, body.round-soft .mode, body.round-soft .dl-card { border-radius: 24px; }` in `app.css` has higher specificity than each component's own scoped `border-radius: var(--radius-*)` declaration, so `.feature`/`.mode`/`.dl-card` all render at a flat 24px today regardless of their own radius token. Task 5 deletes that override rule outright (no replacement — see below), and Tasks 10/11/13 bake `border-radius: 24px;` directly into each component's own `:global(.feature)`/`:global(.mode)`/`:global(.dl-card)` rule instead. This avoids relying on cross-file cascade order between `app.css` and a component's compiled scoped CSS, which the bundler does not guarantee. `.closer-media` was never part of that override selector list, so it keeps `var(--radius-lg)` unchanged.

---

### Task 1: Add TypeScript support

**Files:**
- Create: `tsconfig.json`
- Modify: `svelte.config.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: `npm run check` script; `.svelte-kit/tsconfig.json` (generated); every later task that adds `lang="ts"` or a `.ts` file relies on this tsconfig existing.

- [ ] **Step 1: Install TypeScript and svelte-check**

Run: `npm install -D typescript svelte-check`

Expected: `package.json`'s `devDependencies` gains `typescript` and `svelte-check` entries.

- [ ] **Step 2: Add `preprocess` to `svelte.config.js`**

Replace the full contents of `svelte.config.js`:

```js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			pages: 'dist',
			assets: 'dist',
			fallback: '404.html'
		})
	}
};

export default config;
```

(`vitePreprocess` ships from `@sveltejs/vite-plugin-svelte`, already a devDependency — no new package needed for this step.)

- [ ] **Step 3: Generate `.svelte-kit/tsconfig.json`**

Run: `npx svelte-kit sync`

Expected: creates/updates `.svelte-kit/tsconfig.json` (gitignored, regenerated on every dev/build).

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
	"extends": "./.svelte-kit/tsconfig.json",
	"compilerOptions": {
		"allowJs": true,
		"checkJs": false,
		"esModuleInterop": true,
		"forceConsistentCasingInFileNames": true,
		"resolveJsonModule": true,
		"skipLibCheck": true,
		"sourceMap": true,
		"strict": true
	}
}
```

`checkJs: false` is deliberate: this migration adds TypeScript additively (new files, and existing components only where they gain a real prop type) — it does not retrofit type-checking onto every pre-existing plain-`.js` file. Only `.ts` files and `.svelte` files with `lang="ts"` are checked from here on.

- [ ] **Step 5: Add the `check` script to `package.json`**

Modify the `"scripts"` block:

```json
	"scripts": {
		"dev": "vite dev",
		"build": "vite build",
		"preview": "vite preview",
		"check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json"
	},
```

- [ ] **Step 6: Verify**

Run: `npm run check`

Expected: exits 0, reports 0 errors (no `.ts` files exist yet besides config, so this just confirms the toolchain is wired correctly).

- [ ] **Step 7: Commit**

```bash
git add tsconfig.json svelte.config.js package.json package-lock.json
git commit -m "chore: add TypeScript support via svelte-check"
```

---

### Task 2: Add Tailwind CSS v4

**Files:**
- Modify: `vite.config.js`
- Modify: `src/app.css`
- Modify: `package.json`

**Interfaces:**
- Consumes: nothing new from Task 1.
- Produces: the `@theme inline { ... }` block in `src/app.css`, which Task 6 appends `--font-serif` to.

- [ ] **Step 1: Install Tailwind CSS and its Vite plugin**

Run: `npm install -D tailwindcss @tailwindcss/vite`

- [ ] **Step 2: Add the plugin to `vite.config.js`**

Replace the full contents of `vite.config.js`:

```js
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()]
});
```

- [ ] **Step 3: Add the Tailwind import and `@theme inline` block to `src/app.css`**

Replace lines 1–13 of `src/app.css` (the header comment through the last `@import`):

```css
/* ==========================================================================
   MooshieUI site — global stylesheet
   Pulls in the design-system tokens, then layers the page-level base, the
   organic/trust theme variants, and shared button + utility classes the
   landing/guide pages mirror from the design system.
   ========================================================================== */

@import './lib/styles/fonts.css';
@import './lib/styles/colors.css';
@import './lib/styles/typography.css';
@import './lib/styles/spacing.css';
@import './lib/styles/effects.css';
@import './lib/styles/base.css';
```

with:

```css
/* ==========================================================================
   MooshieUI site — global stylesheet
   Pulls in the design-system tokens, then layers the page-level base, the
   organic/trust theme variants, and shared button + utility classes the
   landing/guide pages mirror from the design system.
   ========================================================================== */

@import 'tailwindcss';
@import './lib/styles/fonts.css';
@import './lib/styles/colors.css';
@import './lib/styles/typography.css';
@import './lib/styles/spacing.css';
@import './lib/styles/effects.css';
@import './lib/styles/base.css';

@theme inline {
	--color-bg: var(--bg);
	--color-surface-950: var(--surface-950);
	--color-surface-900: var(--surface-900);
	--color-surface-800: var(--surface-800);
	--color-border-700: var(--border-700);
	--color-text: var(--text);
	--color-text-strong: var(--text-strong);
	--color-text-muted: var(--text-muted);
	--color-text-subtle: var(--text-subtle);
	--color-accent-300: var(--accent-300);
	--color-accent-400: var(--accent-400);
	--color-accent-500: var(--accent-500);
	--color-accent-600: var(--accent-600);
	--color-accent-foreground: var(--accent-foreground);
	--font-sans: var(--font-sans);
	--radius-sm: var(--radius-sm);
	--radius-md: var(--radius-md);
	--radius-lg: var(--radius-lg);
	--radius-xl: var(--radius-xl);
	--radius-2xl: var(--radius-2xl);
}
```

(`@theme inline` — not plain `@theme` — is required here: it substitutes `var(--token)` at each utility's use site instead of emitting new root custom properties, so it keeps reading whatever value is active in the cascade at runtime. Several of these keys, like `--font-sans` and `--radius-*`, share Tailwind's own theme-key namespace, which is exactly the case `inline` mode exists for.)

- [ ] **Step 4: Verify the build picks up Tailwind's base layer**

Run: `npm run build`

Then check the built CSS for Tailwind's unconditional preflight reset (PowerShell):

```powershell
Get-ChildItem -Recurse dist/_app/immutable/assets -Filter *.css | Select-String "box-sizing:border-box"
```

Expected: at least one match — confirms Tailwind's `@import 'tailwindcss'` is being processed into the build output. (No visible page change yet — no Tailwind utility classes are used anywhere until later tasks, if ever; this step only proves the plugin is wired correctly.)

- [ ] **Step 5: Commit**

```bash
git add vite.config.js src/app.css package.json package-lock.json
git commit -m "chore: add Tailwind CSS v4"
```

---

### Task 3: Add a hand-authored shadcn-svelte-style Button

**Files:**
- Create: `src/lib/utils.ts`
- Create: `src/lib/components/ui/button/button.svelte`
- Create: `src/lib/components/ui/button/index.ts`
- Modify: `src/lib/components/Nav.svelte`

**Interfaces:**
- Consumes: nothing new.
- Produces: `Button` component, props `variant?: 'primary' | 'secondary' | 'ghost'` (default `'primary'`), `size?: 'default' | 'sm'` (default `'default'`), `href?: string`, `class?: string`, plus arbitrary passthrough attributes (`target`, `rel`, `onclick`, etc.). Renders an `<a>` when `href` is set, else a `<button>`. Task 8 adds `class="liquid-glass"` to two of its call sites in `Nav.svelte`.

This is hand-authored rather than pulled via the shadcn-svelte CLI, because the CLI's default `Button` brings its own oklch-based color system that would compete with this site's existing CSS custom-property tokens. Instead, `tv()` maps variants directly onto the **existing** `.btn`/`.btn-primary`/`.btn-secondary`/`.btn-ghost`/`.btn-sm` classes — no new Tailwind utility classes are introduced by this component.

- [ ] **Step 1: Install `tailwind-variants`, `clsx`, `tailwind-merge`**

Run: `npm install -D tailwind-variants clsx tailwind-merge`

- [ ] **Step 2: Create the `cn()` helper**

Create `src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: Create the `Button` component**

Create `src/lib/components/ui/button/button.svelte`:

```svelte
<script lang="ts">
	import { tv } from 'tailwind-variants';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	const buttonVariants = tv({
		base: 'btn',
		variants: {
			variant: {
				primary: 'btn-primary',
				secondary: 'btn-secondary',
				ghost: 'btn-ghost'
			},
			size: {
				default: '',
				sm: 'btn-sm'
			}
		},
		defaultVariants: {
			variant: 'primary',
			size: 'default'
		}
	});

	let {
		variant = 'primary',
		size = 'default',
		href = undefined,
		class: className = '',
		children,
		...rest
	}: {
		variant?: 'primary' | 'secondary' | 'ghost';
		size?: 'default' | 'sm';
		href?: string;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	} = $props();
</script>

{#if href}
	<a {href} class={cn(buttonVariants({ variant, size }), className)} {...rest}>
		{@render children?.()}
	</a>
{:else}
	<button class={cn(buttonVariants({ variant, size }), className)} {...rest}>
		{@render children?.()}
	</button>
{/if}
```

- [ ] **Step 4: Create the barrel export**

Create `src/lib/components/ui/button/index.ts`:

```ts
export { default as Button } from './button.svelte';
```

- [ ] **Step 5: Use `Button` in `Nav.svelte`'s landing-variant CTAs**

In `src/lib/components/Nav.svelte`, add the import (script block, after the existing imports):

```svelte
	import Icon from '$lib/icons/Icon.svelte';
	import { base } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
```

Replace the landing-variant `nav-right` block:

```svelte
			<div class="nav-right">
				<a class="btn btn-ghost btn-sm" href={repo} target="_blank" rel="noopener">
					<Icon name="github" size={15} />
					GitHub
				</a>
				<a class="btn btn-primary btn-sm" href="#download">Get started</a>
			</div>
```

with:

```svelte
			<div class="nav-right">
				<Button variant="ghost" size="sm" href={repo} target="_blank" rel="noopener">
					<Icon name="github" size={15} />
					GitHub
				</Button>
				<Button size="sm" href="#download">Get started</Button>
			</div>
```

(The guide-variant `nav-right` block — `.back` link and `.btn.btn-secondary` repo link — is untouched; the spec only calls out Nav's compact landing CTAs for this treatment.)

- [ ] **Step 6: Verify**

Run: `npm run check` — expect 0 errors.

Run: `npm run dev`, open the landing page, confirm the GitHub and "Get started" nav buttons render pixel-identical to before (same classes, same visual result — this task is a structural swap, not a restyle).

- [ ] **Step 7: Commit**

```bash
git add src/lib/utils.ts src/lib/components/ui/button src/lib/components/Nav.svelte package.json package-lock.json
git commit -m "feat: add hand-authored shadcn-svelte-style Button"
```

---

### Task 4: Add the motion library and shared `fadeUp` helper

**Files:**
- Create: `src/lib/motion.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: nothing new.
- Produces: `fadeUp(delay?: number)` returning `{ initial, whileInView, viewport, transition }`, spread onto `<motion.div {...fadeUp(delay)}>` in every Task 9–14 component; `motion` import from `@humanspeak/svelte-motion`.

- [ ] **Step 1: Install `@humanspeak/svelte-motion`**

Run: `npm install -D @humanspeak/svelte-motion`

- [ ] **Step 2: Create the shared `fadeUp` helper**

Create `src/lib/motion.js`:

```js
export const fadeUp = (delay = 0) => ({
	initial: { opacity: 0, y: 20 },
	whileInView: { opacity: 1, y: 0 },
	viewport: { once: true, margin: '-100px' },
	transition: { duration: 0.6, delay, ease: 'easeOut' }
});
```

- [ ] **Step 3: Verify**

Run: `npm ls @humanspeak/svelte-motion` — expect it listed with no `UNMET DEPENDENCY` error.

Run: `npm run build` — expect it to succeed unchanged (nothing imports `motion.js` yet; this only confirms the install didn't break the build).

- [ ] **Step 4: Commit**

```bash
git add src/lib/motion.js package.json package-lock.json
git commit -m "feat: add @humanspeak/svelte-motion and shared fadeUp helper"
```

---

### Task 5: Remove the Tweaks theme switcher and lock the palette

**Files:**
- Delete: `src/lib/theme.js`
- Delete: `src/lib/components/Tweaks.svelte`
- Modify: `src/app.css`
- Modify: `src/app.html`
- Modify: `src/routes/+layout.svelte`

**Interfaces:**
- Consumes: nothing new.
- Produces: the permanent `:root` token values every later task's CSS (and the `@theme inline` block from Task 2) resolves through.

Neither `theme.js` nor `Tweaks.svelte` has any import site anywhere in `src/` today — confirmed via repo-wide grep before writing this plan — so both are a clean, self-contained deletion.

- [ ] **Step 1: Delete the dead files**

```bash
git rm src/lib/theme.js src/lib/components/Tweaks.svelte
```

- [ ] **Step 2: Collapse `src/app.css`'s theme-variant layer into a fixed `:root`**

Replace everything in `src/app.css` from the `/* ====... Organic / trust theme layer ... ====*/` comment through the end of the file (originally lines 146–315, i.e. everything after the `.brand b { ... }` rule and the `@media (prefers-reduced-motion: no-preference) { .reveal { ... } }` block) with:

```css
:root {
	--bg: #18181b;
	--surface-950: #121214;
	--surface-900: #1f1f23;
	--surface-800: #292930;
	--border-700: #34343c;
	--neutral-700: #34343c;
	--neutral-600: #4b4b55;
	--text: #ededf0;
	--text-strong: #fafafb;
	--text-muted: #a1a1aa;
	--text-subtle: #71717a;

	--accent-300: #fbd98f;
	--accent-400: #f8c869;
	--accent-500: #f2b13c;
	--accent-600: #d8922a;
	--accent-foreground: #1b1408;
	--shadow-accent: 0 14px 32px -6px color-mix(in srgb, #d8922a 30%, transparent);

	--radius-sm: 8px;
	--radius-md: 12px;
	--radius-lg: 18px;
	--radius-xl: 26px;
	--radius-2xl: 34px;
}
```

These are the values that were previously applied at runtime by `body.theme-charcoal` + `body.accent-honey` + `body.round-soft` (the Tweaks defaults baked into `src/app.html`'s current `<body>` class) — not `colors.css`'s/`spacing.css`'s own un-overridden `:root` defaults, which differ (e.g. `colors.css` alone would give `--accent-500: #ffcc00`, not the honey `#f2b13c` above). This keeps the site's on-load appearance identical to today.

Do **not** re-add a `.feature, .mode, .dl-card { border-radius: 24px; }` rule here — see the Global Constraints note on card corner-radius; Tasks 10/11/13 bake that value directly into each component instead.

Also delete the now-dead `.hero, .strip, section.block, footer.site { position: relative; z-index: 1; }` rule that used to sit just above the theme layer (it existed only to lift content above the deleted `.organic-bg` blobs) and update the file's header comment to drop the stale "organic/trust theme variants" reference:

```css
/* ==========================================================================
   MooshieUI site — global stylesheet
   Pulls in the design-system tokens, then layers the page-level base and
   shared button + utility classes the landing/guide pages mirror from the
   design system.
   ========================================================================== */
```

(this replaces the header comment inserted at the top of the file back in Task 2 — same location, updated wording only; the `@import`/`@theme inline` lines directly below it are untouched.)

- [ ] **Step 3: Remove the hardcoded body class in `src/app.html`**

Replace:

```html
	<body
		data-sveltekit-preload-data="hover"
		class="theme-charcoal accent-honey bg-flat round-soft font-grotesk"
	>
```

with:

```html
	<body data-sveltekit-preload-data="hover">
```

- [ ] **Step 4: Remove the `organic-bg` blob markup from `src/routes/+layout.svelte`**

Replace the full contents of `src/routes/+layout.svelte`:

```svelte
<script>
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>MooshieUI · A friendly interface for ComfyUI</title>
	<meta
		name="description"
		content="MooshieUI is a clean, guided interface for ComfyUI. Generate images with prompts, LoRAs, and one-click upscaling, on your desktop or in any browser. No Python, no pip, no manual configuration."
	/>
</svelte:head>

<div class="organic-bg" aria-hidden="true">
	<span class="blob b1"></span>
	<span class="blob b2"></span>
</div>

{@render children()}
```

with:

```svelte
<script>
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>MooshieUI · A friendly interface for ComfyUI</title>
	<meta
		name="description"
		content="MooshieUI is a clean, guided interface for ComfyUI. Generate images with prompts, LoRAs, and one-click upscaling, on your desktop or in any browser. No Python, no pip, no manual configuration."
	/>
</svelte:head>

{@render children()}
```

- [ ] **Step 5: Verify**

Run: `npm run build` — expect success with no "module not found" errors (confirms nothing still imports the deleted files).

Run: `npm run dev`, load the landing page, confirm it looks the same as before this task (dark charcoal background, honey-yellow accent, soft-rounded corners) — no visible Tweaks panel existed on the page before either, so there's no UI element to confirm removed, only that nothing broke.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: remove Tweaks theme switcher, lock palette to permanent defaults"
```

---

### Task 6: Replace typography with Inter + Instrument Serif

**Files:**
- Modify: `src/lib/styles/fonts.css`
- Modify: `src/lib/styles/typography.css`
- Modify: `src/app.html`
- Modify: `src/app.css`

**Interfaces:**
- Consumes: the `@theme inline` block from Task 2.
- Produces: `--font-serif` custom property; `.accent-serif` global utility class, used by Tasks 10–13's single-word heading accents.

- [ ] **Step 1: Swap the Google Fonts import in `fonts.css`**

Replace the full contents of `src/lib/styles/fonts.css`:

```css
/* ==========================================================================
   MooshieUI — Fonts
   Primary brand typeface is Hanken Grotesk (a warm humanist grotesque; see the
   @import below), with the native system UI stack as fallback. The other bundled
   webface is OpenDyslexic, an opt-in accessibility font enabled in Settings → Appearance.
   ========================================================================== */

/* Hanken Grotesk — primary brand typeface. A warm, rounded humanist grotesque that
   stays highly legible at the small, dense UI sizes this system lives in. Served from
   Google Fonts; swap for self-hosted woff2 @font-face rules for fully offline delivery. */
@import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&display=swap');

@font-face {
  font-family: 'OpenDyslexic';
  src: url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-Regular.woff') format('woff');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'OpenDyslexic';
  src: url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-Bold.woff') format('woff');
  font-weight: bold;
  font-style: normal;
  font-display: swap;
}
```

with:

```css
/* ==========================================================================
   MooshieUI — Fonts
   Primary brand typeface is Inter, with Instrument Serif (italic) as a one-word
   accent face for section headings, and the native system UI stack as fallback.
   The other bundled webface is OpenDyslexic, an opt-in accessibility font enabled
   in Settings → Appearance.
   ========================================================================== */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@1&display=swap');

@font-face {
  font-family: 'OpenDyslexic';
  src: url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-Regular.woff') format('woff');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'OpenDyslexic';
  src: url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-Bold.woff') format('woff');
  font-weight: bold;
  font-style: normal;
  font-display: swap;
}
```

- [ ] **Step 2: Update `--font-sans` and add `--font-serif` in `typography.css`**

Replace the top of `src/lib/styles/typography.css`:

```css
:root {
  /* ---- Families --------------------------------------------------------- */
  --font-sans: 'Hanken Grotesk', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --font-dyslexic: "OpenDyslexic", var(--font-sans);
```

with:

```css
:root {
  /* ---- Families --------------------------------------------------------- */
  --font-sans: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-serif: 'Instrument Serif', Georgia, 'Times New Roman', serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --font-dyslexic: "OpenDyslexic", var(--font-sans);
```

- [ ] **Step 3: Delete the dead DM+Sans/Quicksand link in `src/app.html`**

`app.html`'s `<link href="...DM+Sans...Quicksand...">` only ever backed the now-deleted Tweaks font-switcher's alternate font options — it never served the site's primary typeface (that comes from `fonts.css`'s own `@import`, already updated in Step 1). Replace:

```html
		<link rel="preconnect" href="https://fonts.googleapis.com" />
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
		<link
			href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&display=swap"
			rel="stylesheet"
		/>
		%sveltekit.head%
```

with:

```html
		<link rel="preconnect" href="https://fonts.googleapis.com" />
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
		%sveltekit.head%
```

- [ ] **Step 4: Add `--font-serif` to the `@theme inline` block and add the `.accent-serif` utility in `src/app.css`**

In the `@theme inline { ... }` block added in Task 2, add one line (after `--font-sans: var(--font-sans);`):

```css
	--font-sans: var(--font-sans);
	--font-serif: var(--font-serif);
```

Then add the `.accent-serif` utility right after the `.brand b { ... }` rule:

```css
.brand b {
	color: var(--accent-500);
	font-weight: var(--weight-bold);
}

.accent-serif {
	font-family: var(--font-serif);
	font-style: italic;
}
```

- [ ] **Step 5: Verify**

Run: `npm run build` — expect success.

Run: `npm run dev`, confirm body/heading text now renders in Inter instead of Hanken Grotesk (visibly different letterforms, e.g. tighter "g" and "a").

- [ ] **Step 6: Commit**

```bash
git add src/lib/styles/fonts.css src/lib/styles/typography.css src/app.html src/app.css
git commit -m "feat: replace Hanken Grotesk with Inter + Instrument Serif"
```

---

### Task 7: Add the `.liquid-glass` utility class

**Files:**
- Modify: `src/app.css`

**Interfaces:**
- Consumes: nothing new.
- Produces: `.liquid-glass` / `.liquid-glass::before`, applied by Tasks 8 and 10–13.

- [ ] **Step 1: Append the utility, verbatim, to the end of `src/app.css`**

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
	background: linear-gradient(
		180deg,
		rgba(255, 255, 255, 0.45) 0%,
		rgba(255, 255, 255, 0.15) 20%,
		rgba(255, 255, 255, 0) 40%,
		rgba(255, 255, 255, 0) 60%,
		rgba(255, 255, 255, 0.15) 80%,
		rgba(255, 255, 255, 0.45) 100%
	);
	-webkit-mask:
		linear-gradient(#fff 0 0) content-box,
		linear-gradient(#fff 0 0);
	-webkit-mask-composite: xor;
	mask-composite: exclude;
	pointer-events: none;
}
```

Placing this at the end of `app.css` means it comes after `.btn`/`.btn-primary`/`.btn-secondary`/`.btn-ghost` in source order — necessary for Task 8, where `.liquid-glass` is applied alongside those classes on the same global-specificity elements and must win the tie.

- [ ] **Step 2: Verify**

Run: `npm run build`, then confirm the class made it into the output (PowerShell):

```powershell
Get-ChildItem -Recurse dist/_app/immutable/assets -Filter *.css | Select-String "liquid-glass"
```

Expected: at least one match. No visual change yet — no markup references `.liquid-glass` until Task 8.

- [ ] **Step 3: Commit**

```bash
git add src/app.css
git commit -m "feat: add .liquid-glass utility"
```

---

### Task 8: Apply liquid-glass to Nav

**Files:**
- Modify: `src/lib/components/Nav.svelte`

**Interfaces:**
- Consumes: `.liquid-glass` from Task 7; `Button` from Task 3.
- Produces: nothing new for later tasks.

- [ ] **Step 1: Reduce the `.nav`/`.nav.scrolled`/`.nav.guide` scoped rules**

Per the Global Constraints CSS-specificity rule, `.liquid-glass` (equal specificity, later in `app.css`) cannot out-rank these already-equal-specificity scoped rules by source order alone since they live in different files — so the conflicting `border-bottom`/`background` declarations are removed directly instead. Replace:

```css
	.nav {
		position: sticky;
		top: 0;
		z-index: 50;
		border-bottom: 1px solid transparent;
		background: color-mix(in srgb, var(--bg) 72%, transparent);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		transition:
			border-color var(--dur-base),
			background var(--dur-base);
	}
	.nav.scrolled {
		border-bottom-color: var(--border-700);
		background: color-mix(in srgb, var(--bg) 86%, transparent);
	}
	.nav.guide {
		border-bottom-color: var(--border-700);
		background: color-mix(in srgb, var(--bg) 86%, transparent);
	}
```

with:

```css
	.nav {
		position: sticky;
		top: 0;
		z-index: 50;
		background: color-mix(in srgb, var(--bg) 72%, transparent);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		transition: background var(--dur-base);
	}
```

(the unscrolled/non-guide state keeps its own translucent background so the nav isn't invisible before `.liquid-glass` is applied; `.liquid-glass` supplies the hairline border and inset sheen once scrolled or in guide mode.)

- [ ] **Step 2: Apply `.liquid-glass` to the sticky bar when scrolled or in guide mode**

Replace:

```svelte
<header class="nav" class:scrolled class:guide={variant === 'guide'}>
```

with:

```svelte
<header class="nav" class:scrolled class:guide={variant === 'guide'} class:liquid-glass={scrolled || variant === 'guide'}>
```

- [ ] **Step 3: Apply `.liquid-glass` to the two landing-variant `Button`s**

Replace:

```svelte
				<Button variant="ghost" size="sm" href={repo} target="_blank" rel="noopener">
					<Icon name="github" size={15} />
					GitHub
				</Button>
				<Button size="sm" href="#download">Get started</Button>
```

with:

```svelte
				<Button variant="ghost" size="sm" href={repo} target="_blank" rel="noopener" class="liquid-glass">
					<Icon name="github" size={15} />
					GitHub
				</Button>
				<Button size="sm" href="#download" class="liquid-glass">Get started</Button>
```

(`.btn`/`.btn-primary`/`.btn-ghost` are global rules in `app.css`, and `.liquid-glass` is appended after them in the same file — so here the source-order tiebreak from Task 7 is exactly what makes this work. This does replace the primary button's solid accent-yellow fill with the liquid-glass near-transparent surface, matching the spec's explicit instruction to apply it to "the GitHub ghost button and primary CTA button" in Nav.)

- [ ] **Step 4: Verify**

Run: `npm run dev`, scroll the landing page past 8px, confirm the nav bar gains a hairline gradient border and subtle inset sheen; confirm both nav buttons show the glass surface instead of solid fills.

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/Nav.svelte
git commit -m "feat: apply liquid-glass to Nav"
```

---

### Task 9: Restyle Hero

**Files:**
- Modify: `src/lib/components/Hero.svelte`

**Interfaces:**
- Consumes: `fadeUp` from Task 4; `motion` from `@humanspeak/svelte-motion`.
- Produces: nothing new for later tasks.

- [ ] **Step 1: Swap the `reveal` import for `motion`/`fadeUp`**

Replace:

```svelte
	import Icon from '$lib/icons/Icon.svelte';
	import { reveal } from '$lib/actions/reveal.js';
	import { base } from '$app/paths';
```

with:

```svelte
	import Icon from '$lib/icons/Icon.svelte';
	import { motion } from '@humanspeak/svelte-motion';
	import { fadeUp } from '$lib/motion.js';
	import { base } from '$app/paths';
```

- [ ] **Step 2: Swap `.hero-inner` to `motion.div` (no other actions on it, safe to swap directly)**

Replace:

```svelte
	<div class="wrap hero-inner">
		<h1>All the power of ComfyUI.<br /><span class="hl">None of the node graph.</span></h1>
		<p class="sub">
			Make images. Not node graphs.
		</p>
		<div class="hero-cta">
			<a class="btn btn-primary" href="#download">
				<Icon name="download" />
				Get started
			</a>
			<a class="btn btn-secondary" href="#modes">
				<Icon name="browser" />
				Try the browser build
			</a>
		</div>
	</div>
```

with:

```svelte
	<motion.div class="wrap hero-inner" {...fadeUp(0)}>
		<h1>All the power of ComfyUI.<br /><span class="hl">None of the node graph.</span></h1>
		<p class="sub">
			Make images. Not node graphs.
		</p>
		<div class="hero-cta">
			<a class="btn btn-primary" href="#download">
				<Icon name="download" />
				Get started
			</a>
			<a class="btn btn-secondary" href="#modes">
				<Icon name="browser" />
				Try the browser build
			</a>
		</div>
	</motion.div>
```

- [ ] **Step 3: Wrap `.showcase` in an outer `motion.div` (it has `use:tilt` + `bind:this`, so it's wrapped, not swapped)**

Replace:

```svelte
	<div class="wrap showcase" bind:this={showcase} use:tilt use:reveal>
		<div class="window" bind:this={win}>
```

with:

```svelte
	<motion.div {...fadeUp(0.2)}>
		<div class="wrap showcase" bind:this={showcase} use:tilt>
			<div class="window" bind:this={win}>
```

And update the closing tags at the end of the section — replace:

```svelte
			<div class="window-sheen" aria-hidden="true"></div>
		</div>
	</div>
</section>
```

with:

```svelte
			<div class="window-sheen" aria-hidden="true"></div>
		</div>
		</div>
	</motion.div>
</section>
```

(the outer `motion.div` carries no class of its own — it exists only to run the fade-up animation, so `.showcase`/`.window`'s own CSS needs no changes at all.)

- [ ] **Step 4: `.hero-inner` lost its scoping hash — rewrite its rule as `:global(...)`**

Replace:

```css
	.hero-inner {
		position: relative;
		z-index: 1;
		text-align: center;
		max-width: 820px;
		margin: 0 auto;
	}
```

with:

```css
	:global(.hero-inner) {
		position: relative;
		z-index: 1;
		text-align: center;
		max-width: 820px;
		margin: 0 auto;
	}
```

- [ ] **Step 5: Give `.hl` its serif-italic accent treatment**

Replace:

```css
	.hero h1 :global(.hl) {
		color: var(--accent-500);
	}
```

with:

```css
	.hero h1 :global(.hl) {
		color: var(--accent-500);
		font-family: var(--font-serif);
		font-style: italic;
	}
```

- [ ] **Step 6: Verify**

Run: `npm run check` — expect 0 errors.

Run: `npm run dev`, reload the landing page: confirm the headline block and app-window showcase fade up on load (headline first, showcase ~0.2s later), the cursor-tilt/sheen interaction on the app window still works exactly as before, and "None of the node graph." now renders in italic serif in the accent color.

- [ ] **Step 7: Commit**

```bash
git add src/lib/components/Hero.svelte
git commit -m "feat: restyle Hero with fade-up motion and serif accent"
```

---

### Task 10: Restyle Features

**Files:**
- Modify: `src/lib/components/Features.svelte`

**Interfaces:**
- Consumes: `fadeUp` from Task 4; `.accent-serif` from Task 6; `.liquid-glass` from Task 7.
- Produces: nothing new for later tasks.

- [ ] **Step 1: Swap the `reveal` import for `motion`/`fadeUp`**

Replace:

```svelte
	import Icon from '$lib/icons/Icon.svelte';
	import { reveal } from '$lib/actions/reveal.js';
```

with:

```svelte
	import Icon from '$lib/icons/Icon.svelte';
	import { motion } from '@humanspeak/svelte-motion';
	import { fadeUp } from '$lib/motion.js';
```

- [ ] **Step 2: Swap `.sec-head` and each `.feature` card to `motion.div`, add the accent span, stagger cards by index**

Replace:

```svelte
<section class="block" id="features">
	<div class="wrap">
		<div class="sec-head" use:reveal>
			<span class="eyebrow muted">What's inside</span>
			<h2>Everything you generate, none of the graph-wrangling</h2>
			<p>MooshieUI keeps ComfyUI's power and hides its complexity behind controls that make sense.</p>
		</div>
		<div class="features">
			{#each features as f}
				<div class="feature" use:reveal>
					<div class="ficon"><Icon name={f.icon} /></div>
					<h3>{f.title}</h3>
					<p>{f.body}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
```

with:

```svelte
<section class="block" id="features">
	<div class="wrap">
		<motion.div class="sec-head" {...fadeUp(0)}>
			<span class="eyebrow muted">What's inside</span>
			<h2>Everything you generate, none of the <span class="accent-serif">graph-wrangling</span></h2>
			<p>MooshieUI keeps ComfyUI's power and hides its complexity behind controls that make sense.</p>
		</motion.div>
		<div class="features">
			{#each features as f, i}
				<motion.div class="feature" {...fadeUp(i * 0.1)}>
					<div class="ficon"><Icon name={f.icon} /></div>
					<h3>{f.title}</h3>
					<p>{f.body}</p>
				</motion.div>
			{/each}
		</div>
	</div>
</section>
```

- [ ] **Step 3: Rewrite `.sec-head` as `:global(...)`; strip `.feature`'s surface properties for liquid-glass**

Replace:

```css
	.sec-head {
		max-width: 640px;
		margin: 0 auto 48px;
		text-align: center;
	}
```

with:

```css
	:global(.sec-head) {
		max-width: 640px;
		margin: 0 auto 48px;
		text-align: center;
	}
```

(`.sec-head h2`/`.sec-head p` below need no change — `h2`/`p` are still native tags written directly in this component, and Svelte only hash-scopes the rightmost compound selector.)

Replace:

```css
	.feature {
		background: var(--surface-900);
		border: 1px solid var(--border-700);
		border-radius: var(--radius-lg);
		padding: 22px;
		transition:
			border-color var(--dur-base),
			transform var(--dur-base),
			background var(--dur-base);
	}
	.feature:hover {
		border-color: color-mix(in srgb, var(--accent-500) 40%, var(--border-700));
		transform: translateY(-2px);
	}
```

with:

```css
	:global(.feature) {
		border-radius: 24px;
		padding: 22px;
		transition: transform var(--dur-base);
	}
	:global(.feature:hover) {
		transform: translateY(-2px);
	}
```

(`border-radius: 24px` is intentional and literal — see the Global Constraints note on card corner-radius. `.ficon`/`.feature h3`/`.feature p` need no change: `.ficon` is a plain native `<div>` still written directly in this template, and the other two are descendant selectors whose rightmost part is native.)

- [ ] **Step 4: Add `.liquid-glass` to the card markup**

Replace:

```svelte
				<motion.div class="feature" {...fadeUp(i * 0.1)}>
```

with:

```svelte
				<motion.div class="feature liquid-glass" {...fadeUp(i * 0.1)}>
```

- [ ] **Step 5: Verify**

Run: `npm run dev`, scroll to the Features section: confirm the 6 cards fade up staggered left-to-right/top-to-bottom, each shows the glass surface (hairline gradient border, subtle sheen) instead of the flat `--surface-900` fill, and the heading reads "...none of the *graph-wrangling*" in italic serif.

- [ ] **Step 6: Commit**

```bash
git add src/lib/components/Features.svelte
git commit -m "feat: restyle Features with liquid-glass cards and fade-up motion"
```

---

### Task 11: Restyle Modes

**Files:**
- Create: `src/lib/types.ts`
- Modify: `src/lib/components/Modes.svelte`

**Interfaces:**
- Consumes: `fadeUp` from Task 4; `.accent-serif` from Task 6; `.liquid-glass` from Task 7.
- Produces: `Release` type (`{ tag: string; winUrl: string; appimageUrl: string; debUrl: string }`), matching the exact shape `buildRelease()` in `src/lib/release.js` always returns. Reused by Task 13 (Download) and Task 14 (Footer).

- [ ] **Step 1: Create the shared `Release` type**

Create `src/lib/types.ts`:

```ts
export type Release = {
	tag: string;
	winUrl: string;
	appimageUrl: string;
	debUrl: string;
};
```

- [ ] **Step 2: Convert the script block to `lang="ts"`, swap `reveal` for `motion`/`fadeUp`**

Replace:

```svelte
<script>
	import Icon from '$lib/icons/Icon.svelte';
	import { reveal } from '$lib/actions/reveal.js';
	import { base } from '$app/paths';

	const repo = 'https://github.com/Mooshieblob1/MooshieUI';

	let { release = null } = $props();
	const winUrl = $derived(release?.winUrl ?? `${repo}/releases`);
	const linuxUrl = $derived(release?.appimageUrl ?? `${repo}/releases`);
```

with:

```svelte
<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';
	import { motion } from '@humanspeak/svelte-motion';
	import { fadeUp } from '$lib/motion.js';
	import { base } from '$app/paths';
	import type { Release } from '$lib/types';

	const repo = 'https://github.com/Mooshieblob1/MooshieUI';

	let { release = null }: { release?: Release | null } = $props();
	const winUrl = $derived(release?.winUrl ?? `${repo}/releases`);
	const linuxUrl = $derived(release?.appimageUrl ?? `${repo}/releases`);
```

- [ ] **Step 3: Swap `.sec-head` and both `.mode` cards to `motion.div`, add the accent span and `.liquid-glass`**

Replace:

```svelte
		<div class="sec-head" use:reveal>
			<span class="eyebrow muted">Two ways to run</span>
			<h2>Same interface, desktop or browser</h2>
			<p>
				MooshieUI ships as a native desktop app and a self-hostable web server. Pick whichever fits
				your setup. The UI is identical.
			</p>
		</div>
		<div class="modes">
			<div class="mode desktop" use:reveal>
```

with:

```svelte
		<motion.div class="sec-head" {...fadeUp(0)}>
			<span class="eyebrow muted">Two ways to run</span>
			<h2>Same interface, <span class="accent-serif">desktop</span> or browser</h2>
			<p>
				MooshieUI ships as a native desktop app and a self-hostable web server. Pick whichever fits
				your setup. The UI is identical.
			</p>
		</motion.div>
		<div class="modes">
			<motion.div class="mode desktop liquid-glass" {...fadeUp(0.1)}>
```

Replace:

```svelte
				</div>
				<div class="mode browser" use:reveal>
```

with:

```svelte
				</motion.div>
				<motion.div class="mode browser liquid-glass" {...fadeUp(0.2)}>
```

Replace the closing markup:

```svelte
				</div>
			</div>
		</div>
	</div>
</section>
```

with:

```svelte
				</div>
			</motion.div>
		</div>
	</div>
</section>
```

(there are two `.mode-downloads` closing `</div>` tags followed by each mode card's own closing tag — only the card-level closing tags change from `</div>` to `</motion.div>`; the inner `.mode-downloads`, `ul`, etc. stay native `</div>`/`</ul>` as authored.)

- [ ] **Step 4: Rewrite `.sec-head` and `.mode` as `:global(...)`, strip surface properties**

Replace:

```css
	.sec-head {
		max-width: 640px;
		margin: 0 auto 48px;
		text-align: center;
	}
```

with:

```css
	:global(.sec-head) {
		max-width: 640px;
		margin: 0 auto 48px;
		text-align: center;
	}
```

Replace:

```css
	.mode {
		position: relative;
		background: var(--surface-900);
		border: 1px solid var(--border-700);
		border-radius: var(--radius-xl);
		padding: 30px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}
```

with:

```css
	:global(.mode) {
		border-radius: 24px;
		padding: 30px;
		display: flex;
		flex-direction: column;
	}
```

(`position`/`overflow` are dropped — `.liquid-glass` already supplies `position: relative` and `overflow: hidden`. `border-radius: 24px` is literal — see the Global Constraints note. `.mode .tag`, `.mode.desktop .tag`, `.mode.browser .tag`, `.mode h3`, `.mode p`, `.mode ul`, `.mode li`, and the `:global(svg)` icon-color rules all need no change: every one of them is either a plain native element still written directly in this template, or a descendant selector whose rightmost part is.)

- [ ] **Step 5: Verify**

Run: `npm run check` — expect 0 errors.

Run: `npm run dev`, scroll to the "Two ways to run" section: confirm both mode cards fade up staggered, show the glass surface, and the heading reads "Same interface, *desktop* or browser" in italic serif for "desktop" only.

- [ ] **Step 6: Commit**

```bash
git add src/lib/types.ts src/lib/components/Modes.svelte
git commit -m "feat: restyle Modes with liquid-glass cards, fade-up motion, and Release type"
```

---

### Task 12: Restyle CloserLook

**Files:**
- Modify: `src/lib/components/CloserLook.svelte`

**Interfaces:**
- Consumes: `fadeUp` from Task 4; `.accent-serif` from Task 6; `.liquid-glass` from Task 7.
- Produces: nothing new for later tasks.

- [ ] **Step 1: Swap the `reveal` import for `motion`/`fadeUp`**

Replace:

```svelte
<script>
	import { reveal } from '$lib/actions/reveal.js';

	const steps = [
```

with:

```svelte
<script>
	import { motion } from '@humanspeak/svelte-motion';
	import { fadeUp } from '$lib/motion.js';

	const steps = [
```

- [ ] **Step 2: Swap `.closer-media` and the classless text-column wrapper to `motion.div`, add the accent span and `.liquid-glass`**

Replace:

```svelte
		<!-- on-brand CSS mock of the generate panel -->
		<div class="closer-media" use:reveal>
```

with:

```svelte
		<!-- on-brand CSS mock of the generate panel -->
		<motion.div class="closer-media liquid-glass" {...fadeUp(0)}>
```

Replace:

```svelte
		</div>
		<div use:reveal>
			<span class="eyebrow">From prompt to polished</span>
			<h2>Three steps to a finished image</h2>
```

with:

```svelte
		</motion.div>
		<motion.div {...fadeUp(0.15)}>
			<span class="eyebrow">From prompt to polished</span>
			<h2>Three steps to a <span class="accent-serif">finished</span> image</h2>
```

Replace the closing markup:

```svelte
				</li>
			{/each}
			</ol>
		</div>
	</div>
</section>
```

with:

```svelte
				</li>
			{/each}
			</ol>
		</motion.div>
	</div>
</section>
```

(the second wrapper was originally classless, so no CSS rule targets it at all — no `:global()` needed. `.closer h2` still matches the `<h2>` regardless of the wrapper swap, since CSS descendant combinators don't care about intervening non-matching elements.)

- [ ] **Step 3: Rewrite `.closer-media` as `:global(...)`, strip surface properties**

Replace:

```css
	.closer-media {
		border: 1px solid var(--border-700);
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: var(--surface-900);
		box-shadow: var(--shadow-panel);
		padding: 22px;
	}
```

with:

```css
	:global(.closer-media) {
		border-radius: var(--radius-lg);
		padding: 22px;
	}
```

(`.closer-media` was never part of the `body.round-soft .feature, .mode, .dl-card` 24px override, so it correctly keeps `var(--radius-lg)`, not a literal `24px`.)

- [ ] **Step 4: Verify**

Run: `npm run dev`, scroll to "A closer look": confirm the mock panel and the text column both fade up (panel first, text ~0.15s later), the panel shows the glass surface, and the heading reads "Three steps to a *finished* image" in italic serif for "finished" only.

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/CloserLook.svelte
git commit -m "feat: restyle CloserLook with liquid-glass panel and fade-up motion"
```

---

### Task 13: Restyle Download

**Files:**
- Modify: `src/lib/components/Download.svelte`

**Interfaces:**
- Consumes: `fadeUp` from Task 4; `.accent-serif` from Task 6; `.liquid-glass` from Task 7; `Release` type from Task 11.
- Produces: nothing new for later tasks.

- [ ] **Step 1: Convert the script block to `lang="ts"`, swap `reveal` for `motion`/`fadeUp`**

Replace:

```svelte
<script>
	import Icon from '$lib/icons/Icon.svelte';
	import { reveal } from '$lib/actions/reveal.js';
	import { base } from '$app/paths';

	const repo = 'https://github.com/Mooshieblob1/MooshieUI';

	let { release = null } = $props();
	const tag = $derived(release?.tag ?? 'v1.4.19');
	const winUrl = $derived(release?.winUrl ?? `${repo}/releases`);
	const appimageUrl = $derived(release?.appimageUrl ?? `${repo}/releases`);
	const debUrl = $derived(release?.debUrl ?? `${repo}/releases`);
</script>
```

with:

```svelte
<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';
	import { motion } from '@humanspeak/svelte-motion';
	import { fadeUp } from '$lib/motion.js';
	import { base } from '$app/paths';
	import type { Release } from '$lib/types';

	const repo = 'https://github.com/Mooshieblob1/MooshieUI';

	let { release = null }: { release?: Release | null } = $props();
	const tag = $derived(release?.tag ?? 'v1.4.19');
	const winUrl = $derived(release?.winUrl ?? `${repo}/releases`);
	const appimageUrl = $derived(release?.appimageUrl ?? `${repo}/releases`);
	const debUrl = $derived(release?.debUrl ?? `${repo}/releases`);
</script>
```

- [ ] **Step 2: Swap `.sec-head` and all three `.dl-card`s to `motion.div`, add the accent span and `.liquid-glass`**

Replace:

```svelte
		<div class="sec-head" use:reveal>
			<span class="eyebrow">Get MooshieUI</span>
			<h2>Get started in minutes</h2>
			<p>
```

with:

```svelte
		<motion.div class="sec-head" {...fadeUp(0)}>
			<span class="eyebrow">Get MooshieUI</span>
			<h2>Get started in <span class="accent-serif">minutes</span></h2>
			<p>
```

Replace:

```svelte
			</p>
		</div>
		<div class="dl-grid">
			<div class="dl-card" use:reveal>
```

with:

```svelte
			</p>
		</motion.div>
		<div class="dl-grid">
			<motion.div class="dl-card liquid-glass" {...fadeUp(0)}>
```

Replace the Windows card's closing tag and the Linux card's opening tag:

```svelte
					Download .exe
				</a>
			</div>

			<div class="dl-card" use:reveal>
```

with:

```svelte
					Download .exe
				</a>
			</motion.div>

			<motion.div class="dl-card liquid-glass" {...fadeUp(0.1)}>
```

Replace the Linux card's closing tag and the macOS/Docker card's opening tag:

```svelte
				</div>
			</div>

			<div class="dl-card" use:reveal>
```

with:

```svelte
				</div>
			</motion.div>

			<motion.div class="dl-card liquid-glass" {...fadeUp(0.2)}>
```

Replace the final card's closing tag:

```svelte
				</div>
			</div>
		</div>
	</div>
</section>
```

with:

```svelte
				</div>
			</motion.div>
		</div>
	</div>
</section>
```

- [ ] **Step 3: Rewrite `.sec-head` and `.dl-card` as `:global(...)`, strip surface properties**

Replace:

```css
	.sec-head {
		max-width: 640px;
		margin: 0 auto 48px;
		text-align: center;
	}
```

with:

```css
	:global(.sec-head) {
		max-width: 640px;
		margin: 0 auto 48px;
		text-align: center;
	}
```

Replace:

```css
	.dl-card {
		background: var(--surface-900);
		border: 1px solid var(--border-700);
		border-radius: var(--radius-lg);
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 14px;
		transition:
			border-color var(--dur-base),
			transform var(--dur-base);
	}
	.dl-card:hover {
		border-color: color-mix(in srgb, var(--accent-500) 40%, var(--border-700));
		transform: translateY(-2px);
	}
```

with:

```css
	:global(.dl-card) {
		border-radius: 24px;
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 14px;
		transition: transform var(--dur-base);
	}
	:global(.dl-card:hover) {
		transform: translateY(-2px);
	}
```

(`border-radius: 24px` is literal, matching Task 10/11 — see the Global Constraints note. `.dl-os`, `.dl-note`, `.dl-card .btn`, `.btn-row` all need no change — each is either its own standalone class still written directly in this template, or a descendant selector whose rightmost part is.)

- [ ] **Step 4: Verify**

Run: `npm run check` — expect 0 errors.

Run: `npm run dev`, scroll to "Get MooshieUI": confirm all three cards fade up staggered left-to-right, each shows the glass surface, and the heading reads "Get started in *minutes*" in italic serif for "minutes" only.

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/Download.svelte
git commit -m "feat: restyle Download with liquid-glass cards, fade-up motion, and Release type"
```

---

### Task 14: Restyle Footer

**Files:**
- Modify: `src/lib/components/Footer.svelte`

**Interfaces:**
- Consumes: `fadeUp` from Task 4; `Release` type from Task 11.
- Produces: nothing new for later tasks.

Footer has no card surfaces to convert and no serif-italic accent (plain styling is appropriate for a footer, per the spec) — this is a lighter touch than Tasks 9–13: just the fade-up motion, plus adopting `lang="ts"` for its identical `release` prop pattern since the file is already being touched.

- [ ] **Step 1: Convert the script block to `lang="ts"`, add the motion imports**

Replace:

```svelte
<script>
	import { base } from '$app/paths';
	const repo = 'https://github.com/Mooshieblob1/MooshieUI';

	let { release = null } = $props();
	const version = $derived(release?.tag ?? 'v1.4.19');
</script>
```

with:

```svelte
<script lang="ts">
	import { base } from '$app/paths';
	import { motion } from '@humanspeak/svelte-motion';
	import { fadeUp } from '$lib/motion.js';
	import type { Release } from '$lib/types';

	const repo = 'https://github.com/Mooshieblob1/MooshieUI';

	let { release = null }: { release?: Release | null } = $props();
	const version = $derived(release?.tag ?? 'v1.4.19');
</script>
```

- [ ] **Step 2: Swap `.foot-brand` and `.foot-cols` to `motion.div`**

Replace:

```svelte
			<div class="foot-brand">
				<a class="brand" href="{base}/">
					<img src="{base}/assets/logo.png" alt="" />
					<span class="word">Mooshie<b>UI</b></span>
				</a>
				<p>
					A beginner-friendly interface for ComfyUI. Generate without hand-editing graphs, on your
					desktop or in any browser.
				</p>
			</div>
			<div class="foot-cols">
```

with:

```svelte
			<motion.div class="foot-brand" {...fadeUp(0)}>
				<a class="brand" href="{base}/">
					<img src="{base}/assets/logo.png" alt="" />
					<span class="word">Mooshie<b>UI</b></span>
				</a>
				<p>
					A beginner-friendly interface for ComfyUI. Generate without hand-editing graphs, on your
					desktop or in any browser.
				</p>
			</motion.div>
			<motion.div class="foot-cols" {...fadeUp(0.1)}>
```

Replace the closing markup:

```svelte
					</div>
				</div>
			</div>
			<div class="foot-bottom">
```

with:

```svelte
					</div>
				</div>
			</motion.div>
		</div>
		<div class="foot-bottom">
```

(note the `.foot-top` wrapping `<div>` itself is untouched — only its two children, `.foot-brand` and `.foot-cols`, are swapped.)

- [ ] **Step 3: Rewrite `.foot-brand` and `.foot-cols` as `:global(...)`**

Replace:

```css
	.foot-brand {
		max-width: 300px;
	}
```

with:

```css
	:global(.foot-brand) {
		max-width: 300px;
	}
```

Replace:

```css
	.foot-cols {
		display: flex;
		gap: 56px;
		flex-wrap: wrap;
	}
```

with:

```css
	:global(.foot-cols) {
		display: flex;
		gap: 56px;
		flex-wrap: wrap;
	}
```

(`.foot-brand .brand`/`.foot-brand p` and `.foot-col h5`/`.foot-col a`/`.foot-col a:hover` need no change: `.foot-col` itself was never swapped — only its parent `.foot-cols` was — so its descendant rules are unaffected regardless of the "rightmost compound" rule.)

- [ ] **Step 4: Verify**

Run: `npm run check` — expect 0 errors.

Run: `npm run dev`, scroll to the footer: confirm the brand block and the link columns fade up staggered, and everything else (link colors, bottom bar, version string) is unchanged.

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/Footer.svelte
git commit -m "feat: add fade-up motion to Footer"
```

---

### Task 15: Remove the `reveal` action and do final verification

**Files:**
- Delete: `src/lib/actions/reveal.js`
- Modify: `src/app.css`

**Interfaces:**
- Consumes: nothing new — this is a cleanup pass confirming Tasks 9–14 fully replaced every `use:reveal` call site.
- Produces: nothing for later tasks (final task in the plan).

- [ ] **Step 1: Confirm no call sites remain**

Run (PowerShell):

```powershell
Select-String -Path src/**/*.svelte -Pattern "use:reveal|actions/reveal"
```

Expected: no matches. If any remain, the corresponding component from Tasks 9–14 was not fully migrated — go back and finish it before continuing.

- [ ] **Step 2: Delete the action file**

```bash
git rm src/lib/actions/reveal.js
```

- [ ] **Step 3: Delete the now-dead `.reveal`/`.reveal.in` CSS from `src/app.css`**

Remove this block (it sits between the `.brand b { ... }` rule and the `.accent-serif` utility added in Task 6):

```css
/* ---- entrance reveal ----------------------------------------------------- */
@media (prefers-reduced-motion: no-preference) {
	.reveal {
		opacity: 0;
		transform: translateY(14px);
		transition:
			opacity 0.6s var(--ease-out),
			transform 0.6s var(--ease-out);
	}
	.reveal.in {
		opacity: 1;
		transform: none;
	}
}
```

- [ ] **Step 4: Full verification pass**

Run: `npm run check` — expect 0 errors.

Run: `npm run build` — expect success, no missing-module errors.

Run: `npm run dev` and manually walk the entire landing page top to bottom:
- Nav: glass effect on scroll, both buttons show glass surface.
- Hero: headline + showcase fade up on load, tilt/sheen interaction intact, "None of the node graph." in italic serif.
- Features: 6 cards fade up staggered, glass surfaces, "graph-wrangling" in italic serif.
- Modes: 2 cards fade up staggered, glass surfaces, "desktop" in italic serif.
- CloserLook: mock panel + text column fade up, panel glass surface, "finished" in italic serif.
- Download: 3 cards fade up staggered, glass surfaces, "minutes" in italic serif.
- Footer: brand block + link columns fade up.
- Confirm `prefers-reduced-motion: reduce` still disables transitions site-wide (unrelated `base.css` media query, untouched by this plan — spot-check via browser devtools' "Emulate CSS media feature" panel).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove reveal action, superseded by fadeUp motion"
```

---

## Self-Review

**Spec coverage:** Palette lock-in (Task 5), Tailwind/TypeScript/shadcn-svelte/motion migration (Tasks 1–4), typography (Task 6), liquid-glass utility + component application (Tasks 7–13), fade-up animation replacing `use:reveal` everywhere it appeared (Tasks 9–14, deleted in Task 15), single-word serif accents in Features/Modes/CloserLook/Download (Tasks 10–13), Footer's lighter touch with no serif accent (Task 14), static-imagery-only / no video (never introduced), no monochrome (palette values in Task 5 are the honey/charcoal originals, not black/white). All covered.

**Placeholder scan:** every step above shows complete before/after code, exact file paths, and exact commands — no "TBD"/"add appropriate handling"/"similar to Task N" language.

**Type/signature consistency:** `fadeUp(delay = 0)` has one definition (Task 4) and is called identically (`{...fadeUp(n)}`) in Tasks 9–14. `cn(...inputs: ClassValue[])` (Task 3) is Button's only consumer. `Button`'s props (`variant`, `size`, `href`, `class`) are used consistently in Tasks 3 and 8 — no other component consumes `Button`. `Release` (`{ tag, winUrl, appimageUrl, debUrl }`, all required strings, matching `buildRelease()`'s actual return shape in `src/lib/release.js`) is defined once in Task 11 and imported identically in Tasks 13 and 14.
