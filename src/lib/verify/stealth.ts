/**
 * Lossless Stealth Alpha decoder for PNG (pure TypeScript raw IHDR/IDAT decoder,
 * bypassing <canvas> premultiplication) and WebP (via createImageBitmap with
 * premultiplyAlpha: 'none').
 */

import { decompressStream, detectFormat } from './containers.ts';

export interface StealthResult {
	found: boolean;
	rawText: string | null;
}

const MAGIC_COMP = 'stealth_pngcomp';
const MAGIC_INFO = 'stealth_pnginfo';
const MAGIC_LEN = 15; // bytes = 120 bits
const MAX_PIXELS = 16384 * 16384;
const utf8Decoder = new TextDecoder('utf-8', { fatal: true });

function u32BE(bytes: Uint8Array, off: number): number {
	return (((bytes[off] << 24) | (bytes[off + 1] << 16) | (bytes[off + 2] << 8) | bytes[off + 3]) >>> 0);
}

function paethPredictor(a: number, b: number, c: number): number {
	const p = a + b - c;
	const pa = Math.abs(p - a);
	const pb = Math.abs(p - b);
	const pc = Math.abs(p - c);
	if (pa <= pb && pa <= pc) return a;
	if (pb <= pc) return b;
	return c;
}

/**
 * Decode a non-interlaced RGBA8 or RGBA16 PNG into raw unfiltered pixel bytes
 * without any browser color-space or premultiplied-alpha distortion.
 */
export async function decodeRawPngRgba(
	bytes: Uint8Array
): Promise<{ width: number; height: number; bpp: 4 | 8; pixels: Uint8Array } | null> {
	if (bytes.length < 33) return null;
	let width = 0;
	let height = 0;
	let bitDepth = 0;
	let colorType = 0;
	let interlace = 0;
	const idatParts: Uint8Array[] = [];

	let pos = 8;
	while (pos + 12 <= bytes.length) {
		const len = u32BE(bytes, pos);
		const kind = String.fromCharCode(bytes[pos + 4], bytes[pos + 5], bytes[pos + 6], bytes[pos + 7]);
		const dataStart = pos + 8;
		const dataEnd = dataStart + len;
		if (dataEnd + 4 > bytes.length) break;
		const data = bytes.subarray(dataStart, dataEnd);

		if (kind === 'IHDR') {
			if (data.length < 13) return null;
			width = u32BE(data, 0);
			height = u32BE(data, 4);
			bitDepth = data[8];
			colorType = data[9];
			interlace = data[12];
			if (colorType !== 6 || (bitDepth !== 8 && bitDepth !== 16) || interlace !== 0) {
				return null;
			}
			if (width === 0 || height === 0 || width * height > MAX_PIXELS) {
				return null;
			}
		} else if (kind === 'IDAT') {
			idatParts.push(data);
		} else if (kind === 'IEND') {
			break;
		}
		pos = dataEnd + 4;
	}

	if (width === 0 || idatParts.length === 0) return null;
	const totalIdat = idatParts.reduce((acc, p) => acc + p.length, 0);
	const compressed = new Uint8Array(totalIdat);
	let off = 0;
	for (const p of idatParts) {
		compressed.set(p, off);
		off += p.length;
	}

	const raw = await decompressStream(compressed, 'deflate');
	if (!raw) return null;

	const bpp: 4 | 8 = bitDepth === 16 ? 8 : 4;
	const stride = width * bpp;
	if (raw.length < height * (stride + 1)) return null;

	const pixels = new Uint8Array(height * stride);
	let srcPos = 0;
	for (let y = 0; y < height; y++) {
		const filter = raw[srcPos++];
		const rowOut = y * stride;
		const prevRowOut = (y - 1) * stride;

		for (let x = 0; x < stride; x++) {
			const val = raw[srcPos++];
			const a = x >= bpp ? pixels[rowOut + x - bpp] : 0;
			const b = y > 0 ? pixels[prevRowOut + x] : 0;
			const c = y > 0 && x >= bpp ? pixels[prevRowOut + x - bpp] : 0;
			let outByte = val;
			if (filter === 1) outByte = (val + a) & 0xff;
			else if (filter === 2) outByte = (val + b) & 0xff;
			else if (filter === 3) outByte = (val + ((a + b) >> 1)) & 0xff;
			else if (filter === 4) outByte = (val + paethPredictor(a, b, c)) & 0xff;
			pixels[rowOut + x] = outByte;
		}
	}

	return { width, height, bpp, pixels };
}

