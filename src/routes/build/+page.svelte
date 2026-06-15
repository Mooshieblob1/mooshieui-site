<script>
	import Nav from '$lib/components/Nav.svelte';
	import GuideFooter from '$lib/components/GuideFooter.svelte';
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import { base } from '$app/paths';

	const prereqs = [
		{
			name: 'Node.js 18+',
			body: 'JavaScript runtime for the frontend build.',
			link: 'https://nodejs.org/',
			linkText: 'nodejs.org'
		},
		{
			name: 'Rust (stable)',
			body: 'Compiles the Tauri backend. Install via',
			link: 'https://rustup.rs/',
			linkText: 'rustup.rs'
		},
		{
			name: 'Tauri prerequisites',
			body: 'Platform build tools (incl. Xcode CLT on macOS).',
			link: 'https://v2.tauri.app/start/prerequisites/',
			linkText: 'Tauri v2 docs'
		}
	];
</script>

<svelte:head>
	<title>Build from source · MooshieUI</title>
	<meta
		name="description"
		content="Build the MooshieUI desktop app from source. The same steps work on Windows, Linux, and macOS."
	/>
</svelte:head>

<Nav variant="guide" />

<div class="wrap-narrow head">
	<span class="eyebrow">
		<Icon name="code" size={18} />
		Build from source
	</span>
	<h1>Build the desktop app from source</h1>
	<p class="lede">
		MooshieUI builds with one toolchain on every platform. The same five steps work on Windows,
		Linux, and macOS. There are no prebuilt binaries to chase.
	</p>
	<div class="platforms">
		<span class="pchip">Windows</span>
		<span class="pchip">Linux</span>
		<span class="pchip">macOS</span>
	</div>
</div>

<section class="steps">
	<div class="wrap-narrow">
		<div class="step">
			<div class="num">1</div>
			<div>
				<h3>Install the prerequisites</h3>
				<p>
					MooshieUI's frontend is Svelte + Vite; the shell is a Tauri (Rust) app. You'll need three
					things installed first:
				</p>
				<div class="prereq">
					{#each prereqs as p}
						<div class="pcard">
							<h4>{p.name}</h4>
							<p>
								{p.body}
								<a href={p.link} target="_blank" rel="noopener">{p.linkText}</a>
							</p>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<div class="step">
			<div class="num">2</div>
			<div>
				<h3>Clone the repository</h3>
				<p>Grab the source and move into the project directory.</p>
				<CodeBlock
					lines={[
						{ text: 'git clone https://github.com/Mooshieblob1/MooshieUI.git' },
						{ text: 'cd MooshieUI' }
					]}
				/>
			</div>
		</div>

		<div class="step">
			<div class="num">3</div>
			<div>
				<h3>Install dependencies</h3>
				<p>
					Pull the frontend packages. Rust crates are fetched automatically on the first Tauri build.
				</p>
				<CodeBlock lines={[{ text: 'npm install' }]} />
			</div>
		</div>

		<div class="step">
			<div class="num">4</div>
			<div>
				<h3>Run in development</h3>
				<p>
					Launch the app with hot-reload. The first run opens the setup wizard, which installs
					<span class="inline-code">uv</span>, Python 3.11, ComfyUI, and PyTorch, auto-detecting your
					GPU (NVIDIA / AMD / Intel / CPU). No manual ComfyUI install needed.
				</p>
				<CodeBlock lines={[{ text: 'npm run tauri dev' }]} />
			</div>
		</div>

		<div class="step">
			<div class="num">5</div>
			<div>
				<h3>Build for production</h3>
				<p>Produce an optimized desktop build for your current platform.</p>
				<CodeBlock lines={[{ text: 'npm run tauri build' }]} />
				<div class="callout" style="margin-top:18px">
					<Icon name="info" size={18} />
					<span>
						<b>Heads up:</b> first-time setup downloads ~5–10&nbsp;GB (Python + PyTorch + ComfyUI) and
						takes 5–15 minutes depending on your connection. Everything is self-contained in the app's
						data directory.
					</span>
				</div>
			</div>
		</div>

		<div class="callout">
			<Icon name="cloud" size={18} />
			<span>
				Prefer not to install locally? <a href="{base}/docker">Self-host with Docker</a> and run MooshieUI
				from any browser on your network instead.
			</span>
		</div>
	</div>
</section>

<GuideFooter />

<style>
	.head {
		padding: 64px 0 28px;
	}
	.head h1 {
		margin: 16px 0 0;
		font-size: clamp(30px, 4.4vw, 44px);
		font-weight: var(--weight-bold);
		letter-spacing: -0.03em;
		color: var(--text-strong);
		text-wrap: balance;
	}
	.head .lede {
		margin: 16px 0 0;
		max-width: 620px;
		font-size: var(--text-lg);
		line-height: var(--leading-snug);
		color: var(--text-muted);
		text-wrap: pretty;
	}
	.platforms {
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

	.callout {
		margin: 8px 0 0;
		display: flex;
		gap: 11px;
		align-items: flex-start;
		padding: 14px 16px;
		border-radius: var(--radius-lg);
		background: color-mix(in srgb, var(--accent-500) 7%, var(--surface-900));
		border: 1px solid color-mix(in srgb, var(--accent-500) 22%, transparent);
		font-size: var(--text-sm);
		color: var(--text-muted);
		line-height: var(--leading-snug);
	}
	.callout :global(svg) {
		flex-shrink: 0;
		color: var(--accent-400);
		margin-top: 1px;
	}
	.callout b {
		color: var(--text);
	}
	.callout a {
		color: var(--accent-400);
		font-weight: var(--weight-semibold);
	}
	.callout a:hover {
		text-decoration: underline;
	}

	.prereq {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
		margin-top: 8px;
	}
	@media (max-width: 680px) {
		.prereq {
			grid-template-columns: 1fr;
		}
	}
	.pcard {
		background: var(--surface-900);
		border: 1px solid var(--border-700);
		border-radius: var(--radius-lg);
		padding: 16px;
	}
	.pcard h4 {
		margin: 0 0 5px;
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		color: var(--text-strong);
	}
	.pcard p {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--text-muted);
		line-height: var(--leading-snug);
	}
	.pcard a {
		color: var(--accent-400);
	}
	.pcard a:hover {
		text-decoration: underline;
	}

	.steps {
		padding: 24px 0 40px;
	}
	.step {
		display: grid;
		grid-template-columns: 36px 1fr;
		gap: 18px;
		padding: 22px 0;
		border-top: 1px solid var(--border-700);
	}
	.step:first-of-type {
		border-top: none;
	}
	.num {
		width: 30px;
		height: 30px;
		border-radius: var(--radius-md);
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--accent-500);
		color: var(--accent-foreground);
		font-size: var(--text-sm);
		font-weight: var(--weight-bold);
	}
	.step h3 {
		margin: 3px 0 0;
		font-size: var(--text-xl);
		font-weight: var(--weight-semibold);
		color: var(--text-strong);
		letter-spacing: -0.01em;
	}
	.step p {
		margin: 10px 0 0;
		font-size: var(--text-sm);
		color: var(--text-muted);
		line-height: var(--leading-normal);
	}
	.inline-code {
		font-family: var(--font-mono);
		font-size: 0.92em;
		background: var(--surface-800);
		border: 1px solid var(--border-700);
		border-radius: var(--radius-sm);
		padding: 1px 6px;
		color: var(--accent-300);
	}
</style>
