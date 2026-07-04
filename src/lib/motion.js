export const fadeUp = (delay = 0) => {
	const reduce =
		typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (reduce) {
		return {
			initial: { opacity: 1, y: 0 },
			whileInView: { opacity: 1, y: 0 },
			viewport: { once: true, margin: '-100px' },
			transition: { duration: 0 }
		};
	}

	return {
		initial: { opacity: 0, y: 20 },
		whileInView: { opacity: 1, y: 0 },
		viewport: { once: true, margin: '-100px' },
		transition: { duration: 0.6, delay, ease: /** @type {'easeOut'} */ ('easeOut') }
	};
};
