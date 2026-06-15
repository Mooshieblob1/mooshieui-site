<script>
	import Icon from '$lib/icons/Icon.svelte';
	import { reveal } from '$lib/actions/reveal.js';
	import { base } from '$app/paths';

	const repo = 'https://github.com/Mooshieblob1/MooshieUI';
	const v = 'v1.4.18';
	const winUrl = `${repo}/releases/download/${v}/MooshieUI_1.4.18_x64-setup.exe`;
	const appimageUrl = `${repo}/releases/download/${v}/MooshieUI_1.4.18_amd64.AppImage`;
	const debUrl = `${repo}/releases/download/${v}/MooshieUI_1.4.18_amd64.deb`;
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
						<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M3 5.557 9.8 4.667v6.53H3V5.557zm0 12.886 6.8-.894v6.33L3 22.886V18.443zm7.467-13.12 9.933-1.323V11.2h-9.933V5.323zm0 12.4h9.933V24l-9.933-1.322v-4.955z"/></svg>
					</span>
					<div>
						<h3>Windows</h3>
						<p class="meta">Installer · x64 · v1.4.18</p>
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
						<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00.11.27.406.406 0 00.26.103.408.408 0 00.404-.387c.01-.29.048-.574.11-.854.055-.236.12-.47.197-.698a7.578 7.578 0 011.14-2.252 4.5 4.5 0 00.756-2.172c.005-.288.002-.577-.003-.866-.005-.285-.01-.568-.005-.849.01-.575.086-1.15.27-1.694.39-1.152 1.273-2.134 2.532-2.568.51-.178 1.053-.288 1.61-.344.558-.056 1.13-.055 1.7-.006.57.049 1.138.152 1.692.304 1.305.362 2.465 1.07 3.112 2.26.266.49.4 1.035.406 1.586.005.556-.114 1.117-.366 1.615a7.86 7.86 0 01-.82 1.317 7.543 7.543 0 00-1.026 2.07c-.15.537-.222 1.092-.218 1.65.004.554.086 1.11.263 1.638.352 1.06 1.035 1.98 1.946 2.637.458.327.965.575 1.498.718a3.8 3.8 0 001.63.075c.546-.093 1.067-.3 1.533-.602.948-.605 1.606-1.565 1.839-2.647.117-.54.14-1.1.063-1.65a5.56 5.56 0 00-.527-1.675c-.267-.547-.621-1.047-1.025-1.497a8.57 8.57 0 01-.9-1.27 5.5 5.5 0 01-.55-1.504 5.49 5.49 0 01-.085-1.56c.047-.53.163-1.054.35-1.554.374-1.006 1.02-1.9 1.83-2.586a7.19 7.19 0 012.72-1.506 8.007 8.007 0 013.04-.297c1.03.097 2.028.41 2.892.935.864.527 1.588 1.26 2.09 2.127.25.434.436.9.55 1.38.113.48.148.98.1 1.472a6.26 6.26 0 01-.346 1.52 7.35 7.35 0 01-.778 1.544c-.37.565-.83 1.06-1.334 1.49-.505.43-1.057.795-1.644 1.082a9.4 9.4 0 01-1.91.633 9.783 9.783 0 01-2.015.183c-.68 0-1.358-.074-2.017-.224-.658-.148-1.297-.382-1.895-.692a8.55 8.55 0 01-1.686-1.18 8.24 8.24 0 01-1.297-1.665 7.72 7.72 0 01-.747-2.063 7.44 7.44 0 01-.1-2.183c.095-.74.304-1.466.614-2.143.308-.676.714-1.3 1.19-1.856.476-.554 1.019-1.037 1.608-1.428.59-.39 1.226-.685 1.893-.873a7.55 7.55 0 012.003-.261c.68 0 1.357.087 2.006.26z"/></svg>
					</span>
					<div>
						<h3>Linux</h3>
						<p class="meta">AppImage · .deb · v1.4.18</p>
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
					<span class="osicon"><Icon name="code" size={30} /></span>
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
		color: var(--text-muted);
		flex-shrink: 0;
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
