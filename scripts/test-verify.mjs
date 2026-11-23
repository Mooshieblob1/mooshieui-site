import assert from 'node:assert/strict';
import test from 'node:test';
import zlib from 'node:zlib';

import { bchEncode, bchInit, decodeTrustMarkBits, decodeTrustMarkLogits } from '../src/lib/verify/bch.ts';
import { parseXmpPackets } from '../src/lib/verify/iptc.ts';
import { verifyBytes } from '../src/lib/verify/index.ts';

function crc32(buf) {
	let c = 0xffffffff;
	for (let i = 0; i < buf.length; i++) {
		c ^= buf[i];
		for (let k = 0; k < 8; k++) {
			c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
		}
	}
	return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
	const t = Buffer.from(type, 'ascii');
	const len = Buffer.alloc(4);
	len.writeUInt32BE(data.length, 0);
	const crcBuf = Buffer.alloc(4);
	crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
	return Buffer.concat([len, t, data, crcBuf]);
}

function buildTestPng({ width, height, bitDepth = 8, rgba, chunksBeforeIdat = [], chunksBeforeIend = [] }) {
	const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(width, 0);
	ihdr.writeUInt32BE(height, 4);
	ihdr[8] = bitDepth;
	ihdr[9] = 6; // RGBA
	const bpp = bitDepth === 16 ? 8 : 4;
	const stride = width * bpp;
	const raw = Buffer.alloc(height * (1 + stride));
	for (let y = 0; y < height; y++) {
		raw[y * (1 + stride)] = 0; // filter None
		rgba.copy(raw, y * (1 + stride) + 1, y * stride, (y + 1) * stride);
	}
	const idat = zlib.deflateSync(raw);
	return Uint8Array.from(
		Buffer.concat([
			sig,
			pngChunk('IHDR', ihdr),
			...chunksBeforeIdat,
			pngChunk('IDAT', idat),
			...chunksBeforeIend,
			pngChunk('IEND', Buffer.alloc(0))
		])
	);
}

function encodeStealthRgba(rgba, width, height, bpp, jsonText) {
	const magic = Buffer.from('stealth_pngcomp', 'ascii');
	const gz = zlib.gzipSync(Buffer.from(jsonText, 'utf8'));
	const lenBuf = Buffer.alloc(4);
	lenBuf.writeUInt32BE(gz.length * 8, 0);
	const stream = Buffer.concat([magic, lenBuf, gz]);
	const alphaShift = bpp === 8 ? 6 : 3;

	for (let i = 0; i < width * height; i++) {
		rgba[i * bpp + alphaShift] = 0xff;
		if (bpp === 8) rgba[i * bpp + 7] = 0xff;
	}

	let bitIdx = 0;
	for (const byte of stream) {
		for (let bitPos = 7; bitPos >= 0; bitPos--) {
			const bit = (byte >> bitPos) & 1;
			const x = Math.floor(bitIdx / height);
			const y = bitIdx % height;
			const off = (y * width + x) * bpp + alphaShift;
			rgba[off] = (rgba[off] & 0xfe) | bit;
			bitIdx++;
		}
	}
}

test('BCH-5 matches Rust TrustMark reference vectors', () => {
	const eccZeros = bchEncode(bchInit(8, 137), new Uint8Array(8));
	assert.deepEqual(Array.from(eccZeros), [0, 0, 0, 0, 0, 0, 0]);

	const eccData = bchEncode(
		bchInit(4, 137),
		new Uint8Array([133, 20, 228, 249, 11, 172, 165, 151, 0])
	);
	assert.deepEqual(Array.from(eccData), [115, 32, 10, 0]);

	const ENCODED =
		'1011011110011000111111000000011111011111011100000110110110111000110010101101111010011011000010000001';
	const DATA = '1011011110011000111111000000011111011111011100000110110110111';

	const clean = decodeTrustMarkBits(ENCODED);
	assert.ok(clean);
	assert.equal(clean.dataBits, DATA);
	assert.equal(clean.version, 'Bch5');
	assert.equal(clean.isMooshieUi, false); // starts with 10110111, not 10110010 (0xB2)

	// 5 bitflips corrected
	const flipped = ENCODED.split('');
	for (const i of [0, 13, 27, 44, 60]) {
		flipped[i] = flipped[i] === '1' ? '0' : '1';
	}
	assert.equal(decodeTrustMarkBits(flipped.join(''))?.dataBits, DATA);

	// Corrupted version bits still recovered via fallback scan
	const badVer = '0' + ENCODED.slice(1, 98) + '11';
	assert.equal(decodeTrustMarkBits(badVer)?.dataBits, DATA);

	// MooshieUI 0xB2 payload
	const mooshieData = '10110010' + (0x123456789abcd).toString(2).padStart(53, '0');
	const dataPadded = mooshieData.padEnd(64, '0');
	const packed = new Uint8Array(8);
	for (let i = 0; i < 8; i++) packed[i] = parseInt(dataPadded.slice(i * 8, i * 8 + 8), 2);
	const ecc = bchEncode(bchInit(5, 137), packed);
	let eccBits = '';
	for (const b of ecc) eccBits += b.toString(2).padStart(8, '0');
	const fullPayload = mooshieData + eccBits.slice(0, 35) + '0001';
	const logits = Array.from(fullPayload, (c) => (c === '1' ? 5.0 : -5.0));
	const mooshieDecoded = decodeTrustMarkLogits(logits);
	assert.equal(mooshieDecoded?.isMooshieUi, true);
	assert.equal(mooshieDecoded?.mooshieIdHex, '0x0123456789abcd');
});

