/**
 * Browser-side Adobe TrustMark (variant P) ONNX decoder.
 * Fetches `decoder_P.onnx` directly from Adobe's CDN on demand, verifies its
 * SHA-256 digest, caches it in Cache API, and runs single-threaded SIMD WASM
 * inference locally in the user's browser.
 */

import { base } from '$app/paths';
import { decodeTrustMarkLogits } from './bch.ts';

export const TRUSTMARK_DECODER_URL =
	'https://cai-watermark.adobe.net/watermarking/trustmark-models/decoder_P.onnx';
export const TRUSTMARK_DECODER_SHA256 =
	'be6d7c33f8a7b376f179e75f3f7c58ff816a9ac7bb6d37fd0a729a635f624c35';
const CACHE_NAME = 'mooshieui-trustmark-v1';
const DECODE_SIZE = 224;

export interface TrustMarkProgress {
	phase: 'downloading' | 'verifying' | 'loading' | 'scanning';
	loaded?: number;
	total?: number;
}

export interface TrustMarkScanResult {
	status: 'mooshieui' | 'third_party' | 'none';
	mooshieIdHex: string | null;
	version: string | null;
	dataBits: string | null;
}

type OrtModule = typeof import('onnxruntime-web/wasm');
type InferenceSession = import('onnxruntime-web/wasm').InferenceSession;

let sessionPromise: Promise<InferenceSession> | null = null;

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
	const hash = await crypto.subtle.digest('SHA-256', buffer);
	const bytes = new Uint8Array(hash);
	let hex = '';
	for (const b of bytes) {
		hex += b.toString(16).padStart(2, '0');
	}
	return hex;
}

export async function isTrustMarkCached(): Promise<boolean> {
	if (typeof caches === 'undefined') return false;
	try {
		const cache = await caches.open(CACHE_NAME);
		const hit = await cache.match(TRUSTMARK_DECODER_URL);
		return hit !== undefined;
	} catch {
		return false;
	}
}

async function fetchDecoderBytes(onProgress?: (p: TrustMarkProgress) => void): Promise<ArrayBuffer> {
	if (typeof caches !== 'undefined') {
		try {
			const cache = await caches.open(CACHE_NAME);
			const cached = await cache.match(TRUSTMARK_DECODER_URL);
			if (cached) {
				const buf = await cached.arrayBuffer();
				const digest = await sha256Hex(buf);
				if (digest === TRUSTMARK_DECODER_SHA256) {
					return buf;
				}
				await cache.delete(TRUSTMARK_DECODER_URL);
			}
		} catch {
			// Ignore Cache API errors (e.g. private browsing) and fall through to network
		}
	}

	onProgress?.({ phase: 'downloading', loaded: 0, total: 47_400_467 });
	const res = await fetch(TRUSTMARK_DECODER_URL, { mode: 'cors' });
	if (!res.ok) {
		throw new Error(`Failed to download TrustMark decoder (${res.status})`);
	}

	const contentLen = Number(res.headers.get('content-length') ?? '47400467') || 47_400_467;
	let buf: ArrayBuffer;
	if (res.body) {
		const reader = res.body.getReader();
		const chunks: Uint8Array[] = [];
		let loaded = 0;
		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			chunks.push(value);
			loaded += value.byteLength;
			onProgress?.({ phase: 'downloading', loaded, total: contentLen });
		}
		const joined = new Uint8Array(loaded);
		let off = 0;
		for (const c of chunks) {
			joined.set(c, off);
			off += c.byteLength;
		}
		buf = joined.buffer;
	} else {
		buf = await res.arrayBuffer();
	}

	onProgress?.({ phase: 'verifying' });
	const digest = await sha256Hex(buf);
	if (digest !== TRUSTMARK_DECODER_SHA256) {
		throw new Error(`TrustMark decoder checksum mismatch (got ${digest})`);
	}

	if (typeof caches !== 'undefined') {
		try {
			const cache = await caches.open(CACHE_NAME);
			await cache.put(
				TRUSTMARK_DECODER_URL,
				new Response(buf.slice(0), {
					headers: { 'Content-Type': 'application/octet-stream' }
				})
			);
		} catch {
			// Best-effort cache write
		}
	}

	return buf;
}

async function getDecoderSession(
	onProgress?: (p: TrustMarkProgress) => void
): Promise<{ ort: OrtModule; session: InferenceSession }> {
	const ort = await import('onnxruntime-web/wasm');
	ort.env.wasm.numThreads = 1;
	ort.env.wasm.wasmPaths = `${base}/ort/`;

	if (!sessionPromise) {
		sessionPromise = (async () => {
			const modelBytes = await fetchDecoderBytes(onProgress);
			onProgress?.({ phase: 'loading' });
			return ort.InferenceSession.create(new Uint8Array(modelBytes), {
				executionProviders: ['wasm'],
				graphOptimizationLevel: 'all'
			});
		})().catch((err) => {
			sessionPromise = null;
			throw err;
		});
	}

	const session = await sessionPromise;
	return { ort, session };
}

/**
 * Centre-square crop -> resize to 224x224 -> NCHW Float32Array in [-1, 1],
 * matching `src-tauri/src/watermark/trustmark/mod.rs:model_input`.
 */
async function preprocessImage(blob: Blob): Promise<Float32Array> {
	const bitmap = await createImageBitmap(blob);
	try {
		const w = bitmap.width;
		const h = bitmap.height;
		const side = Math.min(w, h);
		const ox = Math.floor((w - side) / 2);
		const oy = Math.floor((h - side) / 2);

		const canvas = document.createElement('canvas');
		canvas.width = DECODE_SIZE;
		canvas.height = DECODE_SIZE;
		const ctx = canvas.getContext('2d', { willReadFrequently: true });
		if (!ctx) throw new Error('2D canvas context unavailable');
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = 'medium';
		ctx.drawImage(bitmap, ox, oy, side, side, 0, 0, DECODE_SIZE, DECODE_SIZE);

		const rgba = ctx.getImageData(0, 0, DECODE_SIZE, DECODE_SIZE).data;
		const plane = DECODE_SIZE * DECODE_SIZE;
		const tensor = new Float32Array(plane * 3);
		for (let i = 0; i < plane; i++) {
			const p = i * 4;
			tensor[i] = (rgba[p] / 255.0) * 2.0 - 1.0;
			tensor[plane + i] = (rgba[p + 1] / 255.0) * 2.0 - 1.0;
			tensor[2 * plane + i] = (rgba[p + 2] / 255.0) * 2.0 - 1.0;
		}
		return tensor;
	} finally {
		bitmap.close();
	}
}

export async function scanTrustMark(
	blob: Blob,
	onProgress?: (p: TrustMarkProgress) => void
): Promise<TrustMarkScanResult> {
	const { ort, session } = await getDecoderSession(onProgress);
	onProgress?.({ phase: 'scanning' });
	const inputData = await preprocessImage(blob);
	const tensor = new ort.Tensor('float32', inputData, [1, 3, DECODE_SIZE, DECODE_SIZE]);
	const outputs = await session.run({ image: tensor });
	const output = outputs.output;
	if (!output) {
		throw new Error('TrustMark decoder returned no output tensor');
	}
	const logits = output.data as Float32Array;
	const decoded = decodeTrustMarkLogits(logits);
	if (!decoded) {
		return { status: 'none', mooshieIdHex: null, version: null, dataBits: null };
	}
	return {
		status: decoded.isMooshieUi ? 'mooshieui' : 'third_party',
		mooshieIdHex: decoded.mooshieIdHex,
		version: decoded.version,
		dataBits: decoded.dataBits
	};
}
