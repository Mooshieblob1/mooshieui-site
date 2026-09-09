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
			<div class="foot-brand" >
				<a class="brand" href="{base}/">
					<img src="{base}/assets/logo.png" alt="" />
					<span class="word">Mooshie<b>UI</b></span>
				</a>
				<p>
					A beginner-friendly interface for ComfyUI. Generate without hand-editing graphs, on your
					desktop or in any browser.
				</p>
			</div>
			<div class="foot-cols" >
				<div class="foot-col">
					<h5>Product</h5>
					<a href="{base}/#features">Features</a>
					<a href="{base}/#modes">How it runs</a>
					<a href="{base}/#look">A closer look</a>
					<a href="{base}/#download">Download</a>
				</div>
				<div class="foot-col">
					<h5>Guides</h5>
					<a href="{base}/build">Build from source</a>
					<a href="{base}/docker">Docker guide</a>
					<a href={repo + '#readme'} target="_blank" rel="noopener">Documentation</a>
				</div>
				<div class="foot-col">
					<h5>Resources</h5>
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
 .site { padding: 64px 0 32px; }
 .foot-top { display: flex; justify-content: space-between; gap: 48px; padding-bottom: 56px; }
 .foot-brand { max-width: 340px; }
 .brand { display: inline-flex; align-items: center; gap: 12px; font-size: 1.5rem; font-weight: 600; letter-spacing: -.045em; }
 .brand img { width: 40px; height: 40px; }
 .foot-brand p { font-size: 1rem; line-height: 1.7; color: var(--text-muted); margin-top: 20px; }
 .foot-cols { display: flex; gap: 56px; }
 h5 { font-size: .8125rem; font-family: var(--font-mono); font-weight: 400; color: var(--text-muted); text-transform: uppercase; letter-spacing: .07em; margin: 0 0 18px; }
 .foot-col a { display: block; color: var(--text); font-size: .875rem; padding-block: 6px; }
 a:hover { color: var(--accent-400); }
 .foot-bottom { display: flex; justify-content: space-between; gap: 18px; flex-wrap: wrap; padding-top: 24px; border-top: 1px solid var(--border-700); color: var(--text-muted); font-size: .8125rem; line-height: 1.8; }
 .status { font-family: var(--font-mono); }
 @media(max-width: 1000px) { .foot-cols { gap: 30px; } }
 @media(max-width: 800px) { .foot-top { flex-direction: column; } .foot-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; } }
 @media(max-width: 420px) { .foot-cols { grid-template-columns: repeat(2, 1fr); row-gap: 32px; } }
</style>
