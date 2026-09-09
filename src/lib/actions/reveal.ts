/** Brief, one-time entrances, with no scroll interception or hidden SSR content. */
export function reveal(node: HTMLElement) {
 const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
 if (preference.matches || !('IntersectionObserver' in window) || !node.animate) return {};
 let animation: Animation | undefined;
 const observer = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) return;
  observer.disconnect();
  if (!preference.matches) animation = node.animate(
   [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }],
   { duration: 480, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'none' }
  );
 }, { threshold: 0.08 });
 observer.observe(node);
 const stop = () => { if (preference.matches) animation?.cancel(); };
 preference.addEventListener('change', stop);
 return { destroy() { observer.disconnect(); animation?.cancel(); preference.removeEventListener('change', stop); } };
}
