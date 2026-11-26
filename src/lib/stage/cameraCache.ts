import { COUT } from './animations';

const FRAME_W = 1280;
const FRAME_H = 720;

interface Mp4Sample {
	offset: number;
	size: number;
	timestampUs: number;
	durationUs: number;
	isKey: boolean;
}

interface ParsedVideoTrack {
	codec: string;
	description: Uint8Array;
	samples: Mp4Sample[];
}

interface CachedFrame {
	timestamp: number;
	blob: Blob;
}

interface BoxRange {
	type: string;
	start: number;
	headerSize: number;
	end: number;
}

function readAscii(bytes: Uint8Array, offset: number, len: number): string {
	let out = '';
	for (let i = 0; i < len; i++) {
		out += String.fromCharCode(bytes[offset + i]);
	}
	return out;
}

function iterBoxes(
	view: DataView,
	bytes: Uint8Array,
	start: number,
	end: number
): BoxRange[] {
	const boxes: BoxRange[] = [];
	let pos = start;
	while (pos + 8 <= end) {
		const size32 = view.getUint32(pos);
		const type = readAscii(bytes, pos + 4, 4);
		let headerSize = 8;
		let boxSize = size32;
		if (size32 === 1) {
			if (pos + 16 > end) break;
			boxSize = Number(view.getBigUint64(pos + 8));
			headerSize = 16;
		} else if (size32 === 0) {
			boxSize = end - pos;
		}
		if (boxSize < headerSize || pos + boxSize > end) break;
		boxes.push({ type, start: pos, headerSize, end: pos + boxSize });
		pos += boxSize;
	}
	return boxes;
}

function findBox(boxes: BoxRange[], type: string): BoxRange | undefined {
	return boxes.find((b) => b.type === type);
}

function hex2(n: number): string {
	return n.toString(16).padStart(2, '0');
}

