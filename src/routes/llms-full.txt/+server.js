import { fullMarkdown } from '$lib/server/wiki.js';
import { SITE_URL } from '$lib/site.js';

export const prerender = true;

export function GET() {
	return new Response(fullMarkdown(SITE_URL), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	});
}
