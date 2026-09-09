<script>

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
			{#each features as f}
				<div class="feature">
					<h3>{f.title}</h3>
					<p>{f.body}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
  .block { padding: 96px 0; }
  .sec-head { max-width: none; display: grid; grid-template-columns: 1.2fr .8fr; column-gap: 80px; align-items: end; }
  .sec-head .eyebrow { grid-column: 1 / -1; }
  .sec-head h2 { max-width: 640px; }
  .sec-head p { max-width: 390px; margin: 0 0 3px; }
  .features { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 42px 56px; margin-top: 56px; }
  .feature { min-width: 0; }
  .feature h3 { margin: 0 0 13px; font-size: 1.125rem; line-height: 1.4; font-weight: 500; letter-spacing: -.025em; color: var(--text-strong); }
  .feature p { margin: 0; font-size: 1rem; line-height: 1.7; color: var(--text-muted); }
  @media (max-width: 1000px) { .sec-head { column-gap: 40px; } .features { column-gap: 36px; } }
  @media (max-width: 800px) {
    .block { padding: 64px 0; }
    .sec-head { grid-template-columns: 1fr; }
    .sec-head p { max-width: 600px; margin-top: 20px; }
    .features { grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 36px; gap: 32px; }
  }
  @media (max-width: 520px) { .features { grid-template-columns: 1fr; } }
</style>