function parseMp4(buffer: ArrayBuffer): ParsedVideoTrack | null {
	const view = new DataView(buffer);
	const bytes = new Uint8Array(buffer);
	const root = iterBoxes(view, bytes, 0, bytes.byteLength);
	const moov = findBox(root, 'moov');
	if (!moov) return null;

	const traks = iterBoxes(view, bytes, moov.start + moov.headerSize, moov.end).filter(
		(b) => b.type === 'trak'
	);

	for (const trak of traks) {
		const trakChildren = iterBoxes(view, bytes, trak.start + trak.headerSize, trak.end);
		const mdia = findBox(trakChildren, 'mdia');
		if (!mdia) continue;

		const mdiaChildren = iterBoxes(view, bytes, mdia.start + mdia.headerSize, mdia.end);
		const hdlr = findBox(mdiaChildren, 'hdlr');
		if (hdlr) {
			const hdlrType = readAscii(bytes, hdlr.start + hdlr.headerSize + 8, 4);
			if (hdlrType !== 'vide') continue;
		}

		const mdhd = findBox(mdiaChildren, 'mdhd');
		const minf = findBox(mdiaChildren, 'minf');
		if (!mdhd || !minf) continue;

		const mdhdBase = mdhd.start + mdhd.headerSize;
		const mdhdVer = bytes[mdhdBase];
		const timescale =
			mdhdVer === 1 ? view.getUint32(mdhdBase + 20) : view.getUint32(mdhdBase + 12);
		if (!timescale) continue;

		const minfChildren = iterBoxes(view, bytes, minf.start + minf.headerSize, minf.end);
		const stbl = findBox(minfChildren, 'stbl');
		if (!stbl) continue;

		const stblChildren = iterBoxes(view, bytes, stbl.start + stbl.headerSize, stbl.end);
		const stsd = findBox(stblChildren, 'stsd');
		const stsz = findBox(stblChildren, 'stsz');
		const stsc = findBox(stblChildren, 'stsc');
		const stco = findBox(stblChildren, 'stco');
		const co64 = findBox(stblChildren, 'co64');
		const stts = findBox(stblChildren, 'stts');
		const stss = findBox(stblChildren, 'stss');
		const ctts = findBox(stblChildren, 'ctts');

		if (!stsd || !stsz || !stsc || (!stco && !co64) || !stts) continue;

		// Parse avcC inside stsd -> avc1/avc3
		const stsdEntriesStart = stsd.start + stsd.headerSize + 8;
		const sampleEntries = iterBoxes(view, bytes, stsdEntriesStart, stsd.end);
		const avcEntry = sampleEntries.find((b) => b.type === 'avc1' || b.type === 'avc3');
		if (!avcEntry) continue;

		// VisualSampleEntry has 78 bytes after the 8-byte box header (86 total).
		const avcSubBoxes = iterBoxes(view, bytes, avcEntry.start + avcEntry.headerSize + 78, avcEntry.end);
		const avcCBox = findBox(avcSubBoxes, 'avcC');
		if (!avcCBox) continue;

		const avcCStart = avcCBox.start + avcCBox.headerSize;
		const description = bytes.slice(avcCStart, avcCBox.end);
		if (description.byteLength < 4) continue;
		const codec = `avc1.${hex2(description[1])}${hex2(description[2])}${hex2(description[3])}`;

		// Sample sizes (stsz)
		const stszBase = stsz.start + stsz.headerSize;
		const defaultSize = view.getUint32(stszBase + 4);
		const sampleCount = view.getUint32(stszBase + 8);
		const sizes = new Uint32Array(sampleCount);
		if (defaultSize !== 0) {
			sizes.fill(defaultSize);
		} else {
			for (let i = 0; i < sampleCount; i++) {
				sizes[i] = view.getUint32(stszBase + 12 + i * 4);
			}
		}

		// Chunk offsets (stco / co64)
		const chunkOffsets: number[] = [];
		if (stco) {
			const base = stco.start + stco.headerSize;
			const count = view.getUint32(base + 4);
			for (let i = 0; i < count; i++) {
				chunkOffsets.push(view.getUint32(base + 8 + i * 4));
			}
		} else if (co64) {
			const base = co64.start + co64.headerSize;
			const count = view.getUint32(base + 4);
			for (let i = 0; i < count; i++) {
				chunkOffsets.push(Number(view.getBigUint64(base + 8 + i * 8)));
			}
		}

		// Sample-to-chunk (stsc)
		const stscBase = stsc.start + stsc.headerSize;
		const stscCount = view.getUint32(stscBase + 4);
		const stscEntries: { firstChunk: number; samplesPerChunk: number }[] = [];
		for (let i = 0; i < stscCount; i++) {
			stscEntries.push({
				firstChunk: view.getUint32(stscBase + 8 + i * 12),
				samplesPerChunk: view.getUint32(stscBase + 12 + i * 12)
			});
		}

		// Decoding timestamps (stts)
		const sttsBase = stts.start + stts.headerSize;
		const sttsCount = view.getUint32(sttsBase + 4);
		const dtsTicks = new Float64Array(sampleCount);
		const durTicks = new Float64Array(sampleCount);
		let sampleIdx = 0;
		let curTick = 0;
		for (let i = 0; i < sttsCount && sampleIdx < sampleCount; i++) {
			const count = view.getUint32(sttsBase + 8 + i * 8);
			const delta = view.getUint32(sttsBase + 12 + i * 8);
			for (let j = 0; j < count && sampleIdx < sampleCount; j++) {
				dtsTicks[sampleIdx] = curTick;
				durTicks[sampleIdx] = delta;
				curTick += delta;
				sampleIdx++;
			}
		}

		// Composition offsets (ctts) if present
		const ctsOffsets = new Int32Array(sampleCount);
		if (ctts) {
			const cttsBase = ctts.start + ctts.headerSize;
			const cttsVer = bytes[cttsBase];
			const cttsCount = view.getUint32(cttsBase + 4);
			let idx = 0;
			for (let i = 0; i < cttsCount && idx < sampleCount; i++) {
				const count = view.getUint32(cttsBase + 8 + i * 8);
				const off =
					cttsVer === 1 ? view.getInt32(cttsBase + 12 + i * 8) : view.getUint32(cttsBase + 12 + i * 8);
				for (let j = 0; j < count && idx < sampleCount; j++) {
					ctsOffsets[idx++] = off;
				}
			}
		}

		// Keyframes (stss)
		const keySet = new Set<number>();
		if (stss) {
			const stssBase = stss.start + stss.headerSize;
			const count = view.getUint32(stssBase + 4);
			for (let i = 0; i < count; i++) {
				keySet.add(view.getUint32(stssBase + 8 + i * 4) - 1);
			}
		}

		// Expand sample offsets
		const samples: Mp4Sample[] = [];
		let sIdx = 0;
		let stscCursor = 0;
		for (let chunkIdx = 0; chunkIdx < chunkOffsets.length && sIdx < sampleCount; chunkIdx++) {
			const chunkNum = chunkIdx + 1;
			while (
				stscCursor + 1 < stscEntries.length &&
				chunkNum >= stscEntries[stscCursor + 1].firstChunk
			) {
				stscCursor++;
			}
			const countInChunk = stscEntries[stscCursor]?.samplesPerChunk ?? 1;
			let bytePos = chunkOffsets[chunkIdx];
			for (let k = 0; k < countInChunk && sIdx < sampleCount; k++) {
				const size = sizes[sIdx];
				const ptsTick = dtsTicks[sIdx] + ctsOffsets[sIdx];
				samples.push({
					offset: bytePos,
					size,
					timestampUs: Math.round((ptsTick / timescale) * 1_000_000),
					durationUs: Math.round((durTicks[sIdx] / timescale) * 1_000_000),
					isKey: stss ? keySet.has(sIdx) : true
				});
				bytePos += size;
				sIdx++;
			}
		}

		return { codec, description, samples };
	}

	return null;
}

