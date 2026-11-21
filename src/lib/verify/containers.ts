/**
 * Pure TypeScript container metadata extractors (PNG, WebP, JXL, JPEG, MP4, AVIF, GIF).
 * Runs 100% client-side in the browser (and Node 24 tests) with zero external libraries.
 */

export type ContainerFormat = 'png' | 'webp' | 'jxl' | 'jpeg' | 'mp4' | 'avif' | 'gif' | 'unknown';

export interface ContainerMetadata {
	format: ContainerFormat;
	textChunks: Record<string, string>;
	xmpPackets: string[];
	exifUserComment: string | null;
	gifComment: string | null;
	mp4Comment: string | null;
	c2paPresent: boolean;
	dimensions: { width: number; height: number } | null;
}

const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JXL_SIG = [0x00, 0x00, 0x00, 0x0c, 0x4a, 0x58, 0x4c, 0x20, 0x0d, 0x0a, 0x87, 0x0a];
const ADOBE_XMP_UUID = [
	0xbe, 0x7a, 0xcf, 0xcb, 0x97, 0xa9, 0x42, 0xe8, 0x9c, 0x71, 0x99, 0x94, 0x91, 0xe3, 0xaf, 0xac
];
const MAX_DECOMPRESSED = 16 * 1024 * 1024;
const MAX_ISOBMFF_BOXES = 4096;

const utf8Decoder = new TextDecoder('utf-8', { fatal: false });
const latin1Decoder = new TextDecoder('latin1');

function matchesAt(bytes: Uint8Array, offset: number, sig: number[]): boolean {
	if (bytes.length < offset + sig.length) return false;
	for (let i = 0; i < sig.length; i++) {
		if (bytes[offset + i] !== sig[i]) return false;
	}
	return true;
}

function asciiAt(bytes: Uint8Array, offset: number, len: number): string {
	let s = '';
	for (let i = 0; i < len && offset + i < bytes.length; i++) {
		s += String.fromCharCode(bytes[offset + i]);
	}
	return s;
}

function u16BE(bytes: Uint8Array, off: number): number {
	return ((bytes[off] << 8) | bytes[off + 1]) >>> 0;
}

function u32BE(bytes: Uint8Array, off: number): number {
	return (((bytes[off] << 24) | (bytes[off + 1] << 16) | (bytes[off + 2] << 8) | bytes[off + 3]) >>> 0);
}

function u32LE(bytes: Uint8Array, off: number): number {
	return ((bytes[off] | (bytes[off + 1] << 8) | (bytes[off + 2] << 16) | (bytes[off + 3] << 24)) >>> 0);
}

function u64BE(bytes: Uint8Array, off: number): number {
	const hi = u32BE(bytes, off);
	const lo = u32BE(bytes, off + 4);
	return hi * 0x100000000 + lo;
}

export async function decompressStream(
	data: Uint8Array,
	format: 'deflate' | 'gzip'
): Promise<Uint8Array | null> {
	try {
		const copy = new Uint8Array(data.byteLength);
		copy.set(data);
		const stream = new Blob([copy]).stream().pipeThrough(new DecompressionStream(format));
		const reader = stream.getReader();
		const chunks: Uint8Array[] = [];
		let total = 0;
		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			total += value.byteLength;
			if (total > MAX_DECOMPRESSED) {
				await reader.cancel();
				return null;
			}
			chunks.push(value);
		}
		const out = new Uint8Array(total);
		let pos = 0;
		for (const c of chunks) {
			out.set(c, pos);
			pos += c.byteLength;
		}
		return out;
	} catch {
		return null;
	}
}

export function detectFormat(bytes: Uint8Array): ContainerFormat {
	if (matchesAt(bytes, 0, PNG_SIG)) return 'png';
	if (bytes.length >= 12 && asciiAt(bytes, 0, 4) === 'RIFF' && asciiAt(bytes, 8, 4) === 'WEBP') {
		return 'webp';
	}
	if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
		return 'jpeg';
	}
	if (matchesAt(bytes, 0, JXL_SIG) || (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0x0a)) {
		return 'jxl';
	}
	if (asciiAt(bytes, 0, 6) === 'GIF87a' || asciiAt(bytes, 0, 6) === 'GIF89a') {
		return 'gif';
	}
	if (bytes.length >= 12 && asciiAt(bytes, 4, 4) === 'ftyp') {
		return isAvifFtyp(bytes) ? 'avif' : 'mp4';
	}
	return 'unknown';
}

