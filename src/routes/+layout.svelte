<script>
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>MooshieUI · A friendly interface for ComfyUI</title>
	<meta
		name="description"
		content="MooshieUI is a guided interface for ComfyUI. Explore Windows, Linux, and Apple Silicon macOS desktop options, or generate in your browser with prompts, LoRAs, and upscaling."
	/>
</svelte:head>

{@render children()}
