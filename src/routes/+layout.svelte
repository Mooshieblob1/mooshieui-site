<script>
	import '../app.css';
	import { base } from '$app/paths';

	let { children } = $props();
</script>

<svelte:head>
 <link rel="preload" href="{base}/fonts/hanken-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
	<title>MooshieUI · A friendly interface for ComfyUI</title>
	<meta
		name="description"
		content="MooshieUI is a guided interface for ComfyUI. Explore Windows, Linux, and Apple Silicon macOS desktop options, or generate in your browser with prompts, LoRAs, and upscaling."
	/>
</svelte:head>

{@render children()}