function isAvifFtyp(bytes: Uint8Array): boolean {
	if (bytes.length < 16) return false;
	const size = u32BE(bytes, 0);
	const end = Math.min(bytes.length, size < 8 ? 8 : size);
	for (let off = 8; off + 4 <= end; off += 4) {
		if (off === 12) continue; // minor_version
		const brand = asciiAt(bytes, off, 4);
		if (brand === 'avif' || brand === 'avis') return true;
	}
	return false;
}

// ---------------------------------------------------------------------------
// PNG
// ---------------------------------------------------------------------------

async function parsePng(bytes: Uint8Array, out: ContainerMetadata): Promise<void> {
	let pos = 8;
	while (pos + 12 <= bytes.length) {
		const len = u32BE(bytes, pos);
		const kind = asciiAt(bytes, pos + 4, 4);
		const dataStart = pos + 8;
		const dataEnd = dataStart + len;
		if (dataEnd + 4 > bytes.length) break;
		const data = bytes.subarray(dataStart, dataEnd);

		if (kind === 'IHDR' && data.length >= 8) {
			out.dimensions = { width: u32BE(data, 0), height: u32BE(data, 4) };
		} else if (kind === 'caBX') {
			out.c2paPresent = true;
		} else if (kind === 'tEXt') {
			const nul = data.indexOf(0);
			if (nul > 0) {
				const kw = latin1Decoder.decode(data.subarray(0, nul));
				const text = latin1Decoder.decode(data.subarray(nul + 1));
				out.textChunks[kw] = text;
				if (kw === 'XML:com.adobe.xmp') out.xmpPackets.push(text);
			}
		} else if (kind === 'zTXt') {
			const nul = data.indexOf(0);
			if (nul > 0 && nul + 2 <= data.length && data[nul + 1] === 0) {
				const kw = latin1Decoder.decode(data.subarray(0, nul));
				const inflated = await decompressStream(data.subarray(nul + 2), 'deflate');
				if (inflated) {
					const text = latin1Decoder.decode(inflated);
					out.textChunks[kw] = text;
					if (kw === 'XML:com.adobe.xmp') out.xmpPackets.push(text);
				}
			}
		} else if (kind === 'iTXt') {
			const nul = data.indexOf(0);
			if (nul > 0 && nul + 3 < data.length) {
				const kw = latin1Decoder.decode(data.subarray(0, nul));
				const compFlag = data[nul + 1];
				const compMethod = data[nul + 2];
				const langEnd = data.indexOf(0, nul + 3);
				if (langEnd >= 0) {
					const tkwEnd = data.indexOf(0, langEnd + 1);
					if (tkwEnd >= 0) {
						const payload = data.subarray(tkwEnd + 1);
						let text: string | null = null;
						if (compFlag === 0) {
							text = utf8Decoder.decode(payload);
						} else if (compFlag === 1 && compMethod === 0) {
							const inflated = await decompressStream(payload, 'deflate');
							if (inflated) text = utf8Decoder.decode(inflated);
						}
						if (text !== null) {
							out.textChunks[kw] = text;
							if (kw === 'XML:com.adobe.xmp') out.xmpPackets.push(text);
						}
					}
				}
			}
		} else if (kind === 'IEND') {
			break;
		}
		pos = dataEnd + 4;
	}
}

// ---------------------------------------------------------------------------
// EXIF UserComment reader (WebP / JPEG / AVIF)
// ---------------------------------------------------------------------------

function utf16String(bytes: Uint8Array, bigEndian: boolean): string {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	let s = '';
	for (let i = 0; i + 1 < bytes.length; i += 2) {
		s += String.fromCharCode(view.getUint16(i, !bigEndian));
	}
	return s;
}

function decodeUserComment(raw: Uint8Array): string {
	if (raw.length >= 8) {
		const prefix = asciiAt(raw, 0, 8);
		const body = raw.subarray(8);
		if (prefix === 'UNICODE\0') {
			const be = utf16String(body, true);
			if (be.includes('{')) return be;
			const le = utf16String(body, false);
			if (le.includes('{')) return le;
			return be;
		}
		if (prefix === 'ASCII\0\0\0' || prefix === '\0\0\0\0\0\0\0\0') {
			return utf8Decoder.decode(body).replace(/\0+$/, '');
		}
	}
	return utf8Decoder.decode(raw).replace(/\0+$/, '');
}

