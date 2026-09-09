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
	<div class="wrap closer">
		<!-- Read-only illustration of the existing generation controls. -->
		<div class="closer-media">
			<div class="mock" role="img" aria-label="Example generation settings: Anima Base v1.0 checkpoint, 30 steps, CFG 4.0, and Generate.">
				<div class="mock-row">
					<span class="mock-label">Checkpoint</span>
					<span class="mock-badge">anima</span>
				</div>
				<div class="mock-field">Anima Base v1.0</div>
				<div>
					<div class="mock-meta"><span>Steps</span><span class="strong">30</span></div>
					<div class="mock-track"><div class="mock-fill" style="width:62%"></div></div>
				</div>
				<div>
					<div class="mock-meta"><span>CFG</span><span class="strong">4.0</span></div>
					<div class="mock-track"><div class="mock-fill" style="width:28%"></div></div>
				</div>
				<div class="mock-split" aria-hidden="true">
					<span></span>
					<span></span>
				</div>
				<div class="mock-generate">Generate</div>
			</div>
		</div>
		<div>
			<span class="eyebrow">From prompt to polished</span>
			<h2>Three steps to a <span class="accent-serif">finished</span> image</h2>
			<ol class="closer-points">
				{#each steps as step, i}
					<li>
						<span class="num">{i + 1}</span>
						<div>
							<h3>{step.title}</h3>
							<p>{step.body}</p>
						</div>
					</li>
				{/each}
			</ol>
		</div>
	</div>
</section>

<style>
  .block { padding: 110px 0; }
  .closer { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 100px; align-items: center; }
  .closer-media { background: var(--surface-900); border: 1px solid var(--border-700); border-radius: 20px; padding: 44px; }
  .mock { padding: 28px; border: 1px solid #464a3b; border-radius: 12px; background: var(--surface-950); box-shadow: 0 20px 45px #0004; display: flex; flex-direction: column; gap: 22px; }
  .mock-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .mock-label { font-size: .875rem; color: var(--text-muted); }
  .mock-badge { font-size: .75rem; padding: 3px 9px; border: 1px solid #496047; border-radius: 5px; color: #bed8b4; background: #1e2d1d; }
  .mock-field { min-height: 44px; padding: 12px 14px; border-radius: 6px; background: var(--surface-800); border: 1px solid var(--border-700); font-size: .875rem; }
  .mock-meta { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: .875rem; color: var(--text-muted); }
  .strong { color: var(--text-strong); font-family: var(--font-mono); }
  .mock-track { height: 4px; border-radius: 4px; background: var(--neutral-700); }
  .mock-fill { position: relative; height: 100%; border-radius: 4px; background: var(--accent-500); }
  .mock-fill::after { content: ''; position: absolute; right: 0; top: 50%; transform: translate(50%, -50%); width: 12px; height: 12px; border: 3px solid #d8dbd0; border-radius: 50%; background: #6a7261; }
  .mock-split { display: flex; gap: 10px; }
  .mock-split span { flex: 1; height: 36px; background: var(--surface-800); border: 1px solid var(--border-700); border-radius: 6px; }
  .mock-generate { min-height: 48px; padding: 12px; border-radius: 7px; background: var(--accent-500); color: var(--accent-foreground); display: flex; align-items: center; justify-content: center; font-size: .9375rem; font-weight: 600; }
  h2 { margin: 20px 0 0; font-size: clamp(2rem, 3.4vw, 3rem); font-weight: 500; line-height: 1.12; letter-spacing: -.045em; color: var(--text-strong); text-wrap: balance; }
  .closer-points { padding: 0; margin: 36px 0 0; list-style: none; }
  .closer-points li { display: flex; gap: 20px; position: relative; padding-bottom: 28px; }
  .closer-points li:last-child { padding-bottom: 0; }
  .closer-points li:not(:last-child)::before { content: ''; position: absolute; left: 17px; top: 36px; bottom: 0; width: 1px; background: var(--border-700); }
  .num { width: 36px; height: 36px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-700); border-radius: 50%; color: var(--accent-500); font: .8125rem var(--font-mono); }
  h3 { margin: 3px 0 9px; font-size: 1.125rem; font-weight: 500; letter-spacing: -.02em; color: var(--text-strong); }
  .closer-points p { margin: 0; font-size: 1rem; line-height: 1.65; color: var(--text-muted); }
  @media (max-width: 1050px) { .closer { gap: 48px; } .closer-media { padding: 26px; } }
  @media (max-width: 800px) { .block { padding: 64px 0; } .closer { grid-template-columns: 1fr; gap: 40px; } .closer-media { max-width: 540px; width: 100%; margin-inline: auto; order: 2; } }
  @media (max-width: 420px) { .closer-media { padding: 20px; } .mock { padding: 20px; } }
</style>
