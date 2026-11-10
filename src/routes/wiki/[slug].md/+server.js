import { error } from '@sveltejs/kit';
import { allSlugs, getPage } from '$lib/server/wiki.js';

export const prerender = true;

export function entries() {
	return allSlugs().map((slug) => ({ slug: slug === '' ? 'home' : slug }));
}

export function GET({ params }) {
	const page = getPage(params.slug === 'home' ? '' : params.slug);
	if (!page) error(404, 'Not found');
	return new Response(page.markdown, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	});
}
