<script>
	import '../app.css';
	import { tweaks, bodyClass } from '$lib/theme.js';
	import { browser } from '$app/environment';
	import Tweaks from '$lib/components/Tweaks.svelte';

	let { children } = $props();

	// Keep the <body> class in sync with the active tweaks.
	$effect(() => {
		if (browser) {
			document.body.className = bodyClass($tweaks);
		}
	});
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

<Tweaks />