test('PNG verifies IPTC XMP, post-IDAT MooshieUI marker, and recovers stripped Stealth Alpha (8-bit & 16-bit)', async () => {
	const json = JSON.stringify({
		sui_image_params: {
			prompt: '1girl, amber eyes',
			negativeprompt: 'lowres',
			model: 'test-model.safetensors',
			seed: 4242,
			steps: 24,
			cfgscale: 5.5,
			sampler: 'euler_ancestral',
			scheduler: 'normal',
			width: 64,
			height: 64
		},
		sui_extra_data: { software: 'MooshieUI', version: '2.4.5' }
	});

	const rgba = Buffer.alloc(64 * 64 * 4, 128);
	encodeStealthRgba(rgba, 64, 64, 4, json);

	const xmp =
		'<?xpacket begin="\ufeff" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:iptcExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" iptcExt:DigitalSourceType="http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia"/></rdf:RDF></x:xmpmeta><?xpacket end="w"?>';
	const itxt = Buffer.concat([
		Buffer.from('XML:com.adobe.xmp\0\0\0\0\0', 'latin1'),
		Buffer.from(xmp, 'utf8')
	]);
	const marker = Buffer.from(
		'MooshieUI\0{"software":"MooshieUI","version":"2.4.5","backend":"novelai","source":"ui"}',
		'latin1'
	);

	// 1. Chunk-stripped PNG (only Stealth Alpha remains!)
	const strippedPng = buildTestPng({ width: 64, height: 64, bitDepth: 8, rgba });
	const strippedRes = await verifyBytes(strippedPng);
	assert.equal(strippedRes.hasAnyAiSignal, true);
	assert.equal(strippedRes.stealth.found, true);
	assert.equal(strippedRes.parsed.carrier, 'stealth_alpha');
	assert.equal(strippedRes.parsed.recoveredFromStealthOnly, true);
	assert.equal(strippedRes.parsed.recipe?.positivePrompt, '1girl, amber eyes');
	assert.equal(strippedRes.parsed.recipe?.seed, '4242');

	// 2. Full PNG with post-IDAT iTXt XMP + MooshieUI marker + zTXt parameters
	const ztxt = Buffer.concat([Buffer.from('parameters\0\0', 'latin1'), zlib.deflateSync(Buffer.from(json, 'utf8'))]);
	const fullPng = buildTestPng({
		width: 64,
		height: 64,
		bitDepth: 8,
		rgba,
		chunksBeforeIdat: [pngChunk('zTXt', ztxt)],
		chunksBeforeIend: [pngChunk('tEXt', marker), pngChunk('iTXt', itxt)]
	});
	const fullRes = await verifyBytes(fullPng);
	assert.equal(fullRes.iptc.isAiDisclosed, true);
	assert.equal(fullRes.parsed.carrier, 'both');
	assert.equal(fullRes.parsed.recoveredFromStealthOnly, false);
	assert.equal(fullRes.parsed.mooshieMarker?.software, 'MooshieUI');

	// 3. 16-bit RGBA PNG Stealth Alpha
	const rgba16 = Buffer.alloc(64 * 64 * 8, 0x80);
	encodeStealthRgba(rgba16, 64, 64, 8, json);
	const png16 = buildTestPng({ width: 64, height: 64, bitDepth: 16, rgba: rgba16 });
	const res16 = await verifyBytes(png16);
	assert.equal(res16.stealth.found, true);
	assert.equal(res16.parsed.recipe?.positivePrompt, '1girl, amber eyes');
});