async function encodeCanvasFrame(
	canvas: HTMLCanvasElement,
	source: CanvasImageSource,
	timestamp: number
): Promise<CachedFrame | null> {
	const ctx = canvas.getContext('2d');
	if (!ctx) return null;
	ctx.drawImage(source, 0, 0, FRAME_W, FRAME_H);
	const blob = await new Promise<Blob | null>((resolve) =>
		canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.86)
	);
	return blob ? { timestamp, blob } : null;
}

async function decodeWithWebCodecs(buffer: ArrayBuffer): Promise<CachedFrame[]> {
	if (typeof VideoDecoder === 'undefined' || typeof EncodedVideoChunk === 'undefined') {
		throw new Error('WebCodecs unavailable');
	}
	const track = parseMp4(buffer);
	if (!track || track.samples.length === 0) {
		throw new Error('Unsupported MP4 layout');
	}

	const support = await VideoDecoder.isConfigSupported({
		codec: track.codec,
		description: track.description
	});
	if (!support.supported) {
		throw new Error(`Unsupported codec ${track.codec}`);
	}

	const workCanvas = document.createElement('canvas');
	workCanvas.width = FRAME_W;
	workCanvas.height = FRAME_H;

	const frames: CachedFrame[] = [];
	const pendingEncodes: Promise<void>[] = [];
	let decodeError: unknown = null;

	const decoder = new VideoDecoder({
		output: (frame) => {
			const ts = frame.timestamp;
			const p = encodeCanvasFrame(workCanvas, frame, ts)
				.then((entry) => {
					if (entry) frames.push(entry);
				})
				.finally(() => {
					frame.close();
				});
			pendingEncodes.push(p);
		},
		error: (err) => {
			decodeError = err;
		}
	});

	decoder.configure({
		codec: track.codec,
		description: track.description,
		optimizeForLatency: false
	});

	const bytes = new Uint8Array(buffer);
	for (const sample of track.samples) {
		if (decodeError) break;
		decoder.decode(
			new EncodedVideoChunk({
				type: sample.isKey ? 'key' : 'delta',
				timestamp: sample.timestampUs,
				duration: sample.durationUs,
				data: bytes.subarray(sample.offset, sample.offset + sample.size)
			})
		);
	}

	await decoder.flush();
	decoder.close();
	await Promise.all(pendingEncodes);
	if (decodeError) throw decodeError;

	frames.sort((a, b) => a.timestamp - b.timestamp);
	return frames;
}

