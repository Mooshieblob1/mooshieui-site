<script>
	import { onMount, untrack } from 'svelte';
	import { fetchLatestRelease } from '$lib/release.js';
	import Nav from '$lib/components/Nav.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Features from '$lib/components/Features.svelte';
	import Modes from '$lib/components/Modes.svelte';
	import CloserLook from '$lib/components/CloserLook.svelte';
	import Download from '$lib/components/Download.svelte';
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

<Nav variant="landing" />
<main id="top" tabindex="-1">
	<Hero />
	<Features />
	<Modes {release} />
	<CloserLook />
	<Download {release} />
</main>
<Footer {release} />
