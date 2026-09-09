<script>
	import Icon from '$lib/icons/Icon.svelte';

	const features = [
		{
			icon: 'sliders',
			title: 'Guided, not wired',
			body: 'Prompts, dimensions, samplers, and models are laid out as plain controls. Switch settings without ever touching a node or a connection.'
		},
		{
			icon: 'image',
			title: 'Three generation modes',
			body: 'Text to image, image to image, and inpainting. Switchable with a single click, sharing the same prompt and model setup.'
		},
		{
			icon: 'layers',
			title: 'LoRAs & Artist Styles',
			body: 'Stack LoRAs with independent model and CLIP strength, and apply bundled artist styles that inject tags without cluttering your prompt.'
		},
		{
			icon: 'wand',
			title: 'Built-in refiner',
			body: 'Tiled-diffusion upscaling with OmniSR. Every tile is denoised simultaneously each step for seamless, high-quality results.'
		},
		{
			icon: 'grid',
			title: 'Compare side by side',
			body: 'Generate batches and line results up in a compare grid to find the seed, sampler, or prompt tweak that actually worked.'
		},
		{
			icon: 'phone',
			title: 'Works on your phone',
			body: 'The browser build is mobile-aware, so you can kick off and check on generations from any device on your network.'
		}
	];
</script>

<section class="block" id="features">
	<div class="wrap">
		<div class="sec-head">
			<span class="eyebrow muted">What's inside</span>
			<h2>Everything you generate, none of the <span class="accent-serif">graph-wrangling</span></h2>
			<p>MooshieUI keeps ComfyUI's power and hides its complexity behind controls that make sense.</p>
		</div>
		<div class="features">
			{#each features as f, i}
				<div class="feature">
					<div class="ficon"><Icon name={f.icon} /></div>
					<h3>{f.title}</h3>
					<p>{f.body}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
  .block { padding: 100px 0; }
  .sec-head { max-width: none; display: grid; grid-template-columns: 1.2fr .8fr; column-gap: 80px; align-items: end; }
  .sec-head .eyebrow { grid-column: 1 / -1; }
  .sec-head h2 { max-width: 640px; }
  .sec-head p { max-width: 390px; margin: 0 0 3px; }
  .features { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border: 1px solid var(--border-700); border-radius: 16px; overflow: hidden; }
  .feature { position: relative; padding: 32px; background: var(--surface-900); border-right: 1px solid var(--border-700); transition: background .2s; }
  .feature:nth-child(-n+3) { border-bottom: 1px solid var(--border-700); }
  .feature:nth-child(3n) { border-right: 0; }
  .feature:hover { background: #20251b; }
  .ficon { width: 40px; height: 40px; display: flex; align-items: center; color: var(--accent-500); margin-bottom: 20px; }
  .feature h3 { margin: 0 0 12px; font-size: 1.125rem; font-weight: 500; letter-spacing: -.025em; color: var(--text-strong); }
  .feature p { margin: 0; font-size: 1rem; line-height: 1.65; color: var(--text-muted); }
  @media (max-width: 1000px) { .sec-head { column-gap: 40px; } .feature { padding: 26px; } }
  @media (max-width: 800px) { .block { padding: 64px 0; } .sec-head { grid-template-columns: 1fr; } .sec-head p { max-width: 600px; margin-top: 20px; } .features { grid-template-columns: repeat(2, minmax(0, 1fr)); } .feature:nth-child(n) { border-right: 1px solid var(--border-700); border-bottom: 1px solid var(--border-700); } .feature:nth-child(2n) { border-right: 0; } .feature:nth-last-child(-n+2) { border-bottom: 0; } }
  @media (max-width: 520px) { .features { grid-template-columns: 1fr; } .feature:nth-child(n) { border-right: 0; border-bottom: 1px solid var(--border-700); } .feature:last-child { border-bottom: 0; } }
</style>
