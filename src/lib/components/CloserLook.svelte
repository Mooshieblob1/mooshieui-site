<script>
	import { reveal } from '$lib/actions/reveal';

	const steps = [
		{
			title: 'Describe it',
			body: 'Type a positive and negative prompt, or apply quality prompts and artist styles. Pick an aspect ratio and resolution from presets.'
		},
		{
			title: 'Dial it in',
			body: "Choose a checkpoint, stack LoRAs, and set your sampler. Or hit “Apply” to load the model's recommended steps, CFG, and scheduler."
		},
		{
			title: 'Generate & refine',
			body: 'Watch live progress, then send the result through the tiled refiner for a clean, high-resolution upscale.'
		}
	];
</script>
<section class="section" id="look" aria-labelledby="look-heading">
 <div class="wrap">
  <div class="look-heading" use:reveal><span class="eyebrow">From prompt to polished</span><h2 id="look-heading" class="section-title">Three steps to a<br /><span class="accent-serif">finished</span> image</h2></div>
  <ol class="steps">
   {#each steps as step, i}
    <li use:reveal><span class="step-number" aria-hidden="true">0{i + 1}</span><h3>{step.title}</h3><p>{step.body}</p></li>
   {/each}
  </ol>
 </div>
</section>
<style>
 .look-heading { margin-bottom: 32px; }
 .steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); list-style: none; padding: 0; margin: 0; }
 .steps li { border-top: 1px solid var(--border-700); padding: 24px 24px 0 0; }
 .steps li + li { padding-left: 24px; }
 .step-number { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: var(--radius-md); color: var(--accent-foreground); background: var(--accent-600); font-size: .875rem; font-weight: 600; line-height: 1; margin-bottom: 16px; }
 h3 { font-size: 1.125rem; line-height: 1.4; font-weight: 600; margin: 0 0 12px; }
 p { font-size: 1rem; line-height: 1.65; color: var(--text-muted); margin: 0; }
 @media(max-width: 800px) { .steps { grid-template-columns: 1fr; gap: 24px; } .steps li:nth-child(n) { padding: 24px 0 0; } }
</style>
