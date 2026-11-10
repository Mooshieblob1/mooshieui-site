import { nav, WIKI_SOURCE, stats } from '$lib/server/wiki.js';

export function load() {
	return { nav, source: WIKI_SOURCE, stats: stats() };
}
