<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { base } from '$app/paths';
	import type { Release } from '$lib/types';

	const repo = 'https://github.com/Mooshieblob1/MooshieUI';

	let { release = null }: { release?: Release | null } = $props();
	const winUrl = $derived(release?.winUrl ?? `${repo}/releases`);
	const linuxUrl = $derived(release?.appimageUrl ?? `${repo}/releases`);
	const macUrl = $derived(release?.macUrl ?? null);

	const desktopPoints = [
		'Native window, system tray, and file dialogs',
		'Tiny footprint thanks to the Rust backend',
		'Bundles ComfyUI with one-click setup'
	];
	const browserPoints = [
		'One server, many devices over your network',
		'Docker-ready for a clean, repeatable deploy',
		'Responsive UI that adapts down to phone screens'
	];
</script>

<section class="section modes-section" id="modes" aria-labelledby="modes-heading">
	<div class="wrap">
		<div class="modes-heading" use:reveal>
			<span class="eyebrow muted">Two ways to run</span>
			<h2 class="section-title" id="modes-heading">Same interface, <span class="accent-serif">desktop</span> or browser</h2>
			<p class="section-intro">
				MooshieUI ships as a native desktop app and a self-hostable web server. Pick whichever fits
				your setup. The UI is identical.
			</p>
		</div>
		<div class="modes">
			<div class="mode desktop" use:reveal>
				<span class="tag">Desktop app</span>
				<h3>Install &amp; launch</h3>
				<p>
					A native app built with Tauri and a Rust core. Fast to start, light on memory, no Electron
					bloat. Windows and Linux ship as ready-to-run builds.
					{#if macUrl}
						macOS has a native Apple Silicon installer with Apple Metal (MPS) acceleration.
					{:else}
						A native Apple Silicon macOS installer is planned for v2.3.1, pending validation.
					{/if}
				</p>
				<ul>
					{#each desktopPoints as point}
						<li><Icon name="check" size={15} stroke={2.5} />{point}</li>
					{/each}
				</ul>
				<div class="mode-downloads">
					<a class="dl-btn dl-primary" href={winUrl}>
						<Icon name="download" size={14} />Windows
					</a>
					<a class="dl-btn dl-primary" href={linuxUrl}>
						<Icon name="download" size={14} />Linux
					</a>
					<a class:dl-primary={!!macUrl} class:dl-ghost={!macUrl} class="dl-btn" href={macUrl ?? '#download-macos'}>
						<Icon name={macUrl ? 'download' : 'info'} size={14} />
						{macUrl ? 'macOS (Apple Silicon)' : 'macOS · coming soon'}
					</a>
				</div>
			</div>
			<div class="mode browser" use:reveal>
				<span class="tag">Browser &amp; server</span>
				<h3>Self-host &amp; share</h3>
				<p>
					Run the built-in web server and reach MooshieUI from any device on your LAN. Docker-friendly
					and mobile-aware. Perfect for a GPU box in the closet and a laptop on the couch.
				</p>
				<ul>
					{#each browserPoints as point}
						<li><Icon name="check" size={15} stroke={2.5} />{point}</li>
					{/each}
				</ul>
				<div class="mode-downloads">
					<a class="dl-btn dl-primary" href="{base}/docker">
						<Icon name="server" size={14} />Docker guide
					</a>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
 .modes-section { background: var(--surface-950); border-block: 1px solid var(--border-700); }
 .modes-heading { max-width: 780px; margin-bottom: 64px; }
 .modes-heading .section-intro { margin-top: 24px; }
 .modes { display: grid; grid-template-columns: 1fr 1fr; gap: 72px; }
 .mode { min-width: 0; display: flex; flex-direction: column; border-top: 1px solid var(--border-700); padding-top: 28px; }
 .tag { font-family: var(--font-mono); font-size: .8125rem; color: var(--accent-400); }
 h3 { margin: 14px 0 20px; font-size: clamp(1.7rem, 3vw, 2.5rem); font-weight: 450; letter-spacing: -.04em; line-height: 1.2; }
 .mode p { font-size: 1rem; color: var(--text-muted); line-height: 1.7; margin: 0; }
 ul { list-style: none; padding: 0; margin: 26px 0 32px; display: grid; gap: 14px; }
 li { display: flex; align-items: flex-start; gap: 12px; font-size: 1rem; line-height: 1.5; }
 li :global(svg) { flex-shrink: 0; color: var(--accent-400); margin-top: 4px; }
 .mode-downloads { margin-top: auto; display: flex; flex-wrap: wrap; gap: 10px 22px; }
 .dl-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; color: var(--text); border-bottom: 1px solid var(--accent-500); font-size: .875rem; }
 .dl-btn:hover { color: var(--accent-400); }
 .dl-ghost { color: var(--text-muted); border-color: var(--border-700); }
 @media(max-width: 800px) { .modes { grid-template-columns: 1fr; gap: 44px; } .modes-heading { margin-bottom: 40px; } }
</style>
