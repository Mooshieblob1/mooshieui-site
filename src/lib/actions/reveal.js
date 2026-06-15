/**
 * Scroll-reveal action — adds the `in` class when the element enters the
 * viewport, mirroring the landing page's IntersectionObserver entrance.
 */
export function reveal(node) {
	node.classList.add('reveal');
	const io = new IntersectionObserver(
		(entries) => {
			entries.forEach((e) => {
				if (e.isIntersecting) {
					e.target.classList.add('in');
					io.unobserve(e.target);
				}
			});
		},
		{ threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
	);
	io.observe(node);
	return {
		destroy() {
			io.disconnect();
		}
	};
}
