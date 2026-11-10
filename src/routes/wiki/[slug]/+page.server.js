import { error } from '@sveltejs/kit';
import { allSlugs, getPage, neighbours, rawHrefFor } from '$lib/server/wiki.js';

export function entries() {
	return allSlugs()
		.filter((slug) => slug !== '')
		.map((slug) => ({ slug }));
}

export function load({ params }) {
	const page = getPage(params.slug);
	if (!page || params.slug === '') error(404, 'This wiki page does not exist.');
	return { page, rawHref: rawHrefFor(page.slug), ...neighbours(page.slug) };
}