test('WebP, JXL, MP4, and IPTC XMP parsers detect AI provenance and recipes', async () => {
	const json = JSON.stringify({ sui_image_params: { prompt: 'mountain lake', seed: 77 } });
	const xmp =
		'<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:iptcExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" iptcExt:DigitalSourceType="http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia"/></rdf:RDF></x:xmpmeta>';

	// WebP with EXIF UserComment (UTF-16BE) + XMP
	const ucPayload = Buffer.concat([Buffer.from('UNICODE\0', 'ascii'), Buffer.from(json, 'utf16le').swap16()]);
	const tiff = Buffer.alloc(44 + ucPayload.length);
	tiff.write('II', 0, 'ascii');
	tiff.writeUInt16LE(42, 2);
	tiff.writeUInt32LE(8, 4);
	tiff.writeUInt16LE(1, 8);
	tiff.writeUInt16LE(0x8769, 10);
	tiff.writeUInt16LE(4, 12);
	tiff.writeUInt32LE(1, 14);
	tiff.writeUInt32LE(26, 18);
	tiff.writeUInt16LE(1, 26);
	tiff.writeUInt16LE(0x9286, 28);
	tiff.writeUInt16LE(7, 30);
	tiff.writeUInt32LE(ucPayload.length, 32);
	tiff.writeUInt32LE(44, 36);
	ucPayload.copy(tiff, 44);

	const riffChunk = (id, payload) => {
		const hdr = Buffer.alloc(8);
		hdr.write(id, 0, 4, 'ascii');
		hdr.writeUInt32LE(payload.length, 4);
		return payload.length % 2 ? Buffer.concat([hdr, payload, Buffer.from([0])]) : Buffer.concat([hdr, payload]);
	};
	const vp8x = Buffer.alloc(10);
	vp8x[0] = 0x0c; // EXIF + XMP
	const webpBody = Buffer.concat([
		Buffer.from('WEBP', 'ascii'),
		riffChunk('VP8X', vp8x),
		riffChunk('EXIF', tiff),
		riffChunk('XMP ', Buffer.from(xmp, 'utf8'))
	]);
	const webp = Uint8Array.from(riffChunk('RIFF', webpBody).subarray(0));
	// Fix RIFF header (riffChunk wrote 'RIFF' + size + webpBody)
	const webpRes = await verifyBytes(webp);
	assert.equal(webpRes.format, 'webp');
	assert.equal(webpRes.iptc.isAiDisclosed, true);
	assert.equal(webpRes.parsed.recipe?.positivePrompt, 'mountain lake');

	// JXL with dual xml boxes (JSON first, IPTC XMP second)
	const isoBox = (kind, payload) => {
		const hdr = Buffer.alloc(8);
		hdr.writeUInt32BE(8 + payload.length, 0);
		hdr.write(kind, 4, 4, 'ascii');
		return Buffer.concat([hdr, payload]);
	};
	const jxlSig = Buffer.from([0x00, 0x00, 0x00, 0x0c, 0x4a, 0x58, 0x4c, 0x20, 0x0d, 0x0a, 0x87, 0x0a]);
	const jxl = Uint8Array.from(
		Buffer.concat([
			jxlSig,
			isoBox('ftyp', Buffer.from('jxl \0\0\0\0jxl ', 'ascii')),
			isoBox('xml ', Buffer.from(json, 'utf8')),
			isoBox('xml ', Buffer.from(xmp, 'utf8'))
		])
	);
	const jxlRes = await verifyBytes(jxl);
	assert.equal(jxlRes.format, 'jxl');
	assert.equal(jxlRes.iptc.isAiDisclosed, true);
	assert.equal(jxlRes.parsed.recipe?.seed, '77');

	// MP4 with Adobe XMP uuid box
	const uuidBytes = Buffer.from([
		0xbe, 0x7a, 0xcf, 0xcb, 0x97, 0xa9, 0x42, 0xe8, 0x9c, 0x71, 0x99, 0x94, 0x91, 0xe3, 0xaf, 0xac
	]);
	const mp4Xmp = `<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:mooshie="http://mooshieui.local/ns/1.0/" xmlns:iptcExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" iptcExt:DigitalSourceType="http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia"><mooshie:parameters>${json}</mooshie:parameters></rdf:Description></rdf:RDF></x:xmpmeta>`;
	const mp4 = Uint8Array.from(
		Buffer.concat([
			isoBox('ftyp', Buffer.from('isom\0\0\0\0isom', 'ascii')),
			isoBox('uuid', Buffer.concat([uuidBytes, Buffer.from(mp4Xmp, 'utf8')]))
		])
	);
	const mp4Res = await verifyBytes(mp4);
	assert.equal(mp4Res.format, 'mp4');
	assert.equal(mp4Res.iptc.isAiDisclosed, true);
	assert.equal(mp4Res.parsed.recipe?.positivePrompt, 'mountain lake');

	// Standalone IPTC parser check
	const iptc = parseXmpPackets([xmp]);
	assert.equal(iptc.isAiDisclosed, true);
	assert.equal(iptc.sourceTypeLabel, 'Trained algorithmic media (Generative AI)');
});
