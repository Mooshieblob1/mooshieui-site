<script>
	import { base } from '$app/paths';
	import { browser } from '$app/environment';
	import Nav from '$lib/components/Nav.svelte';
	import { onMount } from 'svelte';

	let sceneEl;
	let gummyEl;

	onMount(() => {
		if (!sceneEl || !gummyEl) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		// Gummy follows cursor
		let tx = 0, ty = 0, cx = 0, cy = 0;
		function onPointerMove(e) {
			if (e.pointerType === 'touch') return;
			const r = sceneEl.getBoundingClientRect();
			const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
			const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
			tx = Math.max(-1, Math.min(1, dx)) * 16;
			ty = Math.max(-1, Math.min(1, dy)) * 12;
		}
		window.addEventListener('pointermove', onPointerMove);

		let rafId;
		function loop() {
			cx += (tx - cx) * 0.08;
			cy += (ty - cy) * 0.08;
			gummyEl.style.marginLeft = cx.toFixed(2) + 'px';
			gummyEl.style.marginTop = cy.toFixed(2) + 'px';
			rafId = requestAnimationFrame(loop);
		}
		loop();

		// Spark travels along the live wire
		const sparkEl = sceneEl.querySelector('.spark');
		const livePath = sceneEl.querySelector('.wire .live');
		let intervalId;
		if (sparkEl && livePath && livePath.getTotalLength) {
			const len = livePath.getTotalLength();
			let t = 0;
			intervalId = setInterval(() => {
				t = (t + 0.012) % 1.25;
				const p = Math.min(t, 1);
				const pt = livePath.getPointAtLength(p * len);
				sparkEl.setAttribute('cx', pt.x);
				sparkEl.setAttribute('cy', pt.y);
				sparkEl.style.opacity = t > 1 ? 0 : (p < 0.85 ? 1 : (1 - (p - 0.85) / 0.15));
			}, 28);
		}

		return () => {
			window.removeEventListener('pointermove', onPointerMove);
			cancelAnimationFrame(rafId);
			if (intervalId) clearInterval(intervalId);
		};
	});
</script>

<svelte:head>
	<title>Page not found · MooshieUI</title>
	<meta name="description" content="That page couldn't be found. Head back to MooshieUI." />
</svelte:head>

<Nav variant="landing" />

<main>
	<div class="grid-bg" aria-hidden="true"></div>
	<div class="wrap">
		<div class="stage">

			<div class="scene" bind:this={sceneEl} aria-hidden="true">
				<svg class="wire" viewBox="0 0 360 168" preserveAspectRatio="none">
					<path class="live" d="M86 31 C 140 31, 150 70, 168 82" />
					<path class="dead" d="M274 137 C 230 137, 224 104, 210 96" />
					<circle class="spark" cx="86" cy="31" r="3.5" />
				</svg>

				<div class="node in"><span class="port"></span>Prompt</div>
				<div class="node out"><span class="port"></span>Your page</div>

				<div class="gummy" bind:this={gummyEl}>
					<img src="{base}/assets/logo.png" alt="" />
				</div>
			</div>

			<div class="code404"><span>4</span><span class="zero">0</span><span>4</span></div>
			<h1>This node isn't wired up</h1>
			<p class="sub">The page you're after got disconnected, renamed, or never existed. Let's plug you back into something that works.</p>

			<div class="actions">
				<a class="btn btn-primary" href="{base}/">
					<svg class="icn" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 12 3l9 6.5"/><path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10"/><path d="M9 21v-6h6v6"/></svg>
					Back to home
				</a>
				<a class="btn btn-secondary" href="{base}/#download">
					<svg class="icn" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/></svg>
					Start generating
				</a>
			</div>

			<nav class="quick">
				<a href="{base}/#features">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
					Features
				</a>
				<a href="{base}/build">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
					Build from source
				</a>
				<a href="https://github.com/Mooshieblob1/MooshieUI" target="_blank" rel="noopener">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.34 9.34 0 0 1 12 6.84c.85 0 1.71.12 2.51.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.03 10.03 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"/></svg>
					GitHub
				</a>
			</nav>

		</div>
	</div>
</main>

<footer class="site">
	<div class="foot-inner">
		<span class="meta">MooshieUI · a friendly front-end for ComfyUI</span>
		<span class="status"><span class="dot"></span>Error 404, page not found</span>
	</div>
</footer>

