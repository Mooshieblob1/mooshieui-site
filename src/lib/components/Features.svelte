<script>
	import Icon from '$lib/icons/Icon.svelte';
	import { reveal } from '$lib/actions/reveal';

	const features = [
		{
			icon: 'sliders',
			title: 'Guided, not wired',
			body: 'Prompts, dimensions, samplers, and model presets live in clean controls. Switch between local ComfyUI workflows and NovelAI without wiring a single node.'
		},
		{
			icon: 'sparkles',
			title: 'First-class NovelAI',
			body: 'Full NovelAI V4 and V5 integration with your own API key, multi-character prompts, Precise Reference portraits, Vibe Transfer, Anlas budgeting, and optional local finishing.'
		},
		{
			icon: 'image',
			title: 'Images, video, music & comics',
			body: 'Generate txt2img, img2img, inpainting, outpainting, and Image Edit alongside storyboarded H3 video timelines, YuE2 music, Comic Pages, and image to 3D.'
		},
		{
			icon: 'layers',
			title: 'LoRAs, Styles & Characters',
			body: 'Stack LoRAs with independent model and CLIP strength, curate Artist Styles without cluttering your prompt, and reuse saved Character sheets across projects.'
		},
		{
			icon: 'wand',
			title: 'Refine, detail & edit',
			body: 'Clean tiled-diffusion upscaling with OmniSR, face detailing, instruction-based image editing, and compare grids to test seeds, samplers, or prompts side by side.'
		},
		{
			icon: 'phone',
			title: 'Desktop, LAN & mobile',
			body: 'Run as a fast Tauri desktop app or self-host the web server over LAN and Docker with a responsive layout built down to phone screens.'
		}
	];
</script>
<section class="section" id="features" aria-labelledby="features-heading">
 <div class="wrap">
  <div class="section-heading" use:reveal>
   <div><span class="eyebrow">What's inside</span><h2 id="features-heading">Everything you generate,<br />across <span class="accent-serif">ComfyUI</span> and NovelAI</h2></div>
   <p>Run local ComfyUI models, connect your NovelAI subscription, and create without wrangling raw node graphs.</p>
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