async function decodeWithVideoCallback(buffer: ArrayBuffer): Promise<CachedFrame[]> {
	const video = document.createElement('video');
	if (typeof video.requestVideoFrameCallback !== 'function') {
		throw new Error('requestVideoFrameCallback unavailable');
	}

	const url = URL.createObjectURL(new Blob([buffer], { type: 'video/mp4' }));
	const workCanvas = document.createElement('canvas');
	workCanvas.width = FRAME_W;
	workCanvas.height = FRAME_H;
	const frames: CachedFrame[] = [];

	video.muted = true;
	video.playsInline = true;
	video.preload = 'auto';
	video.src = url;
	video.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;';
	document.body.appendChild(video);

	try {
		await new Promise<void>((resolve, reject) => {
			video.onloadeddata = () => resolve();
			video.onerror = () => reject(new Error('Video load failed'));
		});

		await new Promise<void>((resolve) => {
			let finished = false;
			const finish = () => {
				if (finished) return;
				finished = true;
				resolve();
			};
			const onFrame = (_now: number, meta: VideoFrameCallbackMetadata) => {
				if (finished) return;
				void encodeCanvasFrame(workCanvas, video, Math.round(meta.mediaTime * 1_000_000)).then(
					(entry) => {
						if (entry) frames.push(entry);
					}
				);
				if (!video.ended) {
					video.requestVideoFrameCallback(onFrame);
				} else {
					finish();
				}
			};
			video.onended = finish;
			video.requestVideoFrameCallback(onFrame);
			video.play().catch(finish);
		});
	} finally {
		video.pause();
		video.remove();
		URL.revokeObjectURL(url);
	}

	frames.sort((a, b) => a.timestamp - b.timestamp);
	return frames;
}

export class CameraScrubber {
	private canvas: HTMLCanvasElement | null = null;
	private frames: CachedFrame[] = [];
	private bitmaps = new Map<number, ImageBitmap>();
	private inFlight = new Set<number>();
	private lastTargetIdx = 0;
	private currentDrawnIdx = -1;
	private cameraRaf = 0;
	private cameraDelayTimer = 0;
	private destroyed = false;

	attachCanvas(canvas: HTMLCanvasElement): void {
		this.canvas = canvas;
	}

	get ready(): boolean {
		return this.frames.length > 20;
	}

	async loadVideo(url: string): Promise<void> {
		if (!url || this.destroyed) return;
		try {
			const res = await fetch(url, { mode: 'cors' });
			if (!res.ok || this.destroyed) return;
			const buffer = await res.arrayBuffer();
			if (this.destroyed) return;

			let decoded: CachedFrame[];
			try {
				decoded = await decodeWithWebCodecs(buffer);
			} catch {
				decoded = await decodeWithVideoCallback(buffer);
			}
			if (this.destroyed) return;
			this.frames = decoded;
			if (this.ready) {
				this.warmLookahead(0, 1);
			}
		} catch {
			// Leave fallback crossfade active when camera video is unavailable.
		}
	}

	private warmLookahead(idx: number, dir: 1 | -1): void {
		for (let step = 0; step <= 6; step++) {
			const candidate = idx + step * dir;
			if (candidate < 0 || candidate >= this.frames.length) continue;
			if (this.bitmaps.has(candidate) || this.inFlight.has(candidate)) continue;
			if (this.inFlight.size >= 4) break;

			this.inFlight.add(candidate);
			createImageBitmap(this.frames[candidate].blob)
				.then((bmp) => {
					if (this.destroyed) {
						bmp.close();
						return;
					}
					this.bitmaps.set(candidate, bmp);
					this.evictDistant(this.lastTargetIdx);
				})
				.catch(() => {})
				.finally(() => {
					this.inFlight.delete(candidate);
				});
		}
	}

