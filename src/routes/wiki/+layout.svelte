<script>
	import '$lib/wiki/wiki.css';
	import WikiHeader from '$lib/components/wiki/WikiHeader.svelte';
	import WikiSidebar from '$lib/components/wiki/WikiSidebar.svelte';
	import WikiSearch from '$lib/components/wiki/WikiSearch.svelte';
	import GuideFooter from '$lib/components/GuideFooter.svelte';

	let { data, children } = $props();
</script>

<div id="top" class="wiki-shell">
	<WikiHeader />
	<div class="wiki-grid">
		<WikiSidebar nav={data.nav} source={data.source} />
		<main id="wiki-content" tabindex="-1">
			{@render children()}
		</main>
	</div>
	<GuideFooter />
</div>
<WikiSearch />
