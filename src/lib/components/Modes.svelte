<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';
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

<section class="block" id="modes">
	<div class="wrap">
		<div class="sec-head">
			<span class="eyebrow muted">Two ways to run</span>
			<h2>Same interface, <span class="accent-serif">desktop</span> or browser</h2>
			<p>
				MooshieUI ships as a native desktop app and a self-hostable web server. Pick whichever fits
				your setup. The UI is identical.
			</p>
		</div>
		<div class="modes">
			<div class="mode desktop">
				<div class="mode-heading"><span class="tag">Desktop app</span><Icon name="browser" size={25} /></div>
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
			<div class="mode browser">
				<div class="mode-heading"><span class="tag">Browser &amp; server</span><Icon name="server" size={25} /></div>
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
  .block { padding: 92px 0; background: var(--surface-950); border-block: 1px solid var(--border-700); }
  .modes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
  .mode { position: relative; border-radius: 8px; border: 1px solid var(--border-700); padding: 36px; display: flex; flex-direction: column; background: var(--bg); }
  .mode.desktop { border-top: 2px solid var(--accent-500); }
  .mode.browser { border-top: 2px solid #a6b990; }
  .mode-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    margin: -36px -36px 0;
    padding: 19px 28px;
    border-bottom: 1px solid var(--border-700);
    border-radius: 6px 6px 0 0;
    background: var(--surface-900);
    color: var(--accent-500);
  }
  .mode-heading::before {
    content: '';
    position: absolute;
    top: 27px;
    left: -5px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid currentColor;
    background: var(--surface-950);
  }
  .mode-heading::after {
    content: '';
    position: absolute;
    top: 27px;
    right: -5px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid currentColor;
    background: var(--surface-950);
  }
  .browser .mode-heading { color: #b9c9a5; }
  .tag { font-family: var(--font-mono); font-size: .75rem; text-transform: uppercase; letter-spacing: .1em; }
  h3 { margin: 25px 0 0; font-size: 2rem; line-height: 1.2; font-weight: 500; letter-spacing: -.035em; color: var(--text-strong); }
  .mode p { margin: 18px 0 0; font-size: 1rem; color: var(--text-muted); line-height: 1.7; }
  ul { margin: 28px 0 32px; padding: 24px 0 0; border-top: 1px solid var(--border-700); list-style: none; display: flex; flex-direction: column; gap: 13px; }
  li { display: flex; align-items: flex-start; gap: 10px; font-size: .9375rem; }
  li :global(svg) { flex-shrink: 0; margin-top: 5px; color: var(--accent-500); }
  .browser li :global(svg) { color: #b9c9a5; }
  .mode-downloads { margin-top: auto; display: flex; flex-wrap: wrap; gap: 10px; }
  .dl-btn { display: inline-flex; align-items: center; gap: 7px; min-height: 44px; padding: 10px 14px; border-radius: 5px; font-family: var(--font-mono); font-size: .875rem; font-weight: 500; border: 1px solid var(--border-700); transition: background .2s; }
  .dl-btn :global(svg) { flex-shrink: 0; }
  .dl-primary { background: var(--surface-800); color: var(--text); }
  .dl-primary:hover { background: var(--accent-500); color: var(--accent-foreground); }
  .dl-ghost { color: var(--text-muted); }
  .dl-ghost:hover { background: var(--surface-800); }
  @media (max-width: 800px) { .block { padding: 64px 0; } .modes { grid-template-columns: 1fr; } .mode { padding: 28px; } .mode-heading { margin: -28px -28px 0; padding-inline: 24px; } }
</style>