export function readExifUserComment(exif: Uint8Array): string | null {
	const tiff = asciiAt(exif, 0, 6) === 'Exif\0\0' ? exif.subarray(6) : exif;
	if (tiff.length < 8) return null;
	const order = asciiAt(tiff, 0, 2);
	if (order !== 'II' && order !== 'MM') return null;
	const le = order === 'II';
	const u16At = (o: number): number | null => {
		if (o + 2 > tiff.length) return null;
		return le ? tiff[o] | (tiff[o + 1] << 8) : u16BE(tiff, o);
	};
	const u32At = (o: number): number | null => {
		if (o + 4 > tiff.length) return null;
		return le ? u32LE(tiff, o) : u32BE(tiff, o);
	};
	if (u16At(2) !== 42) return null;

	const scan = (ifd: number): { uc: [number, number] | null; subIfd: number | null } => {
		let uc: [number, number] | null = null;
		let subIfd: number | null = null;
		const count = u16At(ifd);
		if (count === null) return { uc: null, subIfd: null };
		for (let i = 0; i < count; i++) {
			const e = ifd + 2 + i * 12;
			const tag = u16At(e);
			const ty = u16At(e + 2);
			const cnt = u32At(e + 4);
			const val = u32At(e + 8);
			if (tag === null || ty === null || cnt === null || val === null) continue;
			if (tag === 0x8769) subIfd = val;
			else if (tag === 0x9286) {
				const typeSize = ty === 1 || ty === 2 || ty === 6 || ty === 7 ? 1 : ty === 3 || ty === 8 ? 2 : ty === 4 || ty === 9 || ty === 11 ? 4 : 8;
				const len = cnt * typeSize;
				const start = len <= 4 ? e + 8 : val;
				uc = [start, len];
			}
		}
		return { uc, subIfd };
	};

	const ifd0Offset = u32At(4);
	if (ifd0Offset === null) return null;
	const first = scan(ifd0Offset);
	let found = first.uc;
	if (!found && first.subIfd !== null) {
		found = scan(first.subIfd).uc;
	}
	if (!found) return null;
	const [start, len] = found;
	if (start < 0 || start + len > tiff.length) return null;
	return decodeUserComment(tiff.subarray(start, start + len));
}

// ---------------------------------------------------------------------------
// WebP
// ---------------------------------------------------------------------------

