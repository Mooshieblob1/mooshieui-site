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
   {#each features as feature, i}
    <article class="feature" use:reveal>
     <div class="feature-meta"><span>{String(i + 1).padStart(2, '0')}</span><Icon name={feature.icon} size={22} stroke={1.5} /></div>
     <h3>{feature.title}</h3><p>{feature.body}</p>
    </article>
   {/each}
  </div>
 </div>
</section>
<style>
 .features { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px 40px; }
 .feature { padding: 26px 0 30px; border-top: 1px solid var(--border-700); }
 .feature-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; color: var(--accent-400); }
 .feature-meta span { font-family: var(--font-mono); font-size: .8125rem; color: var(--text-muted); }
 h3 { font-size: 1.25rem; font-weight: 500; letter-spacing: -.025em; line-height: 1.4; margin: 0 0 12px; }
 p { font-size: 1rem; color: var(--text-muted); line-height: 1.7; margin: 0; }
 @media (max-width: 1000px) { .features { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 30px; } }
 @media (max-width: 560px) { .features { grid-template-columns: 1fr; } .feature { padding-block: 22px; } .feature-meta { margin-bottom: 16px; } }
</style>