<style>
	main {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 56px 0 72px;
		position: relative;
		min-height: calc(100vh - 64px - 72px);
	}

	.wrap {
		max-width: 980px;
		margin: 0 auto;
		padding: 0 28px;
		width: 100%;
		box-sizing: border-box;
	}

	.grid-bg {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		opacity: 0.5;
		background-image:
			linear-gradient(color-mix(in srgb, var(--text) 4%, transparent) 1px, transparent 1px),
			linear-gradient(90deg, color-mix(in srgb, var(--text) 4%, transparent) 1px, transparent 1px);
		background-size: 38px 38px;
		-webkit-mask-image: radial-gradient(circle at 50% 42%, #000 0%, transparent 68%);
		mask-image: radial-gradient(circle at 50% 42%, #000 0%, transparent 68%);
	}

	.stage {
		text-align: center;
		position: relative;
		z-index: 1;
	}

	/* Node scene */
	.scene {
		width: 360px;
		max-width: 84vw;
		height: 168px;
		margin: 0 auto 8px;
		position: relative;
	}
	.node {
		position: absolute;
		display: flex;
		align-items: center;
		gap: 8px;
		height: 38px;
		padding: 0 13px;
		border-radius: var(--radius-lg);
		background: var(--surface-900);
		border: 1px solid var(--border-700);
		font-size: var(--text-xs);
		color: var(--text-muted);
		white-space: nowrap;
		box-shadow: var(--shadow-md);
	}
	.node .port {
		width: 9px;
		height: 9px;
		border-radius: 9999px;
		flex-shrink: 0;
	}
	.node.in { top: 12px; left: 0; }
	.node.in .port { background: var(--accent-500); }
	.node.out { bottom: 12px; right: 0; }
	.node.out .port {
		background: var(--neutral-600);
		box-shadow: 0 0 0 2px var(--surface-900), 0 0 0 3px var(--border-700);
	}

	.wire {
		position: absolute;
		inset: 0;
		z-index: -1;
		overflow: visible;
	}
	.wire :global(path) { fill: none; stroke-width: 2.5; stroke-linecap: round; }
	.wire :global(.live) { stroke: var(--accent-500); }
	.wire :global(.dead) { stroke: var(--neutral-600); stroke-dasharray: 5 7; }
	.wire :global(.spark) { fill: var(--accent-400); }

	.gummy {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 78px;
		height: 78px;
		transform: translate(-50%, -50%);
		z-index: 2;
		filter: drop-shadow(0 10px 18px rgba(0,0,0,0.5));
		animation: bob 4.2s var(--ease-standard, ease-in-out) infinite;
	}
	.gummy img { width: 100%; height: 100%; display: block; }

	@keyframes bob {
		0%, 100% { transform: translate(calc(-50% + var(--mx, 0px)), calc(-50% - 4px + var(--my, 0px))) rotate(-3deg); }
		50%       { transform: translate(calc(-50% + var(--mx, 0px)), calc(-50% + 5px + var(--my, 0px))) rotate(3deg); }
	}

	/* Headline */
	.code404 {
		margin: 6px 0 0;
		font-size: clamp(72px, 16vw, 150px);
		line-height: 0.9;
		font-weight: var(--weight-bold);
		letter-spacing: -0.05em;
		color: var(--text-strong);
	}
	.code404 .zero { color: var(--accent-500); }

	h1 {
		margin: 18px 0 0;
		font-size: clamp(20px, 3.4vw, 28px);
		font-weight: var(--weight-semibold);
		letter-spacing: -0.02em;
		color: var(--text-strong);
		text-wrap: balance;
	}

	p.sub {
		margin: 12px auto 0;
		max-width: 440px;
		font-size: var(--text-base);
		line-height: var(--leading-snug);
		color: var(--text-muted);
		text-wrap: pretty;
	}

	/* Actions */
	.actions {
		margin-top: 30px;
		display: flex;
		gap: 12px;
		justify-content: center;
		flex-wrap: wrap;
	}
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 9px;
		height: 46px;
		padding: 0 22px;
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		border-radius: var(--radius-lg);
		border: 1px solid transparent;
		cursor: pointer;
		text-decoration: none;
		transition: background var(--dur-fast) var(--ease-standard), transform var(--dur-fast), border-color var(--dur-fast), color var(--dur-fast);
	}
	.btn:active { transform: translateY(0.5px) scale(0.99); }
	.btn-primary {
		background: var(--accent-500);
		color: var(--accent-foreground);
		box-shadow: var(--shadow-accent);
	}
	.btn-primary:hover { background: var(--accent-400); }
	.btn-secondary {
		background: var(--surface-800);
		color: var(--text);
		border-color: var(--border-700);
	}
	.btn-secondary:hover { background: var(--neutral-700); }
	.icn { width: 18px; height: 18px; flex-shrink: 0; }

	/* Quick links */
	.quick {
		margin-top: 30px;
		display: flex;
		gap: 10px;
		justify-content: center;
		flex-wrap: wrap;
	}
	.quick a {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		height: 36px;
		padding: 0 15px;
		border-radius: var(--radius-full, 9999px);
		background: color-mix(in srgb, var(--surface-800) 60%, transparent);
		border: 1px solid var(--border-700);
		font-size: var(--text-sm);
		color: var(--text-muted);
		text-decoration: none;
		transition: color var(--dur-fast), background var(--dur-fast), border-color var(--dur-fast);
	}
	.quick a:hover {
		color: var(--text-strong);
		background: var(--surface-800);
		border-color: color-mix(in srgb, var(--accent-500) 45%, var(--border-700));
	}
	.quick svg { color: var(--text-subtle); transition: color var(--dur-fast); }
	.quick a:hover svg { color: var(--accent-400); }

	/* Footer */
	footer.site {
		padding: 26px 0;
		border-top: 1px solid var(--border-700);
	}
	.foot-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		max-width: 980px;
		margin: 0 auto;
		padding: 0 28px;
	}
	.foot-inner .meta {
		font-size: var(--text-xs);
		color: var(--text-subtle);
	}
	.foot-inner .status {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-size: var(--text-xs);
		color: var(--text-muted);
	}
	.foot-inner .status .dot {
		width: 7px;
		height: 7px;
		border-radius: 9999px;
		background: var(--success, #10b981);
	}

	@media (prefers-reduced-motion: reduce) {
		.gummy { animation: none; }
	}
</style>
