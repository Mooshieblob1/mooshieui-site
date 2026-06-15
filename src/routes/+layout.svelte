<script>
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>MooshieUI — A friendly interface for ComfyUI</title>
	<meta
		name="description"
		content="MooshieUI is a clean, guided interface for ComfyUI. Generate images with prompts, LoRAs, and one-click upscaling — on your desktop or in any browser. No Python, no pip, no manual configuration."
	/>
</svelte:head>

<div class="organic-bg" aria-hidden="true">
	<span class="blob b1"></span>
	<span class="blob b2"></span>
</div>

{@render children()}
