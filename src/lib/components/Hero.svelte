<script>
	import Icon from '$lib/icons/Icon.svelte';
	import { base } from '$app/paths';
</script>

<section class="hero" aria-labelledby="hero-title">
	<div class="wrap hero-layout">
		<div class="hero-copy">
			<span class="eyebrow">A friendly interface for ComfyUI</span>
			<h1 id="hero-title">All the power of ComfyUI.<br /><span>None of the node graph.</span></h1>
			<p class="sub">Make images. Not node graphs.</p>
			<div class="hero-cta">
				<a class="btn btn-primary" href="#download"><Icon name="download" />Get started</a>
				<a class="browser-link" href="#modes">Try the browser build<Icon name="arrow-right" size={17} /></a>
			</div>
			<p class="hero-note"><Icon name="code" size={16} />Free and open source<span aria-hidden="true">/</span>Desktop &amp; browser</p>
		</div>
		<figure class="showcase">
			<div class="window">
				<div class="window-bar">
					<span class="window-title"><img src="{base}/assets/favicon.png" alt="" width="18" height="18" />MooshieUI: Generate</span>
					<Icon name="sliders-h" size={16} />
				</div>
				<img class="shot" src="{base}/assets/app-screenshot.avif" width="1874" height="1347" fetchpriority="high" alt="The MooshieUI generation workspace: a left panel with dimensions and prompts, a centered artwork preview, and a right panel with model and sampler controls." />
			</div>
			<figcaption><span>Text to image · Image to image</span><span>Inpainting</span></figcaption>
		</figure>
	</div>
</section>

<style>
	.hero { padding: 88px 0 80px; border-bottom: 1px solid var(--border-700); }
	.hero-layout { display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); align-items: center; gap: 56px; }
	.hero-copy { padding-bottom: 32px; animation: arrive .65s ease both; }
	h1 { margin: 26px 0 0; max-width: 650px; font-size: clamp(3rem, 4.7vw, 4.7rem); line-height: 1.055; letter-spacing: -.055em; font-weight: 600; color: var(--text-strong); }
	h1 span { color: var(--accent-500); }
	.sub { margin: 26px 0 0; font-size: 1.1875rem; color: var(--text-muted); }
	.hero-cta { display: flex; align-items: center; flex-wrap: wrap; gap: 24px; margin-top: 34px; }
	.browser-link { display: inline-flex; align-items: center; gap: 10px; padding: 12px 0; font-size: .875rem; font-weight: 500; }
	.browser-link:hover { color: var(--accent-500); }
	.hero-note { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin: 28px 0 0; font-size: .8125rem; color: var(--text-subtle); }
	.hero-note > span { color: var(--border-700); padding: 0 2px; }
	.showcase { min-width: 0; margin: 0; position: relative; animation: arrive .8s ease both; }
	.showcase::before { content: ''; position: absolute; inset: -13px 15px 53px -13px; border: 1px solid #f6cb4333; border-radius: 18px; z-index: -1; }
	.window { border: 1px solid #414139; border-radius: 12px; overflow: hidden; background: #191919; box-shadow: 0 30px 70px -25px #000b; }
	.window-bar { height: 43px; padding: 0 16px; display: flex; align-items: center; justify-content: space-between; background: #22221f; border-bottom: 1px solid #363630; color: #91918a; }
	.window-title { display: flex; align-items: center; gap: 9px; font-size: .75rem; color: #b5b5ad; }
	.shot { display: block; width: 100%; height: auto; }
	figcaption { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-top: 18px; font-family: var(--font-mono); font-size: .75rem; color: var(--text-subtle); }
	@keyframes arrive { from { transform: translateY(14px); } to { transform: translateY(0); } }
	@media (max-width: 1050px) { .hero-layout { gap: 32px; } h1 { font-size: clamp(2.8rem, 4.9vw, 4rem); } .hero-cta { gap: 12px; } }
	@media (max-width: 800px) { .hero { padding: 56px 0; } .hero-layout { grid-template-columns: 1fr; gap: 36px; } .hero-copy { padding: 0; } h1 { font-size: clamp(3rem, 8vw, 4.8rem); max-width: 650px; } .showcase { margin-left: 10px; } }
	@media (max-width: 420px) { h1 { font-size: 2.875rem; } .hero-note { font-size: .75rem; gap: 7px; } .hero-cta { gap: 18px; } }
</style>
