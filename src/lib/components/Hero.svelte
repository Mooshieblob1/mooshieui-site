<script>
	import Icon from '$lib/icons/Icon.svelte';
	import { base } from '$app/paths';
</script>

<section class="hero" aria-labelledby="hero-title">
	<div class="wrap hero-layout">
		<div class="hero-copy">
			<h1 id="hero-title">All the power of ComfyUI.<br /><span>None of the node graph.</span></h1>
			<p class="sub">Make images. Not node graphs.</p>
			<div class="hero-cta">
				<a class="btn btn-primary" href="#download"><Icon name="download" />Download</a>
				<a class="browser-link" href="#modes">Two ways to run<Icon name="arrow-right" size={17} /></a>
			</div>
		</div>
		<div class="showcase">
			<img class="shot" src="{base}/assets/app-screenshot.avif" width="1874" height="1347" fetchpriority="high" alt="The MooshieUI generation workspace: a left panel with dimensions and prompts, a centered artwork preview, and a right panel with model and sampler controls." />
		</div>
	</div>
</section>

<style>
	.hero { padding: 100px 0; border-bottom: 1px solid var(--border-700); }
	.hero-layout { display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); align-items: center; gap: 64px; }
	h1 { margin: 0; max-width: 650px; font-size: clamp(3rem, 4.7vw, 4.7rem); line-height: 1.055; letter-spacing: -.055em; font-weight: 500; color: var(--text-strong); }
	h1 span { color: var(--accent-500); }
	.sub { margin: 26px 0 0; font-size: 1.1875rem; color: var(--text-muted); }
	.hero-cta { display: flex; align-items: center; flex-wrap: wrap; gap: 24px; margin-top: 34px; }
	.browser-link { display: inline-flex; align-items: center; gap: 10px; padding: 12px 0; font-size: .875rem; font-weight: 500; }
	.browser-link:hover { color: var(--accent-500); }
	.showcase { min-width: 0; }
	.shot { display: block; width: 100%; height: auto; border-radius: 8px; }
	@media (max-width: 1050px) { .hero-layout { gap: 36px; } h1 { font-size: clamp(2.8rem, 4.9vw, 4rem); } .hero-cta { gap: 12px; } }
	@media (max-width: 800px) { .hero { padding: 64px 0; } .hero-layout { grid-template-columns: 1fr; gap: 44px; } h1 { font-size: clamp(3rem, 8vw, 4.8rem); max-width: 650px; } }
	@media (max-width: 420px) { h1 { font-size: 2.875rem; } .hero-cta { gap: 18px; } }
</style>
