<script>
	import Nav from '$lib/components/Nav.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Features from '$lib/components/Features.svelte';
	import Modes from '$lib/components/Modes.svelte';
	import CloserLook from '$lib/components/CloserLook.svelte';
	import Download from '$lib/components/Download.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { data } = $props();
</script>

<Nav variant="landing" />
<main id="top">
	<Hero />
	<Features />
	<Modes release={data.release} />
	<CloserLook />
	<Download release={data.release} />
</main>
<Footer />
