<script>
	import Icon from '$lib/icons/Icon.svelte';
	import { reveal } from '$lib/actions/reveal.js';

	const desktopPoints = [
		'Native window, system tray, and file dialogs',
		'Tiny footprint thanks to the Rust backend',
		'Point it at a local or remote ComfyUI'
	];
	const browserPoints = [
		'One server, many devices over your network',
		'Docker-ready for a clean, repeatable deploy',
		'Responsive UI that adapts down to phone screens'
	];
</script>

<section class="block" id="modes" style="padding-top: 24px;">
	<div class="wrap">
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
				<span class="tag">Desktop app</span>
				<h3>Install &amp; launch</h3>
				<p>
					A native app built with Tauri and a Rust core. Fast to start, light on memory, no Electron
					bloat. Windows and Linux ship as ready-to-run builds; macOS builds from source.
				</p>
				<ul>
					{#each desktopPoints as point}
						<li><Icon name="check" size={15} stroke={2.5} />{point}</li>
					{/each}
				</ul>
				<div class="mode-platforms">
					<span class="pchip">Windows</span>
					<span class="pchip">Linux</span>
					<span class="pchip">macOS (source)</span>
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
				<div class="mode-platforms">
					<span class="pchip">Web server</span>
					<span class="pchip">Docker</span>
					<span class="pchip">LAN / mobile</span>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.block {
		padding: 86px 0;
	}
	.sec-head {
		max-width: 640px;
		margin: 0 auto 48px;
		text-align: center;
	}
	.sec-head h2 {
		margin: 12px 0 0;
		font-size: clamp(26px, 3.4vw, 38px);
		font-weight: var(--weight-bold);
		letter-spacing: -0.025em;
		color: var(--text-strong);
		text-wrap: balance;
	}
	.sec-head p {
		margin: 14px auto 0;
		max-width: 520px;
		font-size: var(--text-base);
		color: var(--text-muted);
		line-height: var(--leading-snug);
		text-wrap: pretty;
	}
	.modes {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}
	@media (max-width: 800px) {
		.modes {
			grid-template-columns: 1fr;
		}
	}
	.mode {
		position: relative;
		background: var(--surface-900);
		border: 1px solid var(--border-700);
		border-radius: var(--radius-xl);
		padding: 30px;
		overflow: hidden;
	}
	.mode .tag {
		font-size: var(--text-10);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
	}
	.mode.desktop .tag {
		color: var(--accent-400);
	}
	.mode.browser .tag {
		color: var(--success-text);
	}
	.mode h3 {
		margin: 12px 0 0;
		font-size: var(--text-2xl);
		font-weight: var(--weight-bold);
		letter-spacing: -0.02em;
		color: var(--text-strong);
	}
	.mode p {
		margin: 12px 0 0;
		font-size: var(--text-sm);
		color: var(--text-muted);
		line-height: var(--leading-normal);
	}
	.mode ul {
		margin: 20px 0 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 11px;
	}
	.mode li {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		font-size: var(--text-sm);
		color: var(--text);
	}
	.mode li :global(svg) {
		flex-shrink: 0;
		margin-top: 1px;
	}
	.mode.desktop li :global(svg) {
		color: var(--accent-500);
	}
	.mode.browser li :global(svg) {
		color: var(--success);
	}
	.mode-platforms {
		margin-top: 22px;
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
	.pchip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 28px;
		padding: 0 11px;
		border-radius: var(--radius-sm);
		background: var(--surface-800);
		border: 1px solid var(--border-700);
		font-size: var(--text-xs);
		color: var(--text-muted);
	}
</style>
