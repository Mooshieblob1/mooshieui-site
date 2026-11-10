import { getPage, rawHrefFor } from '$lib/server/wiki.js';
import { OVERVIEW_FLOW } from '$lib/server/figures.js';

export function load() {
	const home = getPage('');
	// Home.md's own lists are replaced by the cards; keep its closing notes.
	const notes = home.html.split(/(?=<h2 id="notes-on-this-wiki">)/)[1] ?? '';
	return { home, notes, overview: OVERVIEW_FLOW, rawHref: rawHrefFor('') };
}
