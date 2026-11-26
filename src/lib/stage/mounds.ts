function smoothstep(edge0: number, edge1: number, x: number): number {
	const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
	return t * t * (3 - 2 * t);
}

function loadCorsImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.decoding = 'async';
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error(`Failed to load mounds asset: ${url}`));
		img.src = url;
	});
}

/**
 * Cleans residual chroma-green edge spill from the foreground mounds cutout at
 * runtime, writes the result to a single Blob URL, assigns it to both mound
 * <img> targets, and awaits decode so the intro never blinks. Never rejects.
 */
export async function cleanMounds(
	url: string,
	targets: HTMLImageElement[]
): Promise<() => void> {
	let blobUrl: string | null = null;
	try {
		const srcImg = await loadCorsImage(url);
		const width = srcImg.naturalWidth || 1344;
		const height = srcImg.naturalHeight || 752;

		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d');
		if (!ctx) return () => {};

		ctx.drawImage(srcImg, 0, 0, width, height);
		const imgData = ctx.getImageData(0, 0, width, height);
		const d = imgData.data;

		for (let i = 0; i < d.length; i += 4) {
			const alpha = d[i + 3];
			if (alpha === 0) continue;

			const r = d[i];
			const g = d[i + 1];
			const b = d[i + 2];
			const m = Math.max(r, b);
			const diff = (g - m) / 255;

			if (diff > 0) {
				d[i + 3] = Math.round(alpha * (1 - smoothstep(0.1, 0.38, diff)));
				d[i + 1] = Math.min(g, Math.round(m * 0.96));
			}
		}

		ctx.putImageData(imgData, 0, 0);

		const blob = await new Promise<Blob | null>((resolve) =>
			canvas.toBlob((out) => resolve(out), 'image/webp', 0.92)
		);
		if (!blob) return () => {};

		blobUrl = URL.createObjectURL(blob);
		await Promise.all(
			targets.map(async (img) => {
				img.src = blobUrl!;
				if (typeof img.decode === 'function') {
					await img.decode().catch(() => {});
				}
			})
		);

		return () => {
			if (blobUrl) {
				URL.revokeObjectURL(blobUrl);
				blobUrl = null;
			}
		};
	} catch {
		if (blobUrl) URL.revokeObjectURL(blobUrl);
		await Promise.all(
			targets.map((img) =>
				typeof img.decode === 'function' ? img.decode().catch(() => {}) : Promise.resolve()
			)
		);
		return () => {};
	}
}