function parseWebp(bytes: Uint8Array, out: ContainerMetadata): void {
	if (bytes.length < 12) return;
	const riffSize = u32LE(bytes, 4);
	const end = Math.min(bytes.length, riffSize + 8);
	let pos = 12;
	while (pos + 8 <= end) {
		const id = asciiAt(bytes, pos, 4);
		const size = u32LE(bytes, pos + 4);
		const dataStart = pos + 8;
		const dataEnd = dataStart + size;
		if (dataEnd > end) break;
		const payload = bytes.subarray(dataStart, dataEnd);

		if (id === 'VP8X' && payload.length >= 10) {
			const w = 1 + (payload[4] | (payload[5] << 8) | (payload[6] << 16));
			const h = 1 + (payload[7] | (payload[8] << 8) | (payload[9] << 16));
			out.dimensions = { width: w, height: h };
		} else if (id === 'VP8L' && payload.length >= 5 && payload[0] === 0x2f && !out.dimensions) {
			const bits = u32LE(payload, 1);
			out.dimensions = { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
		} else if (id === 'EXIF') {
			const uc = readExifUserComment(payload);
			if (uc) out.exifUserComment = uc;
		} else if (id === 'XMP ') {
			const xmp = utf8Decoder.decode(payload);
			out.xmpPackets.push(xmp);
		} else if (id === 'C2PA' || id === 'JUMB') {
			out.c2paPresent = true;
		}
		pos = dataEnd + (size & 1);
	}
}

// ---------------------------------------------------------------------------
// JPEG
// ---------------------------------------------------------------------------

function parseJpeg(bytes: Uint8Array, out: ContainerMetadata): void {
	let pos = 2;
	while (pos + 4 <= bytes.length) {
		if (bytes[pos] !== 0xff) break;
		while (pos < bytes.length && bytes[pos] === 0xff) pos++;
		if (pos >= bytes.length) break;
		const marker = bytes[pos++];
		if (marker === 0xd9 || marker === 0xda) break; // EOI / SOS
		if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
		if (pos + 2 > bytes.length) break;
		const segLen = u16BE(bytes, pos);
		if (segLen < 2 || pos + segLen > bytes.length) break;
		const payload = bytes.subarray(pos + 2, pos + segLen);

		if (marker === 0xe1) {
			const xmpHeader = 'http://ns.adobe.com/xap/1.0/\0';
			if (payload.length > xmpHeader.length && asciiAt(payload, 0, xmpHeader.length) === xmpHeader) {
				out.xmpPackets.push(utf8Decoder.decode(payload.subarray(xmpHeader.length)));
			} else if (asciiAt(payload, 0, 6) === 'Exif\0\0') {
				const uc = readExifUserComment(payload);
				if (uc) out.exifUserComment = uc;
			}
		} else if (marker === 0xeb) {
			// APP11 JUMBF / C2PA
			const text = asciiAt(payload, 0, Math.min(payload.length, 64));
			if (text.includes('c2pa') || text.includes('jumb')) {
				out.c2paPresent = true;
			}
		} else if ((marker === 0xc0 || marker === 0xc2) && payload.length >= 5) {
			out.dimensions = { height: u16BE(payload, 1), width: u16BE(payload, 3) };
		}
		pos += segLen;
	}
}

// ---------------------------------------------------------------------------
// ISOBMFF (JXL, MP4, AVIF)
// ---------------------------------------------------------------------------

interface IsoBox {
	kind: string;
	start: number;
	body: number;
	end: number;
}

function walkIsoBoxes(slice: Uint8Array, startOffset: number = 0): IsoBox[] {
	const out: IsoBox[] = [];
	let off = startOffset;
	while (off + 8 <= slice.length && out.length < MAX_ISOBMFF_BOXES) {
		const size32 = u32BE(slice, off);
		const kind = asciiAt(slice, off + 4, 4);
		let size = size32;
		let header = 8;
		if (size32 === 1) {
			if (off + 16 > slice.length) break;
			size = u64BE(slice, off + 8);
			header = 16;
		} else if (size32 === 0) {
			size = slice.length - off;
		}
		const end = off + size;
		if (size < header || end > slice.length) break;
		out.push({ kind, start: off, body: off + header, end });
		off = end;
	}
	return out;
}

function findIsoPath(slice: Uint8Array, path: string[]): Uint8Array | null {
	let current = slice;
	for (let i = 0; i < path.length; i++) {
		const want = path[i];
		const found = walkIsoBoxes(current).find((b) => b.kind === want);
		if (!found) return null;
		current = current.subarray(found.body, found.end);
		if (i + 1 < path.length && want === 'meta') {
			if (current.length < 4) return null;
			current = current.subarray(4);
		}
	}
	return current;
}

function parseJxl(bytes: Uint8Array, out: ContainerMetadata): void {
	if (!matchesAt(bytes, 0, JXL_SIG)) return;
	for (const box of walkIsoBoxes(bytes, JXL_SIG.length)) {
		const payload = bytes.subarray(box.body, box.end);
		if (box.kind === 'xml ') {
			const text = utf8Decoder.decode(payload);
			if (text.trimStart().startsWith('{')) {
				out.textChunks['jxl_xml'] = text;
			} else {
				out.xmpPackets.push(text);
			}
		} else if (box.kind === 'Exif' && payload.length > 4) {
			const uc = readExifUserComment(payload.subarray(4));
			if (uc) out.exifUserComment = uc;
		} else if (box.kind === 'jumb') {
			out.c2paPresent = true;
		}
	}
}

function readMdtaComment(bytes: Uint8Array): string | null {
	const keys = findIsoPath(bytes, ['moov', 'udta', 'meta', 'keys']);
	const ilst = findIsoPath(bytes, ['moov', 'udta', 'meta', 'ilst']);
	if (!keys || !ilst || keys.length < 8) return null;
	const count = Math.min(u32BE(keys, 4), MAX_ISOBMFF_BOXES);
	let off = 8;
	let commentIdx = 0;
	for (let i = 0; i < count; i++) {
		if (off + 8 > keys.length) return null;
		const size = u32BE(keys, off);
		if (size < 8 || off + size > keys.length) return null;
		if (asciiAt(keys, off + 8, size - 8) === 'comment') {
			commentIdx = i + 1;
			break;
		}
		off += size;
	}
	if (commentIdx === 0) return null;
	for (const item of walkIsoBoxes(ilst)) {
		if (u32BE(ilst, item.start + 4) === commentIdx) {
			const itemBody = ilst.subarray(item.body, item.end);
			const dataBox = walkIsoBoxes(itemBody).find((b) => b.kind === 'data');
			if (!dataBox || dataBox.body + 8 > dataBox.end) return null;
			return utf8Decoder.decode(itemBody.subarray(dataBox.body + 8, dataBox.end));
		}
	}
	return null;
}

function readQtComment(bytes: Uint8Array): string | null {
	const udta = findIsoPath(bytes, ['moov', 'udta']);
	if (!udta) return null;
	for (const b of walkIsoBoxes(udta)) {
		if (udta[b.start + 4] === 0xa9 && asciiAt(udta, b.start + 5, 3) === 'cmt') {
			if (b.body + 4 <= b.end) {
				const text = utf8Decoder.decode(udta.subarray(b.body + 4, b.end));
				if (text && !/^\0+$/.test(text)) return text;
			}
		}
	}
	return null;
}

function readAvifExifUserComment(bytes: Uint8Array): string | null {
	const meta = findIsoPath(bytes, ['meta']);
	if (!meta || meta.length < 4) return null;
	const metaBody = meta.subarray(4);
	const iinf = walkIsoBoxes(metaBody).find((b) => b.kind === 'iinf');
	const iloc = walkIsoBoxes(metaBody).find((b) => b.kind === 'iloc');
	if (!iinf || !iloc) return null;

	const iinfBody = metaBody.subarray(iinf.body, iinf.end);
	if (iinfBody.length < 6) return null;
	const iinfVer = iinfBody[0];
	const entries = iinfBody.subarray(iinfVer === 0 ? 6 : 8);
	let exifItemId: number | null = null;
	for (const b of walkIsoBoxes(entries)) {
		if (b.kind !== 'infe') continue;
		const body = entries.subarray(b.body, b.end);
		if (body.length < 12) continue;
		const ver = body[0];
		const id = ver === 2 ? u16BE(body, 4) : ver === 3 ? u32BE(body, 4) : null;
		const typeAt = ver === 2 ? 8 : ver === 3 ? 10 : -1;
		if (id !== null && typeAt >= 0 && asciiAt(body, typeAt, 4) === 'Exif') {
			exifItemId = id;
			break;
		}
	}
	if (exifItemId === null) return null;

	const ilocBody = metaBody.subarray(iloc.body, iloc.end);
	if (ilocBody.length < 8) return null;
	const ilocVer = ilocBody[0];
	const offsetSize = (ilocBody[4] >> 4) & 0x0f;
	const lengthSize = ilocBody[4] & 0x0f;
	const baseSize = (ilocBody[5] >> 4) & 0x0f;
	const indexSize = ilocVer === 1 || ilocVer === 2 ? ilocBody[5] & 0x0f : 0;
	let off = 6;
	const count = ilocVer < 2 ? u16BE(ilocBody, off) : u32BE(ilocBody, off);
	off += ilocVer < 2 ? 2 : 4;

	const readInt = (width: number): number | null => {
		if (width === 0) return 0;
		if (off + width > ilocBody.length) return null;
		const val = width === 4 ? u32BE(ilocBody, off) : width === 8 ? u64BE(ilocBody, off) : null;
		off += width;
		return val;
	};

	for (let i = 0; i < Math.min(count, MAX_ISOBMFF_BOXES); i++) {
		const id = ilocVer < 2 ? u16BE(ilocBody, off) : u32BE(ilocBody, off);
		off += ilocVer < 2 ? 2 : 4;
		if (ilocVer === 1 || ilocVer === 2) off += 2;
		off += 2;
		const base = readInt(baseSize);
		if (base === null || off + 2 > ilocBody.length) return null;
		const extents = u16BE(ilocBody, off);
		off += 2;
		for (let e = 0; e < extents; e++) {
			if (readInt(indexSize) === null) return null;
			const extOff = readInt(offsetSize);
			const extLen = readInt(lengthSize);
			if (extOff === null || extLen === null) return null;
			if (id === exifItemId && e === 0) {
				const absStart = base + extOff;
				if (absStart + extLen > bytes.length) return null;
				const payload = bytes.subarray(absStart, absStart + extLen);
				for (let p = 0; p + 1 < Math.min(payload.length, 16); p++) {
					if ((payload[p] === 0x49 && payload[p + 1] === 0x49) || (payload[p] === 0x4d && payload[p + 1] === 0x4d)) {
						return readExifUserComment(payload.subarray(p));
					}
				}
				return readExifUserComment(payload);
			}
		}
	}
	return null;
}

function parseIsobmffMedia(bytes: Uint8Array, out: ContainerMetadata): void {
	const comment = out.format === 'avif' ? readAvifExifUserComment(bytes) : readMdtaComment(bytes) ?? readQtComment(bytes);
	if (comment) out.mp4Comment = comment;

	for (const box of walkIsoBoxes(bytes)) {
		if (box.kind === 'jumb') {
			out.c2paPresent = true;
		} else if (box.kind === 'uuid' && box.body + 16 <= box.end) {
			if (matchesAt(bytes, box.body, ADOBE_XMP_UUID)) {
				const packet = utf8Decoder.decode(bytes.subarray(box.body + 16, box.end));
				out.xmpPackets.push(packet);
			}
		}
	}
}

// ---------------------------------------------------------------------------
// GIF
// ---------------------------------------------------------------------------

function parseGif(bytes: Uint8Array, out: ContainerMetadata): void {
	if (bytes.length < 13) return;
	out.dimensions = {
		width: bytes[6] | (bytes[7] << 8),
		height: bytes[8] | (bytes[9] << 8)
	};
	const packed = bytes[10];
	let pos = 13;
	if (packed & 0x80) {
		const gctSize = 3 * (1 << ((packed & 0x07) + 1));
		pos += gctSize;
	}
	while (pos < bytes.length) {
		const block = bytes[pos++];
		if (block === 0x3b) break; // Trailer
		if (block === 0x2c) {
			// Image Descriptor
			if (pos + 9 > bytes.length) break;
			const lPacked = bytes[pos + 8];
			pos += 9;
			if (lPacked & 0x80) {
				pos += 3 * (1 << ((lPacked & 0x07) + 1));
			}
			if (pos >= bytes.length) break;
			pos++; // LZW min code size
			while (pos < bytes.length) {
				const subLen = bytes[pos++];
				if (subLen === 0) break;
				pos += subLen;
			}
		} else if (block === 0x21) {
			if (pos >= bytes.length) break;
			const label = bytes[pos++];
			if (label === 0xfe) {
				const parts: Uint8Array[] = [];
				while (pos < bytes.length) {
					const subLen = bytes[pos++];
					if (subLen === 0) break;
					if (pos + subLen > bytes.length) break;
					parts.push(bytes.subarray(pos, pos + subLen));
					pos += subLen;
				}
				const total = parts.reduce((acc, p) => acc + p.length, 0);
				const joined = new Uint8Array(total);
				let off = 0;
				for (const p of parts) {
					joined.set(p, off);
					off += p.length;
				}
				out.gifComment = utf8Decoder.decode(joined);
			} else {
				while (pos < bytes.length) {
					const subLen = bytes[pos++];
					if (subLen === 0) break;
					pos += subLen;
				}
			}
		} else {
			break;
		}
	}
}

export async function extractContainerMetadata(bytes: Uint8Array): Promise<ContainerMetadata> {
	const format = detectFormat(bytes);
	const out: ContainerMetadata = {
		format,
		textChunks: {},
		xmpPackets: [],
		exifUserComment: null,
		gifComment: null,
		mp4Comment: null,
		c2paPresent: false,
		dimensions: null
	};

	switch (format) {
		case 'png':
			await parsePng(bytes, out);
			break;
		case 'webp':
			parseWebp(bytes, out);
			break;
		case 'jxl':
			parseJxl(bytes, out);
			break;
		case 'jpeg':
			parseJpeg(bytes, out);
			break;
		case 'mp4':
		case 'avif':
			parseIsobmffMedia(bytes, out);
			break;
		case 'gif':
			parseGif(bytes, out);
			break;
	}
	return out;
}
