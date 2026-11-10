import { SITE_PATHS, SITE_URL } from '$lib/site.js';
import { allSlugs, hrefFor } from '$lib/server/wiki.js';

export const prerender = true;

export function GET() {
	const paths = [...SITE_PATHS, ...allSlugs().map(hrefFor)];
	const urls = paths.map((path) => `  <url><loc>${SITE_URL}${path}</loc></url>`).join('\n');
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
		{ headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
	);
}