	private evictDistant(playheadIdx: number): void {
		if (this.bitmaps.size <= 24) return;
		for (const [k, bmp] of this.bitmaps.entries()) {
			if (Math.abs(k - playheadIdx) > 10) {
				bmp.close();
				this.bitmaps.delete(k);
			}
		}
	}

	private drawProgress(p: number): void {
		if (!this.canvas || !this.ready) return;
		const clamped = Math.max(0, Math.min(1, p));
		const idx = Math.round(clamped * (this.frames.length - 1));
		const dir: 1 | -1 = idx >= this.lastTargetIdx ? 1 : -1;
		this.lastTargetIdx = idx;

		this.warmLookahead(idx, dir);
		this.evictDistant(idx);

		// Pick nearest already-decoded frame at or behind idx in travel direction.
		let pick = -1;
		if (dir === 1) {
			for (let k = idx; k >= 0; k--) {
				if (this.bitmaps.has(k)) {
					pick = k;
					break;
				}
			}
		} else {
			for (let k = idx; k < this.frames.length; k++) {
				if (this.bitmaps.has(k)) {
					pick = k;
					break;
				}
			}
		}
		if (pick === -1) {
			let bestDist = Infinity;
			for (const k of this.bitmaps.keys()) {
				const d = Math.abs(k - idx);
				if (d < bestDist) {
					bestDist = d;
					pick = k;
				}
			}
		}

		if (pick !== -1 && pick !== this.currentDrawnIdx) {
			const bmp = this.bitmaps.get(pick);
			const ctx = this.canvas.getContext('2d');
			if (bmp && ctx) {
				ctx.drawImage(bmp, 0, 0, FRAME_W, FRAME_H);
				this.currentDrawnIdx = pick;
			}
		}
	}

	cancelActive(): void {
		if (this.cameraDelayTimer) {
			window.clearTimeout(this.cameraDelayTimer);
			this.cameraDelayTimer = 0;
		}
		if (this.cameraRaf) {
			cancelAnimationFrame(this.cameraRaf);
			this.cameraRaf = 0;
		}
	}

	runCamera(
		forward: boolean,
		delay: number,
		duration: number,
		opts: {
			stageEl: HTMLElement | null;
			s2PlateEl: HTMLImageElement | null;
			reducedMotion: boolean;
			trackAnimation?: (anim: Animation) => void;
		}
	): void {
		this.cancelActive();
		const { stageEl, s2PlateEl, reducedMotion, trackAnimation } = opts;

		if (reducedMotion || !this.ready) {
			if (!s2PlateEl) return;
			if (reducedMotion) {
				stageEl?.classList.remove('cam-on');
				s2PlateEl.style.opacity = forward ? '1' : '0';
				return;
			}
			const anim = s2PlateEl.animate(
				[{ opacity: forward ? 0 : 1 }, { opacity: forward ? 1 : 0 }],
				{
					delay,
					duration,
					easing: COUT,
					fill: 'both'
				}
			);
			trackAnimation?.(anim);
			return;
		}

		this.cameraDelayTimer = window.setTimeout(() => {
			if (this.destroyed) return;
			stageEl?.classList.add('cam-on');
			const start = performance.now();
			const tick = (now: number) => {
				if (this.destroyed) return;
				const x = Math.max(0, Math.min(1, (now - start) / duration));
				const eased = 1 - Math.pow(1 - x, 3);
				const p = forward ? eased : 1 - eased;
				this.drawProgress(p);

				if (x < 1) {
					this.cameraRaf = requestAnimationFrame(tick);
				} else {
					this.cameraRaf = 0;
					if (s2PlateEl) {
						s2PlateEl.style.opacity = forward ? '1' : '0';
					}
					if (!forward) {
						stageEl?.classList.remove('cam-on');
					}
				}
			};
			this.drawProgress(forward ? 0 : 1);
			this.cameraRaf = requestAnimationFrame(tick);
		}, delay);
	}

	destroy(): void {
		this.destroyed = true;
		this.cancelActive();
		for (const bmp of this.bitmaps.values()) {
			bmp.close();
		}
		this.bitmaps.clear();
		this.frames = [];
	}
}
