/**
 * Enhance the existing sections without hiding prerendered content. Each block
 * enters once; the browser keeps normal scrolling, links, and document layout.
 */
export function sectionTransitions(node: HTMLElement) {
	if (!('IntersectionObserver' in window) || typeof node.animate !== 'function') return;

	const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
	if (preference.matches) return;

	const targets = Array.from(node.querySelectorAll<HTMLElement>(
		'#features .sec-head, #features .feature, ' +
		'#modes .sec-head, #modes .mode, ' +
		'#look .closer-media, #look .closer > div:last-child, ' +
		'#download .sec-head, #download .dl-card, #download .other-options'
	));
	const animations = new Map<HTMLElement, Animation>();
	const revealed = new WeakSet<HTMLElement>();
	let stopped = false;

	const observer = new IntersectionObserver((entries) => {
		if (stopped) return;
		let stagger = 0;
		for (const entry of entries) {
			if (!entry.isIntersecting) continue;
			const target = entry.target as HTMLElement;
			observer.unobserve(target);
			if (revealed.has(target)) continue;
			revealed.add(target);

			// Keyboard navigation and background tabs never wait for an entrance.
			if (preference.matches || document.hidden || target.contains(document.activeElement)) continue;

			const delay = Math.min(stagger++ * 55, 110);
			target.style.setProperty('--section-enter-delay', `${delay}ms`);
			target.setAttribute('data-section-entered', '');
			const animation = target.animate([
				{ opacity: 0.45, transform: 'translateY(12px)' },
				{ opacity: 1, transform: 'translateY(0)' }
			], {
				duration: 480,
				delay,
				easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
				fill: 'backwards'
			});
			animations.set(target, animation);
			animation.onfinish = () => {
				animations.delete(target);
				animation.cancel();
			};
		}
	}, { threshold: 0 });

	for (const target of targets) {
		// Avoid a flash on hydration, restored scroll positions, or direct links.
		if (target.getBoundingClientRect().top < window.innerHeight) {
			revealed.add(target);
		} else {
			observer.observe(target);
		}
	}

	function onFocus(event: FocusEvent) {
		if (!(event.target instanceof Node)) return;
		for (const target of targets) {
			if (!target.contains(event.target)) continue;
			revealed.add(target);
			observer.unobserve(target);
			animations.get(target)?.cancel();
			animations.delete(target);
			target.removeAttribute('data-section-entered');
		}
	}

	function stop() {
		stopped = true;
		observer.disconnect();
		for (const animation of animations.values()) animation.cancel();
		animations.clear();
		for (const target of targets) {
			target.removeAttribute('data-section-entered');
			target.style.removeProperty('--section-enter-delay');
		}
	}

	function onPreferenceChange() {
		if (preference.matches) stop();
	}

	node.addEventListener('focusin', onFocus);
	preference.addEventListener('change', onPreferenceChange);
	return {
		destroy() {
			stop();
			node.removeEventListener('focusin', onFocus);
			preference.removeEventListener('change', onPreferenceChange);
		}
	};
}