/**
 * Read column-major stealth-alpha payload from an interleaved RGBA pixel buffer.
 * Matches `src-tauri/src/metadata/mod.rs:decode_stealth_alpha_pixels`.
 */
export async function decodeStealthFromRgba(
	pixels: Uint8Array,
	width: number,
	height: number,
	bpp: 4 | 8
): Promise<StealthResult> {
	const totalPixels = width * height;
	const magicBits = MAGIC_LEN * 8;
	if (totalPixels < magicBits + 32 || pixels.length < totalPixels * bpp) {
		return { found: false, rawText: null };
	}

	const alphaShift = bpp === 8 ? 6 : 3; // 16-bit uses high byte (byte 6)
	const readBit = (bitIdx: number): number => {
		const x = Math.floor(bitIdx / height);
		const y = bitIdx % height;
		return pixels[(y * width + x) * bpp + alphaShift] & 1;
	};

	const readBytes = (startBit: number, count: number): Uint8Array => {
		const out = new Uint8Array(count);
		let bitIdx = startBit;
		for (let i = 0; i < count; i++) {
			let b = 0;
			for (let bitPos = 7; bitPos >= 0; bitPos--) {
				b |= readBit(bitIdx++) << bitPos;
			}
			out[i] = b;
		}
		return out;
	};

	const magicBytes = readBytes(0, MAGIC_LEN);
	const magicStr = String.fromCharCode(...magicBytes);
	if (magicStr !== MAGIC_COMP && magicStr !== MAGIC_INFO) {
		return { found: false, rawText: null };
	}

	let bitIdx = magicBits;
	let dataBits = 0;
	for (let bitPos = 31; bitPos >= 0; bitPos--) {
		dataBits = (dataBits | (readBit(bitIdx++) << bitPos)) >>> 0;
	}
	if (dataBits === 0 || dataBits % 8 !== 0 || bitIdx + dataBits > totalPixels) {
		return { found: false, rawText: null };
	}

	const payload = readBytes(bitIdx, dataBits / 8);
	if (magicStr === MAGIC_INFO) {
		try {
			return { found: true, rawText: utf8Decoder.decode(payload) };
		} catch {
			return { found: false, rawText: null };
		}
	}

	const inflated = await decompressStream(payload, 'gzip');
	if (!inflated) return { found: false, rawText: null };
	try {
		return { found: true, rawText: utf8Decoder.decode(inflated) };
	} catch {
		return { found: false, rawText: null };
	}
}

export async function decodeStealthAlpha(bytes: Uint8Array): Promise<StealthResult> {
	const fmt = detectFormat(bytes);
	if (fmt === 'png') {
		const decoded = await decodeRawPngRgba(bytes);
		if (!decoded) return { found: false, rawText: null };
		return decodeStealthFromRgba(decoded.pixels, decoded.width, decoded.height, decoded.bpp);
	}

	if (fmt === 'webp' && typeof createImageBitmap === 'function' && typeof document !== 'undefined') {
		try {
			const copy = new Uint8Array(bytes.byteLength);
			copy.set(bytes);
			const bitmap = await createImageBitmap(new Blob([copy], { type: 'image/webp' }), {
				premultiplyAlpha: 'none',
				colorSpaceConversion: 'none'
			});
			const canvas = document.createElement('canvas');
			canvas.width = bitmap.width;
			canvas.height = bitmap.height;
			const ctx = canvas.getContext('2d', { willReadFrequently: true });
			if (!ctx) {
				bitmap.close();
				return { found: false, rawText: null };
			}
			ctx.drawImage(bitmap, 0, 0);
			bitmap.close();
			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			return decodeStealthFromRgba(
				new Uint8Array(imageData.data.buffer),
				canvas.width,
				canvas.height,
				4
			);
		} catch {
			return { found: false, rawText: null };
		}
	}

	return { found: false, rawText: null };
}
