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
 .modes-section { border-block: 1px solid var(--border-700); }
 .modes-heading { max-width: 780px; margin-bottom: 32px; }
 .modes-heading .section-intro { margin-top: 20px; }
 .modes { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
 .mode { min-width: 0; display: flex; flex-direction: column; background: var(--surface-900); border: 1px solid var(--border-700); border-radius: var(--app-shell-radius); padding: 28px; }
 .tag { font-size: .875rem; font-weight: 600; color: var(--accent-500); padding-bottom: 16px; border-bottom: 1px solid var(--border-700); }
 h3 { margin: 20px 0 16px; font-size: 1.75rem; font-weight: 650; letter-spacing: -.02em; line-height: 1.2; }
 .mode p { font-size: 1rem; color: var(--text-muted); line-height: 1.65; margin: 0; }
 ul { list-style: none; padding: 0; margin: 24px 0; display: grid; gap: 12px; }
 li { display: flex; align-items: flex-start; gap: 10px; font-size: 1rem; line-height: 1.5; }
 li :global(svg) { flex-shrink: 0; color: var(--accent-500); margin-top: 4px; }
 .mode-downloads { margin-top: auto; padding-top: 20px; border-top: 1px solid var(--border-700); display: flex; flex-wrap: wrap; gap: 8px; }
 .dl-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 10px 14px; background: var(--surface-800); border: 1px solid var(--border-700); border-radius: var(--radius-md); color: var(--text); font-size: .875rem; font-weight: 500; }
 .dl-btn:hover { color: var(--accent-500); background: var(--neutral-800); border-color: var(--neutral-700); }
 .dl-ghost { color: var(--text-muted); }
 @media(max-width: 800px) { .modes { grid-template-columns: 1fr; } .mode { padding: 24px; } }
</style>
