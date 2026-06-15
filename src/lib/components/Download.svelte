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
						<!-- Ubuntu logo -->
						<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
							<path d="M3.482 9.252a2.748 2.748 0 1 0 .001 5.497 2.748 2.748 0 0 0-.001-5.497zm13.737 8.755a2.748 2.748 0 1 0 .002 5.497 2.748 2.748 0 0 0-.002-5.497zm0-21.51a2.748 2.748 0 1 0 .002 5.497 2.748 2.748 0 0 0-.002-5.497zM8.115 12c0-1.32.642-2.49 1.63-3.213l-1.901-2.55A7.108 7.108 0 0 0 4.92 9.643a3.397 3.397 0 0 1 .001 4.714 7.108 7.108 0 0 0 2.924 3.406l1.9-2.55A3.985 3.985 0 0 1 8.116 12zm3.886-3.886c2.029 0 3.7 1.554 3.875 3.534l3.18-.046a7.06 7.06 0 0 0-2.27-4.74 3.397 3.397 0 0 1-4.083-2.357 7.123 7.123 0 0 0-4.49.94l1.55 2.78a3.97 3.97 0 0 1 2.238-.111zm0 7.772a3.97 3.97 0 0 1-2.237-.11l-1.55 2.778a7.123 7.123 0 0 0 4.49.941 3.397 3.397 0 0 1 4.082-2.356 7.06 7.06 0 0 0 2.27-4.741l-3.18-.046c-.175 1.98-1.846 3.534-3.875 3.534z"/>
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
