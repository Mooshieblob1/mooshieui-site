<script>

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

<section class="block" id="look">
	<div class="wrap">
		<div class="sec-head">
			<span class="eyebrow">From prompt to polished</span>
			<h2>Three steps to a <span class="accent-serif">finished</span> image</h2>
		</div>
		<ol class="closer-points">
			{#each steps as step, i}
				<li>
					<span class="num">{i + 1}</span>
					<h3>{step.title}</h3>
					<p>{step.body}</p>
				</li>
			{/each}
		</ol>
	</div>
</section>

<style>
  .block { padding: 96px 0; }
  .closer-points { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 56px; padding: 0; margin: 0; list-style: none; }
  .closer-points li { min-width: 0; }
  .num { display: block; margin-bottom: 20px; color: var(--accent-500); font: .9375rem var(--font-mono); }
  h3 { margin: 0 0 12px; font-size: 1.25rem; font-weight: 500; letter-spacing: -.025em; color: var(--text-strong); }
  .closer-points p { margin: 0; font-size: 1rem; line-height: 1.7; color: var(--text-muted); }
  @media (max-width: 1000px) { .closer-points { gap: 36px; } }
  @media (max-width: 800px) { .block { padding: 64px 0; } .closer-points { grid-template-columns: 1fr; gap: 32px; } .num { margin-bottom: 10px; } }
</style>
