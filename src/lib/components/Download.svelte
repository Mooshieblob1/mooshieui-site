<script>
	import Icon from '$lib/icons/Icon.svelte';
	import { reveal } from '$lib/actions/reveal.js';
	import { base } from '$app/paths';

	const repo = 'https://github.com/Mooshieblob1/MooshieUI';
</script>

<section class="block download" id="download">
	<div class="wrap">
		<div class="sec-head" use:reveal>
			<span class="eyebrow">Get MooshieUI</span>
			<h2>Get started in minutes</h2>
			<p>
				Free and open source. No installers to chase. Build the desktop app from source or self-host
				the server; the interface is identical either way.
			</p>
		</div>
		<div class="dl-grid">
			<div class="dl-card" use:reveal>
				<div class="dl-os">
					<span class="osicon"><Icon name="code" size={30} /></span>
					<div>
						<h3>Build from source</h3>
						<p class="meta">Tauri desktop · any OS</p>
					</div>
				</div>
				<p class="dl-note">
					Clone the repo and build the desktop app. The same steps work on Windows, Linux, and
					macOS. The setup wizard installs Python, PyTorch, and ComfyUI on first launch.
				</p>
				<a class="btn btn-primary" href="{base}/build">
					<Icon name="code" />
					View build steps
				</a>
			</div>
			<div class="dl-card" use:reveal>
				<div class="dl-os">
					<span class="osicon"><Icon name="server" size={30} /></span>
					<div>
						<h3>Self-host with Docker</h3>
						<p class="meta">Browser &amp; server</p>
					</div>
				</div>
				<p class="dl-note">
					Run <code>docker compose up</code> and open MooshieUI in your browser, then reach it from any
					device on your network, phones included.
				</p>
				<a class="btn btn-primary" href="{base}/docker">
					<Icon name="server" />
					Docker guide
				</a>
			</div>
			<div class="dl-card" use:reveal>
				<div class="dl-os">
					<span class="osicon"><Icon name="cloud" size={30} /></span>
					<div>
						<h3>Remote / cloud GPU</h3>
						<p class="meta">RunPod · Vast.ai</p>
					</div>
				</div>
				<p class="dl-note">
					Run ComfyUI on a cloud GPU and point MooshieUI at it. No local install. Validate the
					endpoint and start generating.
				</p>
				<a
					class="btn btn-secondary"
					href={repo + '#remote--cloud-comfyui-runpod-vastai-etc'}
					target="_blank"
					rel="noopener"
				>
					<Icon name="github" size={15} />
					Read the guide
				</a>
			</div>
		</div>
		<div class="backend-note" use:reveal>
			<Icon name="info" />
			<span>
				MooshieUI is a front-end. You'll need a running
				<a href="https://github.com/comfyanonymous/ComfyUI" target="_blank" rel="noopener">ComfyUI</a>
				backend. Point MooshieUI at it and go.
			</span>
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
		color: var(--text);
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
	.backend-note {
		margin: 30px auto 0;
		max-width: 640px;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		font-size: var(--text-sm);
		color: var(--text-muted);
		padding: 14px 18px;
		border-radius: var(--radius-lg);
		background: color-mix(in srgb, var(--accent-500) 7%, var(--surface-900));
		border: 1px solid color-mix(in srgb, var(--accent-500) 22%, transparent);
	}
	.backend-note :global(svg) {
		flex-shrink: 0;
		color: var(--accent-400);
	}
	.backend-note a {
		color: var(--accent-400);
		font-weight: var(--weight-semibold);
	}
	.backend-note a:hover {
		text-decoration: underline;
	}
</style>
