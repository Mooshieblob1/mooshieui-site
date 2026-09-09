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
					<div class="feature-head">
						<div class="ficon"><Icon name={f.icon} /></div>
						<h3>{f.title}</h3>
					</div>
					<span class="node-ports" aria-hidden="true"></span>
					<p>{f.body}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
  .block {
    padding: 100px 0;
    background-image: radial-gradient(color-mix(in srgb, var(--border-700) 48%, transparent) .8px, transparent .8px);
    background-size: 24px 24px;
  }
  .sec-head { max-width: none; display: grid; grid-template-columns: 1.2fr .8fr; column-gap: 80px; align-items: end; }
  .sec-head .eyebrow { grid-column: 1 / -1; }
  .sec-head h2 { max-width: 640px; }
  .sec-head p { max-width: 390px; margin: 0 0 3px; }
  .features { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
  .feature {
    position: relative;
    min-width: 0;
    border: 1px solid var(--border-700);
    border-radius: 9px;
    background: var(--surface-900);
    box-shadow: 0 5px 0 color-mix(in srgb, var(--surface-950) 70%, transparent);
    transition: border-color .2s, box-shadow .2s;
  }
  .feature:hover {
    border-color: color-mix(in srgb, var(--accent-500) 60%, var(--border-700));
    box-shadow: 0 5px 0 var(--surface-950), 0 0 24px color-mix(in srgb, var(--accent-500) 5%, transparent);
  }
  .feature-head {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 90px;
    padding: 18px 24px;
    border-radius: 8px 8px 0 0;
    border-bottom: 1px solid var(--border-700);
    background: var(--surface-950);
  }
  .ficon { display: flex; align-items: center; color: var(--accent-500); flex-shrink: 0; }
  .feature h3 { margin: 0; font-size: 1.125rem; line-height: 1.4; font-weight: 500; letter-spacing: -.025em; color: var(--text-strong); }
  .feature p { margin: 0; padding: 24px; font-size: 1rem; line-height: 1.65; color: var(--text-muted); }
  .node-ports::before, .node-ports::after {
    content: '';
    position: absolute;
    z-index: 1;
    top: 40px;
    width: 10px;
    height: 10px;
    border: 2px solid var(--accent-500);
    border-radius: 50%;
    background: var(--surface-950);
  }
  .node-ports::before { left: -5px; }
  .node-ports::after { right: -5px; }
  .feature::after {
    content: '';
    position: absolute;
    top: 44px;
    left: 100%;
    width: 26px;
    border-top: 1px solid color-mix(in srgb, var(--accent-500) 45%, transparent);
    pointer-events: none;
  }
  .feature:nth-child(3n)::after { content: none; }
  @media (max-width: 1000px) { .sec-head { column-gap: 40px; } .feature-head { padding-inline: 20px; } .feature p { padding: 22px; } }
  @media (max-width: 800px) {
    .block { padding: 64px 0; }
    .sec-head { grid-template-columns: 1fr; }
    .sec-head p { max-width: 600px; margin-top: 20px; }
    .features { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .feature:nth-child(n)::after { content: none; }
    .feature:nth-child(odd)::after { content: ''; }
  }
  @media (max-width: 520px) {
    .features { grid-template-columns: 1fr; }
    .feature:nth-child(n)::after { content: none; }
    .feature-head { min-height: 90px; }
  }
</style>
