<script>
	import '../app.css';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { SITE_URL } from '$lib/site.js';

	let { children } = $props();
	// Keep preview hosts and tracking parameters out of search/share URLs.
	const canonicalUrl = $derived(`${SITE_URL}${page.url.pathname}`);

	// Link preview (Open Graph / Twitter / Discord). A route overrides any field by
	// returning `seo` from its load function.
	const DEFAULT_SEO = {
		title: 'MooshieUI',
		description:
			'A polished interface for ComfyUI. Explore Windows, Linux, and Apple Silicon macOS desktop options, or run it in your browser.',
		image: '/assets/logo.png',
		imageAlt: 'MooshieUI logo',
		width: 512,
		height: 512,
		card: 'summary'
	};
	const seo = $derived({ ...DEFAULT_SEO, ...(page.data?.seo ?? {}) });
</script>

<svelte:head>
	{#if page.status === 200}
		<link rel="canonical" href={canonicalUrl} />
		<meta property="og:url" content={canonicalUrl} />
	{/if}
	<meta property="og:title" content={seo.title} />
	<meta property="og:description" content={seo.description} />
	<meta property="og:image" content={`${SITE_URL}${seo.image}`} />
	<meta property="og:image:width" content={String(seo.width)} />
	<meta property="og:image:height" content={String(seo.height)} />
	<meta property="og:image:alt" content={seo.imageAlt} />
	<meta name="twitter:card" content={seo.card} />
	<meta name="twitter:title" content={seo.title} />
	<meta name="twitter:description" content={seo.description} />
	<meta name="twitter:image" content={`${SITE_URL}${seo.image}`} />
	<meta name="twitter:image:alt" content={seo.imageAlt} />
 <link rel="preload" href="{base}/fonts/hanken-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
	<title>MooshieUI · A friendly interface for ComfyUI</title>
	<meta
		name="description"
		content="MooshieUI is a guided interface for ComfyUI. Explore Windows, Linux, and Apple Silicon macOS desktop options, or generate in your browser with prompts, LoRAs, and upscaling."
	/>
</svelte:head>

{@render children()}
