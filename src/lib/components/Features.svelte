<script>
	import Icon from '$lib/icons/Icon.svelte';
	import { motion } from '@humanspeak/svelte-motion';
	import { fadeUp } from '$lib/motion.js';

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
		<motion.div class="sec-head" {...fadeUp(0)}>
			<span class="eyebrow muted">What's inside</span>
			<h2>Everything you generate, none of the <span class="accent-serif">graph-wrangling</span></h2>
			<p>MooshieUI keeps ComfyUI's power and hides its complexity behind controls that make sense.</p>
		</motion.div>
		<div class="features">
			{#each features as f, i}
				<motion.div class="feature liquid-glass" {...fadeUp(i * 0.1)}>
					<div class="ficon"><Icon name={f.icon} /></div>
					<h3>{f.title}</h3>
					<p>{f.body}</p>
				</motion.div>
			{/each}
		</div>
	</div>
</section>

<style>
	.block {
		padding: 86px 0;
	}
	.features {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
	}
	@media (max-width: 900px) {
		.features {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (max-width: 560px) {
		.features {
			grid-template-columns: 1fr;
		}
	}
	:global(.feature) {
		border-radius: 24px;
		padding: 22px;
		transition: transform var(--dur-base);
	}
	:global(.feature:hover) {
		transform: translateY(-2px);
	}
	.ficon {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-md);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 16px;
		background: color-mix(in srgb, var(--accent-500) 12%, var(--surface-800));
		color: var(--accent-400);
		border: 1px solid color-mix(in srgb, var(--accent-500) 20%, var(--border-700));
	}
	:global(.feature h3) {
		margin: 0 0 8px;
		font-size: var(--text-base);
		font-weight: var(--weight-semibold);
		color: var(--text-strong);
	}
	:global(.feature p) {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--text-muted);
		line-height: var(--leading-snug);
	}
</style>
