<script>
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
 <link rel="preconnect" href="https://fonts.googleapis.com" />
 <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
 <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;450;500;600;700&family=Instrument+Serif:ital@1&display=swap" rel="stylesheet" />
	<title>MooshieUI · A friendly interface for ComfyUI</title>
	<meta
		name="description"
		content="MooshieUI is a guided interface for ComfyUI. Explore Windows, Linux, and Apple Silicon macOS desktop options, or generate in your browser with prompts, LoRAs, and upscaling."
	/>
</svelte:head>

{@render children()}
