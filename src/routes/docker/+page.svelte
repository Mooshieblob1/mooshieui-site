<script>
	import '$lib/styles/guides.css';
	import Nav from '$lib/components/Nav.svelte';
	import GuideFooter from '$lib/components/GuideFooter.svelte';
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import { base } from '$app/paths';

	const prereqs = [
		{
			name: 'Docker Engine',
			body: 'Runs the container. Desktop or CLI both work.',
			link: 'https://docs.docker.com/get-docker/',
			linkText: 'get Docker'
		},
		{
			name: 'Docker Compose v2',
			body: 'Ships with recent Docker. Brings the stack up in one command.',
			link: 'https://docs.docker.com/compose/',
			linkText: 'Compose docs'
		},
		{
			name: 'NVIDIA Container Toolkit',
			body: 'Optional. Exposes your GPU to the container for fast generation.',
			link: 'https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/',
			linkText: 'toolkit setup'
		}
	];
</script>

<svelte:head>
	<title>Docker guide · MooshieUI</title>
	<meta
		name="description"
		content="Self-host MooshieUI with Docker. Run the built-in web server in a container and reach it from any device on your network."
	/>
</svelte:head>

<Nav variant="guide" />

<main class="guide-page" id="guide-content" tabindex="-1">
<div class="wrap-narrow head">
	<span class="eyebrow">
		<Icon name="server" size={18} />
		Docker guide
	</span>
	<h1>Self-host MooshieUI with Docker</h1>
	<p class="lede">
		Run the built-in web server in a container and reach the same interface from any device on your
		network: desktop, laptop, or phone. One file, one command.
	</p>
	<div class="platforms">
		<span class="pchip">Web server</span>
		<span class="pchip">Docker</span>
		<span class="pchip">LAN / mobile</span>
	</div>
</div>

<section class="steps">
	<div class="wrap-narrow">
		<div class="step">
			<div class="num">1</div>
			<div>
				<h2>Install the prerequisites</h2>
				<p>
					You'll need Docker and Compose. For GPU-accelerated generation on an NVIDIA card, add the
					container toolkit. CPU-only works too, just slower.
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
				<p>The compose file lives in the repo. Grab the source and move into it.</p>
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
				<h2>Configure the compose file</h2>
				<p>
					A starter <span class="inline-code">docker-compose.yml</span> is included. Mount a host folder
					for your models and outputs so they survive container rebuilds, and pick the port you want to
					serve on.
				</p>
				<CodeBlock
					label="docker-compose.yml"
					lines={[
						{ text: 'services:' },
						{ text: '  mooshieui:' },
						{ text: '    image: ghcr.io/mooshieblob1/mooshieui:latest' },
						{ text: '    ports: ["8188:8188"]' },
						{ text: '    volumes: ["./data:/app/data"]' }
					]}
				/>
			</div>
		</div>

		<div class="step">
			<div class="num">4</div>
			<div>
				<h2>Bring the stack up</h2>
				<p>
					Build and start the server in the background. The first launch pulls the image and runs the
					same setup wizard that installs ComfyUI and PyTorch into the mounted data volume.
				</p>
				<CodeBlock lines={[{ text: 'docker compose up -d' }]} />
				<div class="callout" style="margin-top:18px">
					<Icon name="info" size={18} />
					<span>
						<b>Heads up:</b> first-time setup downloads ~5–10&nbsp;GB (Python + PyTorch + ComfyUI) into
						the <span class="inline-code">./data</span> volume. Keep that folder around; subsequent starts
						are near-instant.
					</span>
				</div>
			</div>
		</div>

		<div class="step">
			<div class="num">5</div>
			<div>
				<h2>Open it anywhere on your network</h2>
				<p>
					Browse to the server from the host machine, then reach it from any other device on your LAN
					using the host's IP address. The UI is responsive down to phone screens.
				</p>
				<CodeBlock
					label="Browser"
					lines={[{ text: 'http://localhost:8188' }, { text: 'http://192.168.1.20:8188' }]}
				/>
			</div>
		</div>

		<div class="callout">
			<Icon name="code" size={18} />
			<span>
				Want a native window instead? <a href="{base}/build">Build the desktop app from source.</a> The
				interface is identical either way.
			</span>
		</div>
	</div>
</section>

</main>

<GuideFooter />
