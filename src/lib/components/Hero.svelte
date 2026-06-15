<script>
	import Icon from '$lib/icons/Icon.svelte';
	import { reveal } from '$lib/actions/reveal.js';
	import { base } from '$app/paths';

	let showcase = $state(null);
	let win = $state(null);

	// Linear-style cursor-tracking 3D tilt + light sheen on the app window.
	function tilt(node) {
		const reduce =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const maxRX = 5.5;
		const maxRY = 7;

		function onMove(e) {
			if (reduce || e.pointerType === 'touch' || !win) return;
			const r = node.getBoundingClientRect();
			const px = (e.clientX - r.left) / r.width;
			const py = (e.clientY - r.top) / r.height;
			const ry = (px - 0.5) * 2 * maxRY;
			const rx = -(py - 0.5) * 2 * maxRX;
			node.classList.add('tilting');
			win.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
			win.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
			win.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
		}
		function onLeave() {
			node.classList.remove('tilting');
			if (win) win.style.transform = '';
		}
		node.addEventListener('pointermove', onMove);
		node.addEventListener('pointerleave', onLeave);
		return {
			destroy() {
				node.removeEventListener('pointermove', onMove);
				node.removeEventListener('pointerleave', onLeave);
			}
		};
	}
</script>

<section class="hero">
	<div class="hero-glow"></div>
	<div class="wrap hero-inner">
		<h1>All the power of ComfyUI.<br /><span class="hl">None of the node graph.</span></h1>
		<p class="sub">
			Make images. Not node graphs.
		</p>
		<div class="hero-cta">
			<a class="btn btn-primary" href="#download">
				<Icon name="download" />
				Get started
			</a>
			<a class="btn btn-secondary" href="#modes">
				<Icon name="browser" />
				Try the browser build
			</a>
		</div>
	</div>

	<div class="wrap showcase" bind:this={showcase} use:tilt use:reveal>
		<div class="window" bind:this={win}>
			<div class="window-bar">
				<div class="traffic"><i></i><i></i><i></i></div>
				<span class="window-title">
					<img src="{base}/assets/favicon.png" alt="" />MooshieUI: Generate
				</span>
				<span style="width:54px"></span>
			</div>
			<img
				class="shot"
				src="{base}/assets/app-screenshot.avif"
				alt="The MooshieUI generation workspace: a left panel with dimensions and prompts, a centered image preview, and a right panel with model and sampler controls."
			/>
			<div class="window-sheen" aria-hidden="true"></div>
		</div>
	</div>
</section>

<style>
	.hero {
		position: relative;
		padding: 76px 0 40px;
		overflow: hidden;
	}
	.hero-glow {
		position: absolute;
		top: -180px;
		left: 50%;
		transform: translateX(-50%);
		width: 900px;
		height: 520px;
		pointer-events: none;
		z-index: 0;
	}
	.hero-inner {
		position: relative;
		z-index: 1;
		text-align: center;
		max-width: 820px;
		margin: 0 auto;
	}
	.hero h1 {
		margin: 20px 0 0;
		font-size: clamp(34px, 5.6vw, 60px);
		line-height: 1.04;
		font-weight: var(--weight-bold);
		letter-spacing: -0.03em;
		color: var(--text-strong);
		text-wrap: balance;
	}
	.hero h1 :global(.hl) {
		color: var(--accent-500);
	}
	.hero .sub {
		margin: 22px auto 0;
		max-width: 600px;
		font-size: var(--text-lg);
		line-height: var(--leading-snug);
		color: var(--text-muted);
		text-wrap: pretty;
	}
	.hero-cta {
		margin-top: 30px;
		display: flex;
		gap: 12px;
		justify-content: center;
		flex-wrap: wrap;
	}

	/* ---- App window frame ---- */
	.showcase {
		position: relative;
		z-index: 1;
		margin: 50px auto 0;
		max-width: 1060px;
		perspective: 1400px;
	}
	.window {
		position: relative;
		border: 1px solid var(--border-700);
		border-radius: var(--radius-xl);
		overflow: hidden;
		background: var(--surface-900);
		box-shadow:
			0 24px 64px -18px rgba(0, 0, 0, 0.5),
			0 0 0 1px color-mix(in srgb, var(--text) 6%, transparent);
		transition:
			transform 0.45s var(--ease-out),
			box-shadow 0.45s var(--ease-out);
		transform-style: preserve-3d;
		will-change: transform;
	}
	.showcase.tilting .window {
		transition: transform 0.08s linear;
	}
	.showcase:hover .window {
		box-shadow:
			0 36px 90px -22px rgba(0, 0, 0, 0.6),
			0 0 0 1px color-mix(in srgb, var(--accent-500) 18%, transparent);
	}
	.window-bar {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 11px 14px;
		border-bottom: 1px solid var(--border-700);
		background: var(--surface-950);
	}
	.traffic {
		display: flex;
		gap: 7px;
	}
	.traffic i {
		width: 11px;
		height: 11px;
		border-radius: 9999px;
		display: block;
		background: var(--neutral-600);
	}
	.window-title {
		margin: 0 auto;
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-size: var(--text-xs);
		color: var(--text-subtle);
	}
	.window-title img {
		width: 14px;
		height: 14px;
	}
	.window .shot {
		display: block;
		width: 100%;
		height: auto;
	}
	.window-sheen {
		position: absolute;
		inset: 0;
		z-index: 3;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.45s var(--ease-out);
		background: radial-gradient(
			440px circle at var(--mx, 50%) var(--my, 0%),
			color-mix(in srgb, var(--accent-300) 28%, transparent),
			transparent 56%
		);
		mix-blend-mode: soft-light;
	}
	.showcase:hover .window-sheen {
		opacity: 1;
	}
	@media (prefers-reduced-motion: reduce) {
		.window {
			transition: none;
		}
	}
</style>
