const REPO = 'https://github.com/Mooshieblob1/MooshieUI';
const API = 'https://api.github.com/repos/Mooshieblob1/MooshieUI/releases/latest';

// Latest known release, used when the GitHub API is unreachable or rate-limited.
export const FALLBACK_TAG = 'v1.4.19';

export function buildRelease(tag, assets = []) {
	const vNum = tag.replace(/^v/, '');
	const find = (pattern) =>
		assets.find((a) => a.name.includes(pattern))?.browser_download_url ??
		`${REPO}/releases/download/${tag}/MooshieUI_${vNum}${pattern}`;
	return {
		tag,
		winUrl: find('_x64-setup.exe'),
		appimageUrl: find('_amd64.AppImage'),
		debUrl: find('_amd64.deb')
	};
}

// Fetch the latest release from GitHub. Works both at build time (SvelteKit's
// `fetch`) and live in the browser (GitHub's REST API sends CORS headers).
// Falls back to a known-good release if the request fails.
export async function fetchLatestRelease(fetchFn = fetch) {
	try {
		const res = await fetchFn(API);
		if (!res.ok) throw new Error(`GitHub API ${res.status}`);
		const data = await res.json();
		if (!data?.tag_name) throw new Error('no tag_name');
		return buildRelease(data.tag_name, data.assets ?? []);
	} catch {
		return buildRelease(FALLBACK_TAG, []);
	}
}
