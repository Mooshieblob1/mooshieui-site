<script>
	import Icon from '$lib/icons/Icon.svelte';
	import { reveal } from '$lib/actions/reveal.js';
	import { base } from '$app/paths';

	const repo = 'https://github.com/Mooshieblob1/MooshieUI';

	let { release = null } = $props();
	const tag = $derived(release?.tag ?? 'v1.4.18');
	const winUrl = $derived(release?.winUrl ?? `${repo}/releases`);
	const appimageUrl = $derived(release?.appimageUrl ?? `${repo}/releases`);
	const debUrl = $derived(release?.debUrl ?? `${repo}/releases`);
</script>

<section class="block download" id="download">
	<div class="wrap">
		<div class="sec-head" use:reveal>
			<span class="eyebrow">Get MooshieUI</span>
			<h2>Get started in minutes</h2>
			<p>
				Free and open source. Download the installer and run it. The setup wizard installs ComfyUI,
				Python, and PyTorch automatically on first launch.
			</p>
		</div>
		<div class="dl-grid">
			<div class="dl-card" use:reveal>
				<div class="dl-os">
					<span class="osicon">
						<!-- Windows logo -->
						<svg width="22" height="22" viewBox="0 0 88 88" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
							<path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 75.48.026 45.7zm4.326-39.025L87.314 0v41.527l-47.318.376zm47.329 39.349l-.016 41.344-47.318-6.678-.066-34.73z"/>
						</svg>
					</span>
					<div>
						<h3>Windows</h3>
						<p class="meta">Installer · x64 · {tag}</p>
					</div>
				</div>
				<p class="dl-note">
					One-click installer. The setup wizard installs ComfyUI, Python 3.11, and PyTorch on
					first launch. No manual configuration needed.
				</p>
				<a class="btn btn-primary" href={winUrl}>
					<Icon name="download" />
					Download .exe
				</a>
			</div>

			<div class="dl-card" use:reveal>
				<div class="dl-os">
					<span class="osicon">
						<!-- Linux/Tux logo -->
						<svg width="20" height="24" viewBox="0 0 48 56" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
							<path d="M24 0C15.8 0 10 5.6 10 13c0 3.6 1.2 7.2 3.4 10.2C11.2 25.4 9 28.8 9 33c0 3.4 1 6.4 2.8 8.8-1.6 1.2-3.6 2.8-5.2 5-2.4 3-3.6 6-3.6 8.8 0 .2 0 .4.2.4h41.6c.2 0 .2-.2.2-.4 0-2.8-1.2-5.8-3.6-8.8-1.6-2.2-3.6-3.8-5.2-5C37 39.4 38 36.4 38 33c0-4.2-2.2-7.6-4.4-9.8C35.8 20.2 37 16.6 37 13 37 5.6 31.2 0 24 0zm0 4c6.2 0 9 4.4 9 9s-3.4 9-9 9-9-4.4-9-9 2.8-9 9-9zm-5 10c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2zm6 0c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2zm-1 6c5 0 8 2.4 9.6 5.6C31 27.4 28 29 24 29s-7-1.6-9.6-3.4C16 22.4 19 20 23 20h.8-.8zm1 13c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4zM10 48h28c1 1.4 1.8 3 2.2 4.6H7.8c.4-1.6 1.2-3.2 2.2-4.6z"/>
						</svg>
					</span>
					<div>
						<h3>Linux</h3>
						<p class="meta">AppImage · .deb · {tag}</p>
					</div>
				</div>
				<p class="dl-note">
					AppImage runs anywhere without installation. The .deb integrates with apt on
					Ubuntu/Debian-based systems.
				</p>
				<div class="btn-row">
					<a class="btn btn-primary" href={appimageUrl}>
						<Icon name="download" />
						AppImage
					</a>
					<a class="btn btn-secondary" href={debUrl}>
						.deb
					</a>
				</div>
			</div>

			<div class="dl-card" use:reveal>
				<div class="dl-os">
					<span class="osicon"><Icon name="code" size={22} /></span>
					<div>
						<h3>macOS &amp; Docker</h3>
						<p class="meta">Source build · self-hosted server</p>
					</div>
				</div>
				<p class="dl-note">
					macOS builds from source in a few steps. For a self-hosted server on any OS, one
					<code>docker compose up</code> is all it takes.
				</p>
				<div class="btn-row">
					<a class="btn btn-secondary" href="{base}/build">
						<Icon name="github" size={15} />
						Build guide
					</a>
					<a class="btn btn-secondary" href="{base}/docker">
						<Icon name="server" size={15} />
						Docker guide
					</a>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.block {
		padding: 86px 0;
	}
	.download {
		background: var(--surface-950);
		border-top: 1px solid var(--border-700);
		border-bottom: 1px solid var(--border-700);
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
	.dl-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
	}
	@media (max-width: 760px) {
		.dl-grid {
			grid-template-columns: 1fr;
		}
	}
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
	.dl-os {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.dl-os .osicon {
		width: 38px;
		height: 38px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		color: var(--text-muted);
	}
	.dl-os h3 {
		margin: 0;
		font-size: var(--text-base);
		font-weight: var(--weight-semibold);
		color: var(--text-strong);
	}
	.dl-os .meta {
		margin: 2px 0 0;
		font-size: var(--text-xs);
		color: var(--text-subtle);
	}
	.dl-note {
		font-size: var(--text-xs);
		color: var(--text-muted);
		line-height: var(--leading-snug);
		flex: 1;
		margin: 0;
	}
	.dl-note code {
		font-family: var(--font-mono);
		font-size: 0.92em;
		background: var(--surface-800);
		border: 1px solid var(--border-700);
		border-radius: var(--radius-sm);
		padding: 1px 5px;
		color: var(--accent-300);
	}
	.dl-card .btn {
		width: 100%;
	}
	.btn-row {
		display: flex;
		gap: 8px;
	}
	.btn-row .btn {
		flex: 1;
	}
</style>
