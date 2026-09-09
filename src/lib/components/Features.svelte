<script>
	import Icon from '$lib/icons/Icon.svelte';
	import { reveal } from '$lib/actions/reveal';

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
<section class="section" id="features" aria-labelledby="features-heading">
 <div class="wrap">
  <div class="section-heading" use:reveal>
   <div><span class="eyebrow">What's inside</span><h2 id="features-heading">Everything you generate,<br />none of the <span class="accent-serif">graph-wrangling</span></h2></div>
   <p>MooshieUI keeps ComfyUI's power and hides its complexity behind controls that make sense.</p>
  </div>
  <div class="features">
   {#each features as feature}
    <article class="feature" use:reveal>
     <h3><Icon name={feature.icon} size={20} stroke={2} />{feature.title}</h3><p>{feature.body}</p>
    </article>
   {/each}
  </div>
 </div>
</section>
<style>
 .features { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border: 1px solid var(--border-700); border-radius: var(--app-shell-radius); overflow: hidden; background: var(--surface-900); }
 .feature { padding: 26px; border-right: 1px solid var(--border-700); border-bottom: 1px solid var(--border-700); }
 .feature:nth-child(3n) { border-right: 0; }
 .feature:nth-last-child(-n+3) { border-bottom: 0; }
 h3 { display: flex; align-items: center; gap: 10px; font-size: 1.125rem; font-weight: 600; line-height: 1.4; margin: 0 0 14px; }
 h3 :global(svg) { color: var(--accent-500); flex-shrink: 0; }
 p { font-size: 1rem; color: var(--text-muted); line-height: 1.65; margin: 0; }
 @media (max-width: 1000px) { .features { grid-template-columns: repeat(2, minmax(0, 1fr)); } .feature:nth-child(n) { border-right: 1px solid var(--border-700); border-bottom: 1px solid var(--border-700); } .feature:nth-child(2n) { border-right: 0; } .feature:nth-last-child(-n+2) { border-bottom: 0; } }
 @media (max-width: 600px) { .features { grid-template-columns: 1fr; } .feature:nth-child(n) { padding: 22px; border-right: 0; border-bottom: 1px solid var(--border-700); } .feature:last-child { border-bottom: 0; } }
</style>
