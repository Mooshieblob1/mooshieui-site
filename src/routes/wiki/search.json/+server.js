import { json } from '@sveltejs/kit';
import { searchIndex } from '$lib/server/wiki.js';

export const prerender = true;

export function GET() {
	return json(searchIndex());
}
