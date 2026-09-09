<script lang="ts">
	import { base } from '$app/paths';
	import type { Release } from '$lib/types';
	import { FALLBACK_TAG } from '$lib/release.js';

	const repo = 'https://github.com/Mooshieblob1/MooshieUI';

	let { release = null }: { release?: Release | null } = $props();
	const version = $derived(release?.tag ?? FALLBACK_TAG);
</script>

<footer class="site">
	<div class="wrap">
		<div class="foot-top">
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
				<div class="foot-col">
					<h2>Product</h2>
					<a href="{base}/#features">Features</a>
					<a href="{base}/#modes">How it runs</a>
					<a href="{base}/#look">A closer look</a>
					<a href="{base}/#download">Download</a>
				</div>
				<div class="foot-col">
					<h2>Guides</h2>
					<a href="{base}/build">Build from source</a>
					<a href="{base}/docker">Docker guide</a>
					<a href={repo + '#readme'} target="_blank" rel="noopener">Documentation</a>
				</div>
				<div class="foot-col">
					<h2>Resources</h2>
					<a href={repo} target="_blank" rel="noopener">GitHub repo</a>
					<a href={repo + '/releases'} target="_blank" rel="noopener">Releases</a>
					<a href="https://github.com/comfyanonymous/ComfyUI" target="_blank" rel="noopener"
						>ComfyUI</a
					>
				</div>
			</div>
		</div>
		<div class="foot-bottom">
			<span class="meta">
				Open source · AGPL-3.0 · © 2026 MooshieUI · Created by
				<a href="https://mooshieblob.com" target="_blank" rel="noopener">Mooshieblob</a>
			</span>
			<span class="status">{version}</span>
		</div>
	</div>
</footer>

<style>
  .site { padding: 64px 0 28px; }
  .foot-top { display: flex; justify-content: space-between; gap: 48px; padding-bottom: 52px; border-bottom: 1px solid var(--border-700); }
  .foot-brand { max-width: 320px; }
  .brand { display: flex; align-items: center; gap: 12px; font-size: 1.5rem; letter-spacing: -.045em; font-weight: 600; }
  .brand img { width: 40px; height: 40px; }
  .foot-brand p { margin: 18px 0 0; font-size: 1rem; line-height: 1.65; color: var(--text-muted); }
  .foot-cols { display: flex; gap: 64px; }
  .foot-col h2 { margin: 0 0 18px; font-family: var(--font-mono); font-size: .75rem; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; color: var(--text-subtle); }
  .foot-col a { display: block; padding: 6px 0; font-size: .875rem; color: var(--text-muted); }
  .foot-col a:hover, .meta a:hover { color: var(--accent-500); }
  .foot-bottom { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; padding-top: 24px; }
  .meta { font-size: .8125rem; color: var(--text-subtle); }
  .meta a { color: var(--text-muted); }
  .status { padding-block: 3px; color: var(--text-muted); font: .75rem var(--font-mono); }
  @media (max-width: 1000px) { .foot-cols { gap: 32px; } }
  @media (max-width: 800px) { .foot-top { flex-direction: column; } .foot-cols { justify-content: space-between; gap: 24px; flex-wrap: wrap; } .foot-brand { max-width: 430px; } }
</style>
