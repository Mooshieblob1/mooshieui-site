<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { base } from '$app/paths';
	import Icon from '$lib/icons/Icon.svelte';
	import { Button } from '$lib/components/ui/button';
	import { STAGE_ASSETS } from '$lib/stage/assets';
	import { cleanMounds } from '$lib/stage/mounds';
	import { CameraScrubber } from '$lib/stage/cameraCache';
	import {
		QOUT,
		COUT,
		CIN,
		buildGlideSettleKeyframes,
		commitAndCancel
	} from '$lib/stage/animations';
	import { FALLBACK_TAG } from '$lib/release.js';
	import type { Release } from '$lib/types';

	let { release = null }: { release?: Release | null } = $props();

	const repo = 'https://github.com/Mooshieblob1/MooshieUI';
	const tag = $derived(release?.tag ?? FALLBACK_TAG);
	const winUrl = $derived(release?.winUrl ?? `${repo}/releases`);

	const BELOW_HASHES = new Set([
		'#features',
		'#modes',
		'#look',
		'#download',
		'#download-macos',
		'#download-linux-repo',
		'#support',
		'#top',
		'#below-stage'
	]);

	const WORD_LETTERS = ['M', 'o', 'o', 's', 'h', 'i', 'e'];
	const LETTER_DELAYS = [0, 95, 255, 210, 175, 310, 370];

	const NAV_ITEMS = [
		{ label: 'Features', target: '#features', external: false },
		{ label: 'Modes', target: '#modes', external: false },
		{ label: 'Download', target: '#download', external: false },
		{ label: 'Wiki', target: `${base}/wiki`, external: false },
		{ label: 'GitHub', target: repo, external: true }
	];

	const CAPTIONS = [
		{ num: '01', line1: 'Guided controls,', line2: 'no node wiring.' },
		{ num: '02', line1: 'Images, video,', line2: 'music and 3D.' },
		{ num: '03', line1: 'Desktop app or', line2: 'LAN web server.' },
		{ num: '04', line1: 'One-click setup,', line2: 'free & open source.' }
	];

	const CARDS = [
		{ label: 'Download', target: '#download', pos: '0 0', scroll: true },
		{ label: 'Explore App', target: '#features', pos: '100% 0', scroll: true },
		{ label: 'Read Wiki', target: `${base}/wiki`, pos: '0 100%', scroll: false }
	];

	let stageEl = $state<HTMLElement | null>(null);
	let plateH1El = $state<HTMLImageElement | null>(null);
	let plateS2El = $state<HTMLImageElement | null>(null);
	let camCanvasEl = $state<HTMLCanvasElement | null>(null);
	let fgEl = $state<HTMLDivElement | null>(null);
	let wordEl = $state<HTMLDivElement | null>(null);
	let moundLEl = $state<HTMLImageElement | null>(null);
	let moundREl = $state<HTMLImageElement | null>(null);
	let navLinkEls = $state<HTMLAnchorElement[]>([]);
	let menuBtnEl = $state<HTMLButtonElement | null>(null);
	let glyphsEl = $state<HTMLDivElement | null>(null);
	let h1SpanEl = $state<HTMLSpanElement | null>(null);
	let bodySpanEl = $state<HTMLSpanElement | null>(null);
	let vidCardEl = $state<HTMLButtonElement | null>(null);
	let playSvgEl = $state<SVGSVGElement | null>(null);
	let capRowEls = $state<HTMLDivElement[]>([]);
	let letterEls = $state<HTMLElement[]>([]);
	let s2TitleEl = $state<HTMLHeadingElement | null>(null);
	let s2BodyEl = $state<HTMLParagraphElement | null>(null);
	let s2ArrowEl = $state<HTMLAnchorElement | null>(null);
	let s2CardEls = $state<HTMLAnchorElement[]>([]);

	let isPre = $state(true);
	let mode = $state<'hero' | 's2'>('hero');
	let settledS2 = $state(false);
	let reducedMotion = $state(false);
	let locked = $state(true);
	let menuOpen = $state(false);
	let previewOpen = $state(false);

	const activeAnims: Animation[] = [];
	const scrubber = new CameraScrubber();

	let transitionTimer = 0;
	let unlockTimer = 0;
	let cameraInitTimer = 0;
	let touchStartY: number | null = null;
	let lastBelowScrollAt = 0;
	let revokeMounds: () => void = () => {};

	function track(anim: Animation | undefined | null): void {
		if (anim) activeAnims.push(anim);
	}

	function clearTimers(): void {
		if (transitionTimer) {
			window.clearTimeout(transitionTimer);
			transitionTimer = 0;
		}
		if (unlockTimer) {
			window.clearTimeout(unlockTimer);
			unlockTimer = 0;
		}
	}

	function playHeroContent(baseOffset: number, includeShell: boolean): void {
		const isFirstLoad = includeShell;

		if (isFirstLoad && plateH1El) {
			track(
				plateH1El.animate([{ transform: 'scale(1.3)' }, { transform: 'none' }], {
					duration: 1350,
					easing: QOUT,
					fill: 'both'
				})
			);
		}

		if (moundREl) {
			track(
				moundREl.animate([{ transform: 'translateX(45%)' }, { transform: 'none' }], {
					delay: baseOffset + 0,
					duration: 1700,
					easing: QOUT,
					fill: 'both'
				})
			);
		}

		if (moundLEl) {
			track(
				moundLEl.animate([{ transform: 'translateX(-45%)' }, { transform: 'none' }], {
					delay: baseOffset + 40,
					duration: 1700,
					easing: QOUT,
					fill: 'both'
				})
			);
		}

		if (isFirstLoad) {
			navLinkEls.forEach((el, i) => {
				if (!el) return;
				track(
					el.animate([{ transform: 'translateY(-110%)' }, { transform: 'none' }], {
						delay: 100 + i * 100,
						duration: 300,
						easing: COUT,
						fill: 'both'
					})
				);
			});

			if (menuBtnEl) {
				track(
					menuBtnEl.animate([{ opacity: 0 }, { opacity: 1 }], {
						delay: 530,
						duration: 200,
						easing: 'linear',
						fill: 'both'
					})
				);
			}

			if (glyphsEl) {
				track(
					glyphsEl.animate(
						[
							{ opacity: 0, transform: 'translateX(10px)' },
							{ opacity: 1, transform: 'none' }
						],
						{
							delay: 600,
							duration: 400,
							easing: COUT,
							fill: 'both'
						}
					)
				);
			}
		}

		if (h1SpanEl) {
			track(
				h1SpanEl.animate([{ transform: 'translateY(-100%)' }, { transform: 'none' }], {
					delay: baseOffset + 390,
					duration: 950,
					easing: COUT,
					fill: 'both'
				})
			);
		}

		if (bodySpanEl) {
			track(
				bodySpanEl.animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], {
					delay: baseOffset + 450,
					duration: 900,
					easing: COUT,
					fill: 'both'
				})
			);
		}

		if (vidCardEl) {
			track(
				vidCardEl.animate([{ opacity: 0 }, { opacity: 1 }], {
					delay: baseOffset + 570,
					duration: 260,
					easing: 'linear',
					fill: 'both'
				})
			);
		}

		letterEls.forEach((el, i) => {
			if (!el) return;
			const offset = LETTER_DELAYS[i] ?? i * 60;
			track(
				el.animate(
					[
						{ opacity: 0, transform: 'translateY(.06em)' },
						{ opacity: 1, transform: 'none' }
					],
					{
						delay: baseOffset + 630 + offset,
						duration: 450,
						easing: COUT,
						fill: 'both'
					}
				)
			);
		});

		if (playSvgEl) {
			track(
				playSvgEl.animate([{ opacity: 0 }, { opacity: 1 }], {
					delay: baseOffset + 970,
					duration: 230,
					easing: 'linear',
					fill: 'both'
				})
			);
		}

		const capDelays = [730, 870, 970, 1000];
		capRowEls.forEach((el, i) => {
			if (!el) return;
			track(
				el.animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], {
					delay: baseOffset + (capDelays[i] ?? 1000),
					duration: 220,
					easing: COUT,
					fill: 'both'
				})
			);
		});
	}

	function snapToS2Settled(): void {
		clearTimers();
		commitAndCancel(activeAnims);
		scrubber.cancelActive();
		stageEl?.classList.remove('cam-on');
		if (plateS2El) plateS2El.style.opacity = '1';
		isPre = false;
		mode = 's2';
		settledS2 = true;
		locked = false;
	}

	function snapToHeroSettled(): void {
		clearTimers();
		commitAndCancel(activeAnims);
		scrubber.cancelActive();
		stageEl?.classList.remove('cam-on');
		if (plateS2El) plateS2El.style.opacity = '0';
		isPre = false;
		mode = 'hero';
		settledS2 = false;
		locked = false;
	}

	function toSection2(): void {
		if (locked || mode === 's2') return;
		clearTimers();
		commitAndCancel(activeAnims);
		mode = 's2';
		settledS2 = false;

		if (reducedMotion) {
			snapToS2Settled();
			return;
		}

		locked = true;

		// Hero out
		if (h1SpanEl) {
			track(
				h1SpanEl.animate([{ transform: 'none' }, { transform: 'translateY(-100%)' }], {
					delay: 0,
					duration: 280,
					easing: CIN,
					fill: 'both'
				})
			);
		}

		if (bodySpanEl) {
			track(
				bodySpanEl.animate([{ transform: 'none' }, { transform: 'translateY(100%)' }], {
					delay: 50,
					duration: 250,
					easing: CIN,
					fill: 'both'
				})
			);
		}

		capRowEls.forEach((el, i) => {
			if (!el) return;
			track(
				el.animate([{ transform: 'none' }, { transform: 'translateY(100%)' }], {
					delay: i * 20,
					duration: 260,
					easing: CIN,
					fill: 'both'
				})
			);
		});

		if (vidCardEl) {
			track(
				vidCardEl.animate([{ opacity: 1 }, { opacity: 0 }], {
					delay: 350,
					duration: 130,
					easing: 'linear',
					fill: 'both'
				})
			);
		}

		const fgRect = fgEl?.getBoundingClientRect();
		const wordRect = wordEl?.getBoundingClientRect();
		const dropD =
			fgRect && wordRect ? Math.max(240, Math.round(fgRect.bottom - wordRect.top + 8)) : 420;

		letterEls.forEach((el, i) => {
			if (!el) return;
			track(
				el.animate([{ transform: 'none' }, { transform: `translateY(${dropD}px)` }], {
					delay: i * 58,
					duration: 450,
					easing: CIN,
					fill: 'both'
				})
			);
		});

		if (moundLEl) {
			track(
				moundLEl.animate([{ transform: 'none' }, { transform: 'translateX(-51%)' }], {
					delay: 20,
					duration: 560,
					easing: CIN,
					fill: 'both'
				})
			);
		}

		if (moundREl) {
			track(
				moundREl.animate([{ transform: 'none' }, { transform: 'translateX(51%)' }], {
					delay: 150,
					duration: 450,
					easing: CIN,
					fill: 'both'
				})
			);
		}

		// Section 2 in with exact 55-keyframe smooth-scroll curve
		const frames = buildGlideSettleKeyframes(window.innerHeight || 810, false);
		const s2Entries: Array<[HTMLElement | null, number]> = [
			[s2TitleEl, 0],
			[s2BodyEl, 100],
			[s2ArrowEl, 100],
			[s2CardEls[0] ?? null, 0],
			[s2CardEls[1] ?? null, 150],
			[s2CardEls[2] ?? null, 300]
		];

		for (const [el, lag] of s2Entries) {
			if (!el) continue;
			track(
				el.animate(frames, {
					delay: 180 + lag,
					duration: 1800,
					easing: 'linear',
					fill: 'both'
				})
			);
		}

		scrubber.runCamera(true, 550, 1700, {
			stageEl,
			s2PlateEl: plateS2El,
			reducedMotion: false,
			trackAnimation: (anim) => track(anim)
		});

		transitionTimer = window.setTimeout(() => {
			settledS2 = true;
			locked = false;
		}, 2300);
	}

	function toHero(): void {
		if (locked || mode === 'hero') return;
		clearTimers();
		commitAndCancel(activeAnims);
		settledS2 = false;
		mode = 'hero';

		if (reducedMotion) {
			snapToHeroSettled();
			return;
		}

		locked = true;

		const frames = buildGlideSettleKeyframes(window.innerHeight || 810, true);
		const s2Reverse: Array<[HTMLElement | null, number]> = [
			[s2TitleEl, 100],
			[s2BodyEl, 0],
			[s2ArrowEl, 0],
			[s2CardEls[0] ?? null, 300],
			[s2CardEls[1] ?? null, 150],
			[s2CardEls[2] ?? null, 0]
		];

		for (const [el, lag] of s2Reverse) {
			if (!el) continue;
			track(
				el.animate(frames, {
					delay: lag,
					duration: 1800,
					easing: 'linear',
					fill: 'both'
				})
			);
		}

		scrubber.runCamera(false, 200, 1700, {
			stageEl,
			s2PlateEl: plateS2El,
			reducedMotion: false,
			trackAnimation: (anim) => track(anim)
		});

		playHeroContent(800, false);

		transitionTimer = window.setTimeout(() => {
			locked = false;
		}, 2300);
	}

	function jumpBelow(selector: string): void {
		menuOpen = false;
		previewOpen = false;
		snapToS2Settled();
		requestAnimationFrame(() => {
			const target = document.querySelector(selector);
			if (target instanceof HTMLElement) {
				target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
			}
		});
	}

	function handleNavClick(event: MouseEvent, target: string, external: boolean): void {
		if (external) return;
		if (target.startsWith('#')) {
			event.preventDefault();
			jumpBelow(target);
		}
	}

	function handleBrandClick(event: MouseEvent): void {
		event.preventDefault();
		menuOpen = false;
		previewOpen = false;
		if (window.scrollY > 4) {
			window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
		}
		if (mode === 's2' && !locked) {
			toHero();
		}
	}

	function handleWheel(event: WheelEvent): void {
		if (previewOpen || menuOpen) return;
		if (window.scrollY > 2) return;

		if (locked) {
			event.preventDefault();
			return;
		}

		if (mode === 'hero') {
			event.preventDefault();
			if (event.deltaY > 4) {
				toSection2();
			}
			return;
		}

		// Mode === 's2' at top of document:
		// Upward wheel reverses to Hero; downward wheel passes cleanly into below-stage content.
		if (event.deltaY < -4) {
			event.preventDefault();
			if (performance.now() - lastBelowScrollAt < 450) {
				return;
			}
			toHero();
		}
	}

	function handleTouchStart(event: TouchEvent): void {
		if (previewOpen || menuOpen) {
			touchStartY = null;
			return;
		}
		touchStartY = event.touches[0]?.clientY ?? null;
	}

	function handleTouchMove(event: TouchEvent): void {
		if (previewOpen || menuOpen || touchStartY === null) return;
		if (window.scrollY > 2) return;

		const curY = event.touches[0]?.clientY;
		if (curY === undefined) return;
		const dy = touchStartY - curY; // positive = swipe up (scroll down)

		if (locked) {
			event.preventDefault();
			return;
		}

		if (mode === 'hero') {
			event.preventDefault();
			if (dy > 30) {
				touchStartY = null;
				toSection2();
			}
			return;
		}

		if (dy < -30) {
			event.preventDefault();
			if (performance.now() - lastBelowScrollAt < 450) {
				return;
			}
			touchStartY = null;
			toHero();
		}
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			if (previewOpen) {
				previewOpen = false;
				vidCardEl?.focus();
				return;
			}
			if (menuOpen) {
				menuOpen = false;
				menuBtnEl?.focus();
				return;
			}
		}

		if (previewOpen || menuOpen) return;
		const activeTag = (event.target as HTMLElement | null)?.tagName;
		if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') return;
		if (window.scrollY > 2) return;

		if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') {
			if (mode === 'hero') {
				event.preventDefault();
				toSection2();
			}
		} else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
			if (mode === 's2') {
				event.preventDefault();
				toHero();
			}
		}
	}

	function handleScroll(): void {
		if (window.scrollY > 4) {
			lastBelowScrollAt = performance.now();
			if (mode === 'hero' || !settledS2) {
				snapToS2Settled();
			}
		}
	}

	onMount(() => {
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		reducedMotion = motionQuery.matches;
		const onMotionChange = (e: MediaQueryListEvent) => {
			reducedMotion = e.matches;
		};
		motionQuery.addEventListener('change', onMotionChange);

		if (camCanvasEl) {
			scrubber.attachCanvas(camCanvasEl);
		}

		if (STAGE_ASSETS.cameraVideoUrl) {
			cameraInitTimer = window.setTimeout(() => {
				void scrubber.loadVideo(STAGE_ASSETS.cameraVideoUrl);
			}, 1200);
		}

		window.addEventListener('wheel', handleWheel, { passive: false });
		window.addEventListener('touchstart', handleTouchStart, { passive: true });
		window.addEventListener('touchmove', handleTouchMove, { passive: false });
		window.addEventListener('scroll', handleScroll, { passive: true });

		// If visitor arrived on a below-the-fold anchor (#download, #features, etc.),
		// settle immediately into Section 2 and allow normal scroll positioning.
		if (window.location.hash && BELOW_HASHES.has(window.location.hash)) {
			snapToS2Settled();
			const target = document.querySelector(window.location.hash);
			if (target instanceof HTMLElement) {
				requestAnimationFrame(() => {
					target.scrollIntoView({ behavior: 'auto' });
				});
			}
			return () => {
				motionQuery.removeEventListener('change', onMotionChange);
				window.removeEventListener('wheel', handleWheel);
				window.removeEventListener('touchstart', handleTouchStart);
				window.removeEventListener('touchmove', handleTouchMove);
				window.removeEventListener('scroll', handleScroll);
			};
		}

		if (reducedMotion) {
			isPre = false;
			locked = false;
			return () => {
				motionQuery.removeEventListener('change', onMotionChange);
				window.removeEventListener('wheel', handleWheel);
				window.removeEventListener('touchstart', handleTouchStart);
				window.removeEventListener('touchmove', handleTouchMove);
				window.removeEventListener('scroll', handleScroll);
			};
		}

		let introStarted = false;
		let destroyed = false;

		const startIntro = () => {
			if (introStarted || destroyed) return;
			introStarted = true;
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					if (destroyed) return;
					isPre = false;
					playHeroContent(0, true);
					unlockTimer = window.setTimeout(() => {
						locked = false;
					}, 1450);
				});
			});
		};

		const failsafeTimer = window.setTimeout(startIntro, 2500);

		const heroDecode = plateH1El
			? typeof plateH1El.decode === 'function'
				? plateH1El.decode().catch(() => {})
				: Promise.resolve()
			: Promise.resolve();

		const moundTargets = [moundLEl, moundREl].filter((el): el is HTMLImageElement => Boolean(el));
		const moundsReady = cleanMounds(STAGE_ASSETS.mounds, moundTargets).then((cleanup) => {
			revokeMounds = cleanup;
		});

		const fontsReady =
			document.fonts?.ready.catch(() => {}) ?? Promise.resolve();

		Promise.all([fontsReady, heroDecode, moundsReady]).then(() => {
			window.clearTimeout(failsafeTimer);
			startIntro();
		});

		return () => {
			destroyed = true;
			window.clearTimeout(failsafeTimer);
			motionQuery.removeEventListener('change', onMotionChange);
			window.removeEventListener('wheel', handleWheel);
			window.removeEventListener('touchstart', handleTouchStart);
			window.removeEventListener('touchmove', handleTouchMove);
			window.removeEventListener('scroll', handleScroll);
		};
	});

	onDestroy(() => {
		clearTimers();
		if (cameraInitTimer) window.clearTimeout(cameraInitTimer);
		commitAndCancel(activeAnims);
		scrubber.destroy();
		revokeMounds();
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<a
	class="skip-link"
	href="#below-stage"
	onclick={(e) => {
		e.preventDefault();
		jumpBelow('#below-stage');
	}}>Skip to downloads &amp; features</a
>

<div class="stage-host">
	<div
		bind:this={stageEl}
		class="stage"
		class:pre={isPre}
		class:is-s2={mode === 's2' && settledS2}
		class:rm={reducedMotion}
	>
		<!-- 1. Hero plate -->
		<img
			bind:this={plateH1El}
			class="plate plate-h1"
			src={STAGE_ASSETS.heroPlate}
			alt=""
			fetchpriority="high"
			decoding="async"
		/>

		<!-- 2. Section 2 plate -->
		<img
			bind:this={plateS2El}
			class="plate plate-s2"
			src={STAGE_ASSETS.section2Plate}
			alt=""
			decoding="async"
		/>

		<!-- 3. Camera scrub canvas -->
		<canvas bind:this={camCanvasEl} class="cam" width="1280" height="720" aria-hidden="true"></canvas>

		<!-- 4. Shade -->
		<div class="shade" aria-hidden="true"></div>

		<!-- 5. Foreground: giant word behind mounds -->
		<div bind:this={fgEl} class="fg" aria-hidden="true">
			<div bind:this={wordEl} class="word">
				<span>
					{#each WORD_LETTERS as ch, i}
						<i bind:this={letterEls[i]}>{ch}</i>
					{/each}
				</span>
			</div>
			<img
				bind:this={moundLEl}
				class="mounds mound-l"
				src={STAGE_ASSETS.mounds}
				alt=""
				crossorigin="anonymous"
			/>
			<img
				bind:this={moundREl}
				class="mounds mound-r"
				src={STAGE_ASSETS.mounds}
				alt=""
				crossorigin="anonymous"
			/>
		</div>

		<!-- 6. Top Nav -->
		<header class="stage-nav">
			<a
				class="stage-logo"
				href="{base}/"
				aria-label="MooshieUI home"
				onclick={handleBrandClick}
			>
				<svg viewBox="0 0 56 56" fill="none" aria-hidden="true">
					<circle cx="28" cy="28" r="26" stroke="#EDE3DA" stroke-width="1.6" />
					<circle
						cx="28"
						cy="28"
						r="21"
						stroke="#ffcc00"
						stroke-opacity="0.58"
						stroke-width="0.8"
						stroke-dasharray="1.5 3"
					/>
					<path
						d="M17 37V19L28 30L39 19V37"
						stroke="#EDE3DA"
						stroke-width="2.6"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<circle cx="17" cy="19" r="2.7" fill="#ffcc00" />
					<circle cx="17" cy="37" r="2.7" fill="#ffcc00" />
					<circle cx="28" cy="30" r="2.7" fill="#ffcc00" />
					<circle cx="39" cy="19" r="2.7" fill="#ffcc00" />
					<circle cx="39" cy="37" r="2.7" fill="#ffcc00" />
				</svg>
			</a>

			<ul class="stage-links">
				{#each NAV_ITEMS as item, i}
					<li>
						<a
							bind:this={navLinkEls[i]}
							href={item.target}
							target={item.external ? '_blank' : undefined}
							rel={item.external ? 'noopener' : undefined}
							onclick={(e) => handleNavClick(e, item.target, item.external)}
						>
							{item.label}
						</a>
					</li>
				{/each}
			</ul>

			<button
				bind:this={menuBtnEl}
				type="button"
				class="stage-menu"
				aria-label={menuOpen ? 'Close menu' : 'Menu'}
				aria-expanded={menuOpen}
				aria-controls="stage-drawer"
				onclick={() => (menuOpen = !menuOpen)}
			>
				<span></span>
				<span></span>
			</button>
		</header>

		<!-- 7. Left Glyph Column -->
		<div bind:this={glyphsEl} class="glyphs" aria-hidden="true">
			<!-- Dagger cross -->
			<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25">
				<line x1="8" y1="2" x2="8" y2="14" />
				<line x1="4.5" y1="5" x2="11.5" y2="5" />
			</svg>
			<!-- Diamond outline -->
			<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25">
				<polygon points="8,2 14,8 8,14 2,8" />
			</svg>
			<!-- Plus -->
			<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25">
				<line x1="8" y1="2" x2="8" y2="14" />
				<line x1="2" y1="8" x2="14" y2="8" />
			</svg>
			<!-- Four dots around center dot -->
			<svg viewBox="0 0 16 16" fill="currentColor">
				<circle cx="8" cy="8" r="1.4" />
				<circle cx="8" cy="3" r="1.1" />
				<circle cx="8" cy="13" r="1.1" />
				<circle cx="3" cy="8" r="1.1" />
				<circle cx="13" cy="8" r="1.1" />
			</svg>
			<!-- Eight-spoke asterisk -->
			<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.15">
				<line x1="8" y1="1.8" x2="8" y2="14.2" />
				<line x1="1.8" y1="8" x2="14.2" y2="8" />
				<line x1="3.6" y1="3.6" x2="12.4" y2="12.4" />
				<line x1="12.4" y1="3.6" x2="3.6" y2="12.4" />
			</svg>
			<!-- Filled four-point star -->
			<svg viewBox="0 0 16 16" fill="currentColor">
				<path d="M8 1.5 9.7 6.3 14.5 8 9.7 9.7 8 14.5 6.3 9.7 1.5 8 6.3 6.3Z" />
			</svg>
			<!-- Triangle with bar inside -->
			<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2">
				<polygon points="8,2.5 14,13.5 2,13.5" />
				<line x1="5.2" y1="9.8" x2="10.8" y2="9.8" />
			</svg>
		</div>

		<!-- 8. Hero Section (State 1) -->
		<section class="h1" aria-label="MooshieUI introduction">
			<h1 class="hero-title">
				<span bind:this={h1SpanEl}>All of ComfyUI. None of the node graph.</span>
			</h1>
			<p class="hero-body">
				<span bind:this={bodySpanEl}
					>A guided desktop and web studio for images, video, music, and 3D. Free and open source.</span
				>
			</p>
			<button
				bind:this={vidCardEl}
				type="button"
				class="vid-card"
				aria-label="Preview MooshieUI workspace"
				onclick={() => (previewOpen = true)}
			>
				<span
					class="vid-bg"
					style="background-image: url('{STAGE_ASSETS.cardsSheet}');"
					aria-hidden="true"
				></span>
				<svg bind:this={playSvgEl} id="play" viewBox="0 0 24 24" aria-hidden="true">
					<polygon points="7,4 19,12 7,20" fill="none" stroke="#EDE3DA" stroke-width="1.4" />
				</svg>
			</button>

			<div class="captions">
				{#each CAPTIONS as cap, i}
					<div class="cap cap-{i + 1}">
						<div bind:this={capRowEls[i]} class="mi">
							<span class="cap-num">{cap.num}</span>
							<span class="cap-txt">{cap.line1}<br />{cap.line2}</span>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- 9. Section 2 (State 2) -->
		<section class="s2" aria-label="MooshieUI highlights">
			<h2 bind:this={s2TitleEl} class="s2-title">
				Create with<br />full control,<br />zero clutter.
			</h2>
			<p bind:this={s2BodyEl} class="s2-body">
				Step into a workspace built for making, not troubleshooting. Stack LoRAs and Artist
				Styles, run tiled OmniSR upscaling, generate locally with ComfyUI or optionally connect
				NovelAI, and launch the exact same interface from your desktop or any phone on your network.
			</p>
			<a
				bind:this={s2ArrowEl}
				class="s2-arrow"
				href="#download"
				aria-label="Scroll to downloads"
				onclick={(e) => {
					e.preventDefault();
					jumpBelow('#download');
				}}
			>
				<svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
					<line x1="3" y1="23" x2="23" y2="3" />
					<polyline points="8,3 23,3 23,18" />
				</svg>
			</a>

			<div class="s2-cards">
				{#each CARDS as card, i}
					<a
						bind:this={s2CardEls[i]}
						class="s2-card"
						href={card.target}
						onclick={(e) => {
							if (card.scroll) {
								e.preventDefault();
								jumpBelow(card.target);
							}
						}}
					>
						<span
							class="s2-card-bg"
							style="background-image: url('{STAGE_ASSETS.cardsSheet}'); background-position: {card.pos};"
							aria-hidden="true"
						></span>
						<span class="s2-card-shade" aria-hidden="true"></span>
						<span class="s2-card-label">{card.label}</span>
					</a>
				{/each}
			</div>

			<button
				type="button"
				class="state-cue below-cue"
				onclick={() => jumpBelow('#below-stage')}
			>
				<span>Scroll for downloads &amp; specs</span>
				<Icon name="chevron-down" size={14} />
			</button>
		</section>
	</div>
</div>

<!-- Menu Drawer -->
{#if menuOpen}
	<div class="overlay-backdrop">
		<button
			type="button"
			class="backdrop-hit"
			aria-label="Close menu"
			onclick={() => (menuOpen = false)}
		></button>
		<nav id="stage-drawer" class="drawer" aria-label="Quick navigation">
			<div class="drawer-head">
				<span class="drawer-brand">Mooshie<b>UI</b> <small>{tag}</small></span>
				<button
					type="button"
					class="drawer-close"
					aria-label="Close menu"
					onclick={() => (menuOpen = false)}
				>
					<Icon name="close" size={20} />
				</button>
			</div>
			<div class="drawer-links">
				<button
					type="button"
					onclick={() => {
						menuOpen = false;
						if (window.scrollY > 4) window.scrollTo({ top: 0, behavior: 'smooth' });
						if (mode === 's2') toHero();
					}}
				>
					Stage Hero
				</button>
				<button
					type="button"
					onclick={() => {
						menuOpen = false;
						if (window.scrollY > 4) window.scrollTo({ top: 0, behavior: 'smooth' });
						if (mode === 'hero') toSection2();
					}}
				>
					Studio Showcase
				</button>
				<a href="#features" onclick={(e) => handleNavClick(e, '#features', false)}>Features</a>
				<a href="#modes" onclick={(e) => handleNavClick(e, '#modes', false)}>How it runs</a>
				<a href="#look" onclick={(e) => handleNavClick(e, '#look', false)}>A closer look</a>
				<a href="#download" onclick={(e) => handleNavClick(e, '#download', false)}>Download ({tag})</a>
				<a href="#support" onclick={(e) => handleNavClick(e, '#support', false)}>Support</a>
				<div class="drawer-sep"></div>
				<a href="{base}/wiki" onclick={() => (menuOpen = false)}>Wiki</a>
				<a href="{base}/docker" onclick={() => (menuOpen = false)}>Docker Guide</a>
				<a href="{base}/build" onclick={() => (menuOpen = false)}>Build from Source</a>
				<a href={repo} target="_blank" rel="noopener">GitHub Repo</a>
			</div>
			<div class="drawer-foot">
				<Button href={winUrl} class="w-full" onclick={() => (menuOpen = false)}>
					<Icon name="download" size={16} />Download {tag}
				</Button>
			</div>
		</nav>
	</div>
{/if}

<!-- Workspace Preview Modal -->
{#if previewOpen}
	<div class="overlay-backdrop modal-center">
		<button
			type="button"
			class="backdrop-hit"
			aria-label="Close workspace preview"
			onclick={() => (previewOpen = false)}
		></button>
		<div
			class="preview-modal"
			role="dialog"
			aria-modal="true"
			aria-labelledby="preview-modal-title"
			tabindex="-1"
		>
			<div class="modal-head">
				<div>
					<span class="modal-eyebrow">MooshieUI Desktop &amp; Browser App · {tag}</span>
					<h2 id="preview-modal-title">Make images. Not node graphs.</h2>
				</div>
				<button
					type="button"
					class="drawer-close"
					aria-label="Close workspace preview"
					onclick={() => (previewOpen = false)}
				>
					<Icon name="close" size={20} />
				</button>
			</div>
			<div class="modal-media">
				<img
					src={STAGE_ASSETS.appScreenshot}
					width="1718"
					height="1360"
					alt="MooshieUI generation workspace with prompt controls, a generated illustration, NovelAI settings, and saved characters."
				/>
			</div>
			<div class="modal-foot">
				<p>
					Desktop builds for Windows, Linux, and Apple Silicon, or self-host the exact same UI in
					Docker over your LAN.
				</p>
				<div class="modal-actions">
					<Button href="#download" onclick={() => jumpBelow('#download')}>
						<Icon name="download" size={16} />Download
					</Button>
					<Button variant="secondary" href="#features" onclick={() => jumpBelow('#features')}>
						Explore below
					</Button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.stage-host {
		position: relative;
		width: 100%;
		height: 100vh;
		height: 100dvh;
		overflow: hidden;
		background: var(--bg, #0a0a0a);
		container-type: size;
		color: #EDE3DA;
		overscroll-behavior: none;
	}

	.stage {
		--u: min(calc(100vw / 1440), calc(100vh / 810));
		--s: calc(100vw / 1440);
		--mb: 0px;
		--st-deep: #0a0a0a;
		--st-dark: #18181b;
		--st-accent: var(--accent-500, #ffcc00);
		--st-light: #EDE3DA;
		--stage-ease-out: cubic-bezier(.16, 1, .3, 1);

		position: absolute;
		inset: 0;
		overflow: hidden;
		background: var(--st-deep);
		font-family: 'Hanken Grotesk', system-ui, -apple-system, sans-serif;
		-webkit-font-smoothing: antialiased;
	}

	@supports (width: 1cqw) {
		.stage {
			--u: min(calc(100cqw / 1440), calc(100cqh / 810));
			--s: calc(100cqw / 1440);
		}
	}

	/* Preload isolation */
	.stage.pre .h1,
	.stage.pre .s2,
	.stage.pre .stage-nav ul,
	.stage.pre .stage-menu,
	.stage.pre .glyphs,
	.stage.pre .fg {
		opacity: 0;
	}
	.stage.pre .plate-h1 {
		transform: scale(1.3);
	}

	/* Layers 1-3: Plates & Camera Canvas */
	.plate,
	.cam {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		transform-origin: center;
		pointer-events: none;
		user-select: none;
	}

	.plate-s2,
	.cam {
		opacity: 0;
	}
	:global(.stage.cam-on) .cam {
		opacity: 1;
	}
	.stage.is-s2 .plate-s2 {
		opacity: 1;
	}

	/* Layer 4: Shade */
	.shade {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: linear-gradient(
			180deg,
			rgba(10, 10, 10, 0.72) 0%,
			rgba(10, 10, 10, 0.18) 22%,
			rgba(10, 10, 10, 0) 40%,
			rgba(10, 10, 10, 0) 75%,
			rgba(10, 10, 10, 0.35) 100%
		);
	}

	/* Layer 5: Foreground giant word + obsidian mounds */
	.fg {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: calc(810 * var(--s));
		overflow: hidden;
		pointer-events: none;
	}

	.word {
		position: absolute;
		left: calc(6 * var(--s));
		top: calc(436 * var(--s));
		font-family: 'Archivo Wide', sans-serif;
		font-stretch: 125%;
		font-weight: 600;
		font-size: calc(272 * var(--s));
		line-height: 1;
		letter-spacing: -0.045em;
		color: var(--st-light);
		white-space: nowrap;
		user-select: none;
	}
	.word > span {
		display: inline-block;
		transform: scaleX(1.04);
		transform-origin: top left;
	}
	.word i {
		display: inline-block;
		font-style: normal;
	}

	.mounds {
		position: absolute;
		left: 0;
		bottom: 0;
		width: 100%;
		height: calc(810 * var(--s) * 0.54 + var(--mb));
		object-fit: fill;
		pointer-events: none;
		user-select: none;
	}
	.mound-l {
		clip-path: inset(0 50% 0 0);
	}
	.mound-r {
		clip-path: inset(0 0 0 50%);
	}

	/* Layer 6: Top Nav */
	.stage-nav {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		z-index: 5;
		height: calc(86 * var(--u));
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 calc(30 * var(--u)) 0 calc(26 * var(--u));
	}

	.stage-logo {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: max(40px, calc(52 * var(--u)));
		height: max(40px, calc(52 * var(--u)));
		flex-shrink: 0;
		border-radius: 999px;
		transition: transform 0.25s var(--stage-ease-out);
	}
	.stage-logo:hover {
		transform: scale(1.04);
	}
	.stage-logo svg {
		width: 100%;
		height: 100%;
		display: block;
	}

	.stage-links {
		position: absolute;
		left: calc(436 * var(--u));
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		gap: calc(80 * var(--u));
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.stage-links li {
		overflow: hidden;
	}
	.stage-links a {
		display: inline-block;
		padding: 6px 0;
		line-height: 14px;
		font-size: max(11px, calc(12.5 * var(--u)));
		font-weight: 500;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: var(--st-light);
		opacity: 0.92;
		transition: opacity 0.3s, color 0.25s;
		white-space: nowrap;
	}
	.stage-links a:hover,
	.stage-links a:focus-visible {
		opacity: 1;
		color: var(--st-accent);
	}

	.stage-menu {
		width: max(28px, calc(32 * var(--u)));
		height: max(28px, calc(24 * var(--u)));
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: stretch;
		gap: max(6px, calc(9 * var(--u)));
		background: none;
		border: 0;
		padding: 0;
		cursor: pointer;
	}
	.stage-menu span {
		display: block;
		width: 100%;
		height: 1.5px;
		background: var(--st-light);
		transition: background-color 0.25s;
	}
	.stage-menu:hover span {
		background: var(--st-accent);
	}

	/* Layer 7: Glyph Column */
	.glyphs {
		position: absolute;
		z-index: 4;
		left: calc(32 * var(--u));
		top: calc(211 * var(--u));
		display: flex;
		flex-direction: column;
		gap: calc(13.8 * var(--u));
		color: rgba(237, 227, 218, 0.8);
		pointer-events: none;
	}
	.glyphs svg {
		width: max(11px, calc(17 * var(--u)));
		height: max(11px, calc(17 * var(--u)));
		display: block;
	}

	/* Layer 8: Hero Section */
	.h1 {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.stage.is-s2 .h1 {
		opacity: 0;
		pointer-events: none;
	}

	.hero-title {
		position: absolute;
		left: calc(38 * var(--u));
		top: calc(93 * var(--u));
		margin: 0;
		overflow: hidden;
		padding-bottom: 0.08em;
		font-family: 'Archivo Wide', sans-serif;
		font-stretch: 100%;
		font-weight: 400;
		font-size: calc(46 * var(--u));
		line-height: 1.2;
		letter-spacing: -0.012em;
		word-spacing: 0.1em;
		text-transform: uppercase;
		white-space: nowrap;
		color: var(--st-light);
	}
	.hero-title span {
		display: block;
	}

	.hero-body {
		position: absolute;
		left: calc(1210 * var(--u));
		top: calc(99 * var(--u));
		width: calc(194 * var(--u));
		margin: 0;
		overflow: hidden;
		font-size: max(11px, calc(12.6 * var(--u)));
		line-height: 1.36;
		color: rgba(237, 227, 218, 0.86);
	}
	.hero-body span {
		display: block;
	}

	.vid-card {
		position: absolute;
		left: calc(92 * var(--u));
		top: calc(206 * var(--u));
		width: calc(164 * var(--u));
		height: calc(114 * var(--u));
		border: 1px solid rgba(237, 227, 218, 0.18);
		background: var(--st-dark);
		overflow: hidden;
		padding: 0;
		cursor: pointer;
		pointer-events: auto;
		display: grid;
		place-items: center;
		transition: border-color 0.3s;
	}
	.vid-card:hover {
		border-color: var(--st-accent);
	}
	.vid-bg {
		position: absolute;
		inset: 0;
		background-size: 200% 200%;
		background-position: 100% 100%;
		transition: transform 0.8s var(--stage-ease-out);
	}
	.vid-card:hover .vid-bg {
		transform: scale(1.06);
	}
	.vid-card::after {
		content: '';
		position: absolute;
		inset: 0;
		background: rgba(10, 10, 10, 0.18);
		pointer-events: none;
	}
	#play {
		position: relative;
		z-index: 1;
		width: max(16px, calc(26 * var(--u)));
		height: max(16px, calc(26 * var(--u)));
	}

	.captions {
		position: absolute;
		left: 0;
		right: 0;
		bottom: calc(14 * var(--u));
		height: calc(40 * var(--u));
		pointer-events: none;
	}
	.cap {
		position: absolute;
		bottom: 0;
		overflow: hidden;
	}
	.cap-1 {
		left: calc(37 * var(--u));
	}
	.cap-2 {
		left: calc(411 * var(--u));
	}
	.cap-3 {
		left: calc(786 * var(--u));
	}
	.cap-4 {
		left: calc(1173 * var(--u));
	}
	.mi {
		display: flex;
		align-items: center;
		gap: calc(14 * var(--u));
	}
	.cap-num {
		font-family: 'Archivo Wide', sans-serif;
		font-stretch: 104%;
		font-weight: 300;
		font-size: calc(33.3 * var(--u));
		line-height: 1;
		color: var(--st-light);
	}
	.cap-txt {
		border-left: 1px solid rgba(237, 227, 218, 0.4);
		padding-left: calc(12 * var(--u));
		font-size: max(11px, calc(11.6 * var(--u)));
		line-height: 1.3;
		color: rgba(237, 227, 218, 0.82);
		white-space: nowrap;
	}

	/* Layer 9: Section 2 */
	.s2 {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.stage.is-s2 .s2 a,
	.stage.is-s2 .s2 button {
		pointer-events: auto;
	}

	.s2-title,
	.s2-body,
	.s2-arrow,
	.s2-card {
		opacity: 0;
	}
	.stage.is-s2 .s2-title,
	.stage.is-s2 .s2-body,
	.stage.is-s2 .s2-arrow,
	.stage.is-s2 .s2-card {
		opacity: 1;
	}

	.s2-title {
		position: absolute;
		left: calc(74 * var(--u));
		top: calc(124 * var(--u));
		margin: 0;
		font-family: 'Archivo Wide', sans-serif;
		font-stretch: 90%;
		font-weight: 400;
		font-size: calc(37.7 * var(--u));
		line-height: calc(43 * var(--u));
		text-transform: uppercase;
		color: var(--st-light);
	}

	.s2-body {
		position: absolute;
		left: calc(74 * var(--u));
		top: calc(289 * var(--u));
		width: calc(246 * var(--u));
		margin: 0;
		font-size: max(11px, calc(14.2 * var(--u)));
		line-height: 1.5;
		color: rgba(237, 227, 218, 0.86);
	}

	.s2-arrow {
		position: absolute;
		left: calc(73 * var(--u));
		top: calc(472 * var(--u));
		width: max(24px, calc(26 * var(--u)));
		height: max(24px, calc(26 * var(--u)));
		color: var(--st-light);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: color 0.25s, transform 0.3s var(--stage-ease-out);
	}
	.s2-arrow:hover {
		color: var(--st-accent);
		transform: translate(3px, -3px);
	}
	.s2-arrow svg {
		width: 100%;
		height: 100%;
		display: block;
	}

	.s2-cards {
		position: absolute;
		left: calc(704 * var(--u));
		top: calc(480 * var(--u));
		display: flex;
		gap: calc(19 * var(--u));
	}

	.s2-card {
		position: relative;
		width: calc(216 * var(--u));
		height: calc(246 * var(--u));
		background: var(--st-dark);
		border: 1px solid rgba(237, 227, 218, 0.12);
		overflow: hidden;
		display: block;
		transition: border-color 0.3s;
	}
	.s2-card:hover {
		border-color: color-mix(in srgb, var(--st-accent) 60%, transparent);
	}
	.s2-card-bg {
		position: absolute;
		inset: 0;
		background-size: 200% 200%;
		transition: transform 0.9s var(--stage-ease-out);
	}
	.s2-card:hover .s2-card-bg {
		transform: scale(1.05);
	}
	.s2-card-shade {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba(10, 10, 10, 0) 55%, rgba(10, 10, 10, 0.62) 100%);
		pointer-events: none;
	}
	.s2-card-label {
		position: absolute;
		left: calc(16 * var(--u));
		bottom: calc(14 * var(--u));
		font-size: max(11px, calc(16.5 * var(--u)));
		font-weight: 500;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: var(--st-light);
	}

	/* Scroll / state transition cue */
	.state-cue {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		border: 1px solid rgba(237, 227, 218, 0.16);
		border-radius: 999px;
		background: rgba(10, 10, 10, 0.56);
		backdrop-filter: blur(8px);
		color: rgba(237, 227, 218, 0.8);
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		cursor: pointer;
		pointer-events: auto;
		opacity: 0;
		transition: opacity 0.35s, border-color 0.25s, color 0.25s;
	}
	.below-cue {
		bottom: calc(14 * var(--u));
		white-space: nowrap;
	}
	.stage.is-s2 .below-cue {
		opacity: 0.9;
	}
	.stage.pre .state-cue {
		opacity: 0;
		pointer-events: none;
	}
	.state-cue:hover {
		opacity: 1;
		border-color: var(--st-accent);
		color: var(--st-accent);
	}

	/* Reduced Motion */
	.stage.rm .s2-card-bg,
	.stage.rm .vid-bg {
		transition: none;
	}
	.stage.rm.is-s2 .fg {
		opacity: 0;
		pointer-events: none;
	}

	/* Drawer & Workspace Modal */
	.overlay-backdrop {
		position: fixed;
		inset: 0;
		z-index: 90;
		background: rgba(0, 0, 0, 0.68);
		backdrop-filter: blur(8px);
		display: flex;
		justify-content: flex-end;
	}
	.backdrop-hit {
		position: absolute;
		inset: 0;
		border: 0;
		background: transparent;
		padding: 0;
		cursor: default;
	}
	.overlay-backdrop.modal-center {
		justify-content: center;
		align-items: center;
		padding: 20px;
	}

	.drawer {
		position: relative;
		z-index: 1;
		width: min(360px, 90vw);
		height: 100%;
		background: var(--surface-900);
		border-left: 1px solid var(--border-700);
		display: flex;
		flex-direction: column;
		padding: 22px;
	}
	.drawer-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 16px;
		border-bottom: 1px solid var(--border-700);
	}
	.drawer-brand {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--text-strong);
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}
	.drawer-brand b {
		color: var(--accent-500);
	}
	.drawer-brand small {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--text-muted);
	}
	.drawer-close {
		width: 36px;
		height: 36px;
		display: grid;
		place-items: center;
		border-radius: var(--radius-md);
		border: 1px solid var(--border-700);
		background: var(--surface-800);
		color: var(--text-muted);
		cursor: pointer;
	}
	.drawer-close:hover {
		color: var(--text-strong);
		border-color: var(--accent-500);
	}

	.drawer-links {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding-block: 16px;
		flex: 1;
		overflow-y: auto;
	}
	.drawer-links a,
	.drawer-links button {
		text-align: left;
		padding: 10px 12px;
		border-radius: var(--radius-md);
		border: 0;
		background: none;
		color: var(--text);
		font-size: 0.9375rem;
		font-weight: 500;
		cursor: pointer;
	}
	.drawer-links a:hover,
	.drawer-links button:hover {
		background: var(--surface-800);
		color: var(--accent-500);
	}
	.drawer-sep {
		height: 1px;
		margin-block: 8px;
		background: var(--border-700);
	}
	.drawer-foot {
		padding-top: 14px;
		border-top: 1px solid var(--border-700);
	}

	.preview-modal {
		position: relative;
		z-index: 1;
		width: min(920px, 100%);
		max-height: 90dvh;
		display: flex;
		flex-direction: column;
		background: var(--surface-900);
		border: 1px solid var(--border-700);
		border-radius: var(--app-shell-radius);
		box-shadow: var(--shadow-panel);
		overflow: hidden;
	}
	.modal-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
		padding: 18px 22px;
		border-bottom: 1px solid var(--border-700);
	}
	.modal-eyebrow {
		display: block;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--accent-400);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	.modal-head h2 {
		margin: 4px 0 0;
		font-size: 1.25rem;
		font-weight: 650;
		color: var(--text-strong);
	}
	.modal-media {
		padding: 16px;
		background: var(--bg);
		overflow: auto;
	}
	.modal-media img {
		display: block;
		width: 100%;
		height: auto;
		border-radius: var(--radius-md);
		border: 1px solid var(--border-700);
	}
	.modal-foot {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 14px;
		padding: 16px 22px;
		border-top: 1px solid var(--border-700);
	}
	.modal-foot p {
		margin: 0;
		font-size: 0.875rem;
		color: var(--text-muted);
		max-width: 34rem;
	}
	.modal-actions {
		display: flex;
		gap: 10px;
	}

	/* =========================================================================
	   Small Screens (Embers Spec Section 10: Phones & Portrait Aspect)
	   ========================================================================= */
	@media (max-width: 820px), (max-aspect-ratio: 1/1) {
		.stage {
			--u: calc(100vw / 390);
			--mb: 96px;
		}
		@supports (width: 1cqw) {
			.stage {
				--u: calc(100cqw / 390);
			}
		}

		.stage-nav {
			height: auto;
			padding: 16px 18px 0;
			flex-wrap: wrap;
		}
		.stage-logo {
			width: 42px;
			height: 42px;
		}
		.stage-links {
			position: static;
			transform: none;
			order: 3;
			width: 100%;
			justify-content: space-between;
			gap: 8px;
			margin-top: 4px;
		}
		.stage-links a {
			font-size: 11px;
		}
		.stage-menu {
			width: 30px;
			height: 28px;
			gap: 7px;
		}

		.shade {
			background: linear-gradient(
				180deg,
				rgba(10, 10, 10, 0.9) 0%,
				rgba(10, 10, 10, 0.62) 30%,
				rgba(10, 10, 10, 0.25) 48%,
				rgba(10, 10, 10, 0) 60%,
				rgba(10, 10, 10, 0.45) 100%
			);
		}

		.fg {
			height: calc(100cqw * 810 / 1440 + 192px);
		}
		.word {
			top: auto;
			bottom: calc(98px + var(--s) * 18);
		}

		.glyphs {
			left: 18px;
			top: 94px;
			flex-direction: row;
			gap: 12px;
		}
		.glyphs svg {
			width: 13px;
			height: 13px;
		}

		.hero-title {
			left: 18px;
			right: 18px;
			top: 118px;
			white-space: normal;
			font-size: min(26px, 6.4vw);
			line-height: 1.2;
		}
		.hero-body {
			left: 18px;
			top: calc(118px + 3 * 1.2 * min(26px, 6.4vw) + 14px);
			width: min(300px, calc(100vw - 36px - min(120px, 26vw) - 16px));
			font-size: 12.5px;
		}
		.vid-card {
			left: auto;
			right: 18px;
			top: calc(118px + 3 * 1.2 * min(26px, 6.4vw) + 14px);
			width: min(120px, 26vw);
			height: min(84px, 18vw);
		}

		.captions {
			left: 18px;
			right: 18px;
			bottom: 16px;
			height: auto;
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 12px;
		}
		.cap {
			position: static;
		}
		.mi {
			gap: 10px;
		}
		.cap-num {
			font-size: 22px;
		}
		.cap-txt {
			font-size: 11px;
			padding-left: 8px;
			white-space: normal;
		}

		.s2-title {
			left: 18px;
			top: 118px;
			font-size: min(24px, 6vw);
			line-height: 1.28;
		}
		.s2-body {
			left: 18px;
			top: calc(118px + 3 * 1.28 * min(24px, 6vw) + 18px);
			width: min(330px, calc(100vw - 36px));
			font-size: 12.5px;
		}

		.s2-cards {
			left: 18px;
			right: 18px;
			top: auto;
			bottom: 54px;
			gap: 8px;
		}
		.s2-card {
			width: calc((100% - 16px) / 3);
			height: auto;
			aspect-ratio: 216 / 246;
		}
		.s2-card-label {
			left: 10px;
			bottom: 10px;
			font-size: 11px;
		}
		.s2-arrow {
			left: 18px;
			top: auto;
			bottom: calc(54px + ((100vw - 52px) / 3) * (246 / 216) + 14px);
		}
		.below-cue {
			bottom: 12px;
			padding: 5px 12px;
		}
	}

	@media (max-width: 370px) {
		.stage-links {
			gap: 4px;
		}
		.stage-links a {
			letter-spacing: 0;
		}
	}

	/* Portrait Tablets (width >= 600px and portrait) */
	@media (min-width: 600px) and (max-aspect-ratio: 1/1) {
		.stage {
			--u: calc(100vw / 760);
			--mb: 76px;
		}
		@supports (width: 1cqw) {
			.stage {
				--u: calc(100cqw / 760);
			}
		}

		.stage-links {
			position: absolute;
			order: initial;
			width: auto;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			margin-top: 0;
			gap: 36px;
		}
		.stage-links a {
			font-size: 12px;
		}
		.fg {
			height: calc(100cqw * 810 / 1440 + 152px);
		}
		.word {
			top: auto;
			bottom: calc(56px + var(--s) * 28);
		}
		.hero-title {
			top: 130px;
			font-size: min(40px, 5.4vw);
		}
		.hero-body {
			top: calc(130px + 2 * 1.2 * min(40px, 5.4vw) + 20px);
			width: 300px;
			font-size: 14px;
		}
		.vid-card {
			top: calc(130px + 2 * 1.2 * min(40px, 5.4vw) + 20px);
			width: 200px;
			height: 140px;
		}
		.captions {
			grid-template-columns: repeat(4, 1fr);
		}
		.s2-title {
			font-size: min(34px, 4.6vw);
		}
		.s2-cards {
			gap: 14px;
		}
		.s2-card {
			width: calc((100% - 28px) / 3);
		}
		.s2-arrow {
			bottom: calc(54px + ((100vw - 92px) / 3) * (246 / 216) + 18px);
		}
	}

	/* Short Landscape Phones */
	@media (max-height: 520px) and (min-aspect-ratio: 1/1) {
		.stage {
			--u: calc(100vh / 470);
			--mb: 36px;
		}
		@supports (width: 1cqw) {
			.stage {
				--u: calc(100cqh / 470);
			}
		}

		.stage-nav {
			height: 56px;
			padding: 0 18px;
			flex-wrap: nowrap;
		}
		.stage-links {
			position: absolute;
			order: initial;
			width: auto;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			margin-top: 0;
			gap: 22px;
		}
		.stage-links a {
			font-size: 11px;
		}
		.fg {
			height: calc(100cqw * 810 / 1440 + 36px);
		}
		.word {
			top: auto;
			bottom: calc(32px + var(--s) * 20);
		}
		.hero-title {
			left: 18px;
			right: auto;
			top: 64px;
			width: 58vw;
			white-space: normal;
			font-size: clamp(15px, 2.6vw, 22px);
		}
		.hero-body {
			left: auto;
			right: 18px;
			top: 66px;
			width: 32vw;
			font-size: 11px;
		}
		.vid-card,
		.glyphs,
		.s2-arrow,
		.state-cue {
			display: none;
		}
		.captions {
			left: 18px;
			right: 18px;
			bottom: 8px;
			height: auto;
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 10px;
		}
		.cap {
			position: static;
		}
		.cap-num {
			font-size: 20px;
		}
		.cap-txt {
			font-size: 11px;
		}
		.s2-title {
			left: 18px;
			top: 64px;
			font-size: clamp(16px, 3vw, 24px);
			line-height: 1.2;
		}
		.s2-body {
			left: 18px;
			top: 158px;
			width: 38vw;
			font-size: 11px;
		}
		.s2-cards {
			left: auto;
			right: 18px;
			top: auto;
			bottom: 16px;
			gap: 10px;
		}
		.s2-card {
			width: min(150px, 15vw);
			height: auto;
			aspect-ratio: 216 / 246;
		}
		.s2-card-label {
			font-size: 11px;
			left: 8px;
			bottom: 8px;
		}
	}
</style>
