const REPO = 'https://github.com/Mooshieblob1/MooshieUI';
const FALLBACK_TAG = 'v1.4.18';

function buildRelease(tag, assets) {
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

export async function load({ fetch }) {
	try {
		const res = await fetch(
			'https://api.github.com/repos/Mooshieblob1/MooshieUI/releases/latest'
		);
		if (!res.ok) throw new Error(`GitHub API ${res.status}`);
		const data = await res.json();
		return { release: buildRelease(data.tag_name, data.assets ?? []) };
	} catch {
		return { release: buildRelease(FALLBACK_TAG, []) };
	}
}
