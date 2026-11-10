import { error } from '@sveltejs/kit';
import { allSlugs, getPage, neighbours, rawHrefFor } from '$lib/server/wiki.js';
import { WIKI_SEO } from '$lib/wiki/seo.js';

export function entries() {
	return allSlugs()
		.filter((slug) => slug !== '')
		.map((slug) => ({ slug }));
}

export function load({ params }) {
	const page = getPage(params.slug);
	if (!page || params.slug === '') error(404, 'This wiki page does not exist.');
	const seo = {
		...WIKI_SEO,
		title: `${page.title} · MooshieUI Wiki`,
		description: page.blurb || page.description || WIKI_SEO.description
	};
	return { page, rawHref: rawHrefFor(page.slug), ...neighbours(page.slug), seo };
}
