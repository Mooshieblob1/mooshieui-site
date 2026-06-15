<script>
	import { reveal } from '$lib/actions/reveal.js';

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
		<!-- on-brand CSS mock of the generate panel -->
		<div class="closer-media" use:reveal>
			<div class="mock">
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
				<div class="mock-split">
					<span></span>
					<span></span>
				</div>
				<div class="mock-generate">Generate</div>
			</div>
		</div>
		<div use:reveal>
			<span class="eyebrow">From prompt to polished</span>
			<h2>Three steps to a finished image</h2>
			<ol class="closer-points">
				{#each steps as step, i}
					<li>
						<span class="num">{i + 1}</span>
						<div>
							<h4>{step.title}</h4>
							<p>{step.body}</p>
						</div>
					</li>
				{/each}
			</ol>
		</div>
	</div>
</section>

<style>
	.block {
		padding: 86px 0;
	}
	.closer {
		display: grid;
		grid-template-columns: 0.85fr 1.15fr;
		gap: 40px;
		align-items: center;
	}
	@media (max-width: 860px) {
		.closer {
			grid-template-columns: 1fr;
			gap: 28px;
		}
	}
	.closer-media {
		border: 1px solid var(--border-700);
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: var(--surface-900);
		box-shadow: var(--shadow-panel);
		padding: 22px;
	}
	.mock {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.mock-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.mock-label {
		font-size: var(--text-xs);
		color: var(--text-muted);
	}
	.mock-badge {
		font-size: var(--text-10);
		font-weight: 600;
		padding: 2px 7px;
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--success-strong) 20%, transparent);
		color: var(--success-text);
	}
	.mock-field {
		height: 34px;
		border-radius: var(--radius-md);
		background: var(--surface-800);
		border: 1px solid var(--border-700);
		display: flex;
		align-items: center;
		padding: 0 12px;
		font-size: var(--text-sm);
		color: var(--text);
	}
	.mock-meta {
		display: flex;
		justify-content: space-between;
		margin-bottom: 7px;
		font-size: var(--text-xs);
		color: var(--text-muted);
	}
	.mock-meta .strong {
		color: var(--text-strong);
	}
	.mock-track {
		height: 6px;
		border-radius: 9999px;
		background: var(--neutral-700);
	}
	.mock-fill {
		height: 100%;
		border-radius: 9999px;
		background: var(--accent-500);
	}
	.mock-split {
		display: flex;
		gap: 8px;
	}
	.mock-split span {
		flex: 1;
		height: 30px;
		border-radius: var(--radius-md);
		background: var(--surface-800);
		border: 1px solid var(--border-700);
	}
	.mock-generate {
		height: 44px;
		margin-top: 2px;
		border-radius: var(--radius-lg);
		background: var(--accent-500);
		color: var(--accent-foreground);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: var(--text-sm);
		box-shadow: var(--shadow-accent);
	}
	.closer h2 {
		margin: 14px 0 0;
		font-size: clamp(24px, 3vw, 34px);
		font-weight: var(--weight-bold);
		letter-spacing: -0.025em;
		color: var(--text-strong);
		text-wrap: balance;
	}
	.closer-points {
		margin: 26px 0 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	.closer-points li {
		display: flex;
		gap: 14px;
	}
	.closer-points .num {
		flex-shrink: 0;
		width: 28px;
		height: 28px;
		border-radius: var(--radius-md);
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--accent-500);
		color: var(--accent-foreground);
		font-size: var(--text-xs);
		font-weight: var(--weight-bold);
	}
	.closer-points h4 {
		margin: 3px 0 4px;
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		color: var(--text-strong);
	}
	.closer-points p {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--text-muted);
		line-height: var(--leading-snug);
	}
</style>
