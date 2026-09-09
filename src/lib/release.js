const REPO = 'https://github.com/Mooshieblob1/MooshieUI';
const API = 'https://api.github.com/repos/Mooshieblob1/MooshieUI/releases/latest';

// Latest known release, used when the GitHub API is unreachable or rate-limited.
export const FALLBACK_TAG = 'v2.3.0';

export function buildRelease(tag, assets = []) {
	const vNum = tag.replace(/^v/, '');
	const find = (pattern) =>
		assets.find((a) => a.name.includes(pattern))?.browser_download_url ??
		`${REPO}/releases/download/${tag}/MooshieUI_${vNum}${pattern}`;
	// Only advertise a Mac download when an Apple Silicon-compatible installer
	// exists. Intel installers and updater archives are not suitable substitutes.
	const macAsset = assets.find((a) => /(?:^|[_-])(?:aarch64|arm64)\.dmg$/i.test(a.name))
		?? assets.find((a) => /(?:^|[_-])universal\.dmg$/i.test(a.name));
	return {
		tag,
		winUrl: find('_x64-setup.exe'),
		appimageUrl: find('_amd64.AppImage'),
		debUrl: find('_amd64.deb'),
		macUrl: macAsset?.browser_download_url ?? null
	};
}

// Fetch the latest release from GitHub. Works both at build time (SvelteKit's
// `fetch`) and live in the browser (GitHub's REST API sends CORS headers).
// Falls back to a known-good release if the request fails.
export async function fetchLatestRelease(fetchFn = fetch, fallbackRelease = buildRelease(FALLBACK_TAG)) {
	try {
		const res = await fetchFn(API);
		if (!res.ok) throw new Error(`GitHub API ${res.status}`);
		const data = await res.json();
		if (!data?.tag_name) throw new Error('no tag_name');
		return buildRelease(data.tag_name, data.assets ?? []);
	} catch {
		return fallbackRelease;
	}
}
