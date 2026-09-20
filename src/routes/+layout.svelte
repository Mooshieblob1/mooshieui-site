<script>
	import '../app.css';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { SITE_URL } from '$lib/site.js';

	let { children } = $props();
	// Keep preview hosts and tracking parameters out of search/share URLs.
	const canonicalUrl = $derived(`${SITE_URL}${page.url.pathname}`);
</script>

<svelte:head>
	{#if page.status === 200}
		<link rel="canonical" href={canonicalUrl} />
		<meta property="og:url" content={canonicalUrl} />
	{/if}
	<meta property="og:image" content={`${SITE_URL}/assets/logo.png`} />
	<meta name="twitter:image" content={`${SITE_URL}/assets/logo.png`} />
 <link rel="preload" href="{base}/fonts/hanken-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
	<title>MooshieUI · A friendly interface for ComfyUI</title>
	<meta
		name="description"
		content="MooshieUI is a guided interface for ComfyUI. Explore Windows, Linux, and Apple Silicon macOS desktop options, or generate in your browser with prompts, LoRAs, and upscaling."
	/>
</svelte:head>

{@render children()}
