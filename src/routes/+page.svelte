<script>
	import { onMount, untrack } from 'svelte';
	import { base } from '$app/paths';
	import { fetchLatestRelease } from '$lib/release.js';
	import CinematicStage from '$lib/components/CinematicStage.svelte';
	import Nav from '$lib/components/Nav.svelte';
	import Features from '$lib/components/Features.svelte';
	import Modes from '$lib/components/Modes.svelte';
	import CloserLook from '$lib/components/CloserLook.svelte';
	import Download from '$lib/components/Download.svelte';
	import Support from '$lib/components/Support.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { data } = $props();

	// Start from the build-time value, then refresh to the live latest on mount
	// so the version and download links stay current without a redeploy.
	let release = $state(untrack(() => data.release));
	onMount(async () => {
		const latest = await fetchLatestRelease(fetch, release);
		if (latest?.tag) release = latest;
	});
</script>

<svelte:head>
	<link
		rel="preload"
		href="{base}/fonts/archivo-variable-latin.woff2"
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
</svelte:head>

<CinematicStage {release} />

<div id="below-stage" class="below-stage">
	<Nav variant="landing" showSkipLink={false} />
	<main id="top" tabindex="-1">
		<Features />
		<Modes {release} />
		<CloserLook />
		<Download {release} />
		<Support />
	</main>
	<Footer {release} />
</div>
