import { fetchLatestRelease } from '$lib/release.js';

// Runs at build time (prerender) to bake in the latest release as the initial
// value; the page then refreshes it live in the browser on mount.
export async function load({ fetch }) {
	return { release: await fetchLatestRelease(fetch) };
}
