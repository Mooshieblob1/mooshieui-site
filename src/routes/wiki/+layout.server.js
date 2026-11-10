import { nav, WIKI_SOURCE, stats } from '$lib/server/wiki.js';
import { WIKI_SEO } from '$lib/wiki/seo.js';

export function load() {
	return { nav, source: WIKI_SOURCE, stats: stats(), seo: WIKI_SEO };
}
