<script>
	import '$lib/styles/guides.css';
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

<main class="guide-page" id="guide-content" tabindex="-1">
<div class="wrap-narrow head">
	<span class="eyebrow">
		<Icon name="code" size={18} />
		Build from source
	</span>
	<h1>Build the desktop app from source</h1>
	<p class="lede">
		MooshieUI builds with one toolchain on every platform. The same five steps work on Windows,
		Linux, and macOS. For ready-to-run installers and current platform availability,
		<a href="{base}/#download">see the downloads</a>.
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
				<h2>Install the prerequisites</h2>
				<p>
					MooshieUI's frontend is Svelte + Vite; the shell is a Tauri (Rust) app. You'll need three
					things installed first:
				</p>
				<div class="prereq">
					{#each prereqs as p}
						<div class="pcard">
							<h3>{p.name}</h3>
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
				<h2>Clone the repository</h2>
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
				<h2>Install dependencies</h2>
				<p>
					Pull the frontend packages. Rust crates are fetched automatically on the first Tauri build.
				</p>
				<CodeBlock lines={[{ text: 'npm install' }]} />
			</div>
		</div>

		<div class="step">
			<div class="num">4</div>
			<div>
				<h2>Run in development</h2>
				<p>
					Launch the app with hot-reload. The first run opens the setup wizard, which installs
					<span class="inline-code">uv</span>, Python 3.11, ComfyUI, and PyTorch, auto-detecting your
					GPU (NVIDIA / AMD / Intel Arc / Apple Metal / CPU). No manual ComfyUI install needed.
				</p>
				<CodeBlock lines={[{ text: 'npm run tauri dev' }]} />
			</div>
		</div>

		<div class="step">
			<div class="num">5</div>
			<div>
				<h2>Build for production</h2>
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

</main>

<GuideFooter />
