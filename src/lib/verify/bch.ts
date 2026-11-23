/**
 * TrustMark 100-bit payload + BCH error-correcting decoder.
 * Direct TypeScript port of `src-tauri/src/watermark/trustmark/{bch,bits}.rs`
 * (Adobe TrustMark 0.4.0, MIT License).
 */

export const BCH_POLYNOMIAL = 137;
export const PAYLOAD_BITS = 100;
export const MOOSHIE_TAG_BITS = '10110010';
export const MOOSHIE_ID_BITS = 53;

export type BchVersion = 'BchSuper' | 'Bch5' | 'Bch4' | 'Bch3';

interface VersionSpec {
	name: BchVersion;
	allowedBitFlips: number;
	dataBits: number;
	bitstring: string;
}

const VERSIONS: Record<BchVersion, VersionSpec> = {
	BchSuper: { name: 'BchSuper', allowedBitFlips: 8, dataBits: 40, bitstring: '0000' },
	Bch5: { name: 'Bch5', allowedBitFlips: 5, dataBits: 61, bitstring: '0001' },
	Bch4: { name: 'Bch4', allowedBitFlips: 4, dataBits: 68, bitstring: '0010' },
	Bch3: { name: 'Bch3', allowedBitFlips: 3, dataBits: 75, bitstring: '0011' }
};

const VERSION_BY_BITS: Record<string, BchVersion> = {
	'0000': 'BchSuper',
	'0001': 'Bch5',
	'0010': 'Bch4',
	'0011': 'Bch3'
};

interface Polynomial {
	deg: number;
	c: number[];
}

interface EccState {
	m: number;
	t: number;
	n: number;
	eccBytes: number;
	eccBits: number;
	cyclicTab: Uint32Array;
	exponents: Uint32Array;
	logarithms: Uint32Array;
	elpPre: Uint32Array;
	errloc: number[];
	eccBuf: Uint32Array;
}

function ilog2(v: number): number {
	return 31 - Math.clz32(v >>> 0);
}

function modn(state: EccState, v: number): number {
	v = v >>> 0;
	while (v >= state.n) {
		v = (v - state.n) >>> 0;
		v = ((v & state.n) + (v >>> state.m)) >>> 0;
	}
	return v;
}

function gMul(state: EccState, a: number, b: number): number {
	if (a > 0 && b > 0) {
		const res = (state.logarithms[a] + state.logarithms[b]) % state.n;
		return state.exponents[res];
	}
	return 0;
}

function gPow(state: EccState, i: number): number {
	return state.exponents[modn(state, i)];
}

function gSqrt(state: EccState, a: number): number {
	if (a !== 0) {
		return state.exponents[(2 * state.logarithms[a]) % state.n];
	}
	return 0;
}

function gDiv(state: EccState, a: number, b: number): number {
	if (a !== 0) {
		let idx = state.logarithms[a] + state.n - state.logarithms[b];
		if (idx >= state.n) idx -= state.n;
		return state.exponents[idx];
	}
	return 0;
}

function modFast(n: number, v: number): number {
	return v < n ? v : v - n;
}

export function bchInit(t: number, poly: number = BCH_POLYNOMIAL): EccState {
	const m = ilog2(poly);
	const n = (1 << m) - 1;
	const eccBytes = Math.ceil((m * t) / 8);
	const words = Math.ceil((m * t) / 32);

	const exponents = new Uint32Array(n + 1);
	const logarithms = new Uint32Array(n + 1);
	const elpPre = new Uint32Array(m + 1);

	let x = 1;
	const k = 1 << m;
	for (let i = 0; i < n; i++) {
		exponents[i] = x;
		logarithms[x] = i;
		x = (x * 2) >>> 0;
		if ((x & k) !== 0) {
			x = (x ^ poly) >>> 0;
		}
	}
	logarithms[0] = 0;
	exponents[n] = 1;

	const state: EccState = {
		m,
		t,
		n,
		eccBytes,
		eccBits: 0,
		cyclicTab: new Uint32Array(4 * 256 * words),
		exponents,
		logarithms,
		elpPre,
		errloc: [],
		eccBuf: new Uint32Array(Math.ceil((31 * 64) / 32))
	};

	const roots = new Uint8Array(n + 1);
	for (let i = 0; i < t; i++) {
		let r = 2 * i + 1;
		for (let j = 0; j < m; j++) {
			roots[r] = 1;
			r = (2 * r) % n;
		}
	}

	const g: Polynomial = { deg: 0, c: new Array(m * t + 1).fill(0) };
	g.c[0] = 1;
	for (let i = 0; i < n; i++) {
		if (roots[i] !== 0) {
			const r = exponents[i];
			g.c[g.deg + 1] = 1;
			for (let j = g.deg; j >= 1; j--) {
				g.c[j] = (gMul(state, g.c[j], r) ^ g.c[j - 1]) >>> 0;
			}
			g.c[0] = gMul(state, g.c[0], r);
			g.deg += 1;
		}
	}

	const genpoly = new Uint32Array(Math.ceil((m * t + 1) / 32));
	let rem = g.deg + 1;
	let gpIdx = 0;
	while (rem > 0) {
		const nbits = Math.min(rem, 32);
		let word = 0;
		for (let j = 0; j < nbits; j++) {
			if (g.c[rem - 1 - j] !== 0) {
				word = (word | (1 << (31 - j))) >>> 0;
			}
		}
		genpoly[gpIdx++] = word >>> 0;
		rem -= nbits;
	}
	state.eccBits = g.deg;

	// build_cyclic
	const l = Math.ceil((m * t) / 32);
	const plen = Math.ceil((state.eccBits + 1) / 32);
	const ecclen = Math.ceil(state.eccBits / 32);
	for (let i = 0; i < 256; i++) {
		for (let b = 0; b < 4; b++) {
			const offset = (b * 256 + i) * l;
			let data = (i << (8 * b)) >>> 0;
			while (data !== 0) {
				const d = ilog2(data);
				data = (data ^ (genpoly[0] >>> (31 - d))) >>> 0;
				for (let j = 0; j < ecclen; j++) {
					const hi = d < 31 ? (genpoly[j] << (d + 1)) >>> 0 : 0;
					const lo = j + 1 < plen ? genpoly[j + 1] >>> (31 - d) : 0;
					state.cyclicTab[j + offset] = (state.cyclicTab[j + offset] ^ (hi | lo)) >>> 0;
				}
			}
		}
	}

	let sum = 0;
	let aexp = 0;
	for (let i = 0; i < m; i++) {
		for (let j = 0; j < m; j++) {
			sum = (sum ^ gPow(state, i * (1 << j))) >>> 0;
		}
		if (sum !== 0) {
			aexp = exponents[i];
			break;
		}
	}

	let xv = 0;
	const precomp = new Uint8Array(31);
	let remaining = m;
	while (xv <= n && remaining !== 0) {
		let y = (gSqrt(state, xv) ^ xv) >>> 0;
		for (let i = 0; i < 2; i++) {
			const r = logarithms[y];
			if (y !== 0 && r < m && precomp[r] === 0) {
				elpPre[r] = xv;
				precomp[r] = 1;
				remaining -= 1;
				break;
			}
			y = (y ^ aexp) >>> 0;
		}
		xv += 1;
	}

	return state;
}

export function bchEncode(state: EccState, data: Uint8Array): Uint8Array {
	const l = Math.ceil((state.m * state.t) / 32) - 1;
	const eccMaxWords = Math.ceil((31 * 64) / 32);
	const r = new Uint32Array(eccMaxWords);

	const tab0 = 0;
	const tab1 = tab0 + 256 * (l + 1);
	const tab2 = tab1 + 256 * (l + 1);
	const tab3 = tab2 + 256 * (l + 1);

	let mlen = Math.floor(data.length / 4);
	let offset = 0;
	while (mlen > 0) {
		let w =
			((data[offset] << 24) |
				(data[offset + 1] << 16) |
				(data[offset + 2] << 8) |
				data[offset + 3]) >>>
			0;
		w = (w ^ r[0]) >>> 0;
		const p0 = tab0 + (l + 1) * (w & 0xff);
		const p1 = tab1 + (l + 1) * ((w >>> 8) & 0xff);
		const p2 = tab2 + (l + 1) * ((w >>> 16) & 0xff);
		const p3 = tab3 + (l + 1) * ((w >>> 24) & 0xff);
		for (let i = 0; i < l; i++) {
			r[i] =
				(r[i + 1] ^
					state.cyclicTab[p0 + i] ^
					state.cyclicTab[p1 + i] ^
					state.cyclicTab[p2 + i] ^
					state.cyclicTab[p3 + i]) >>>
				0;
		}
		r[l] =
			(state.cyclicTab[p0 + l] ^
				state.cyclicTab[p1 + l] ^
				state.cyclicTab[p2 + l] ^
				state.cyclicTab[p3 + l]) >>>
			0;
		mlen -= 1;
		offset += 4;
	}

	for (let posn = offset; posn < data.length; posn++) {
		const tmp = data[posn];
		const pidx = (l + 1) * (((r[0] >>> 24) ^ tmp) & 0xff);
		for (let i = 0; i < l; i++) {
			r[i] = (((r[i] << 8) | (r[i + 1] >>> 24)) ^ state.cyclicTab[pidx]) >>> 0;
		}
		r[l] = ((r[l] << 8) ^ state.cyclicTab[pidx]) >>> 0;
	}

	state.eccBuf = r.slice();
	const out = new Uint8Array(state.eccBytes);
	for (let i = 0; i < state.eccBytes; i++) {
		const word = r[i >>> 2];
		const shift = (3 - (i & 3)) * 8;
		out[i] = (word >>> shift) & 0xff;
	}
	return out;
}

function getRoots(state: EccState, kIn: number, poly: Polynomial): number {
	const roots: number[] = [];

	if (poly.deg > 2) {
		const k = kIn * 8 + state.eccBits;
		const rep = new Int32Array(state.t * 2);
		const d = poly.deg;
		const l = state.n - state.logarithms[poly.c[poly.deg]];
		for (let i = 0; i < d; i++) {
			if (poly.c[i] !== 0) {
				rep[i] = modFast(state.n, state.logarithms[poly.c[i]] + l);
			} else {
				rep[i] = -1;
			}
		}
		rep[poly.deg] = 0;
		const syn0 = gDiv(state, poly.c[0], poly.c[poly.deg]);
		for (let i = state.n - k + 1; i <= state.n; i++) {
			let syn = syn0;
			for (let j = 1; j <= poly.deg; j++) {
				const m = rep[j];
				if (m >= 0) {
					syn = (syn ^ gPow(state, m + j * i)) >>> 0;
				}
			}
			if (syn === 0) {
				roots.push(state.n - i);
				if (roots.length === poly.deg) break;
			}
		}
		if (roots.length < poly.deg) {
			state.errloc = [];
			return -1;
		}
	}

	if (poly.deg === 1 && poly.c[0] !== 0) {
		roots.push(
			modFast(
				state.n,
				state.n - state.logarithms[poly.c[0]] + state.logarithms[poly.c[1]]
			)
		);
	}

	if (poly.deg === 2 && poly.c[0] !== 0 && poly.c[1] !== 0) {
		const l0 = state.logarithms[poly.c[0]];
		const l1 = state.logarithms[poly.c[1]];
		const l2 = state.logarithms[poly.c[2]];
		const u = gPow(state, l0 + l2 + 2 * (state.n - l1));
		let r = 0;
		let v = u;
		while (v !== 0) {
			const i = ilog2(v);
			r = (r ^ state.elpPre[i]) >>> 0;
			v = (v ^ (1 << i)) >>> 0;
		}
		if ((gSqrt(state, r) ^ r) === u) {
			roots.push(modn(state, 2 * state.n - l1 - state.logarithms[r] + l2));
			roots.push(modn(state, 2 * state.n - l1 - state.logarithms[r ^ 1] + l2));
		}
	}

	state.errloc = roots;
	return roots.length;
}

export function bchDecode(state: EccState, data: Uint8Array, recvecc: Uint8Array): number {
	bchEncode(state, data);
	state.errloc = [];

	const eccbuf: number[] = [];
	const mlen = Math.floor(recvecc.length / 4);
	let offset = 0;
	for (let i = 0; i < mlen; i++) {
		eccbuf.push(
			((recvecc[offset] << 24) |
				(recvecc[offset + 1] << 16) |
				(recvecc[offset + 2] << 8) |
				recvecc[offset + 3]) >>>
				0
		);
		offset += 4;
	}
	if (offset < recvecc.length) {
		const pad = [0, 0, 0, 0];
		for (let i = 0; i < recvecc.length - offset; i++) {
			pad[i] = recvecc[offset + i];
		}
		eccbuf.push(((pad[0] << 24) | (pad[1] << 16) | (pad[2] << 8) | pad[3]) >>> 0);
	}

	const eccwords = Math.ceil((state.m * state.t) / 32);
	let sum = 0;
	for (let i = 0; i < eccwords; i++) {
		state.eccBuf[i] = (state.eccBuf[i] ^ (eccbuf[i] ?? 0)) >>> 0;
		sum = (sum | state.eccBuf[i]) >>> 0;
	}
	if (sum === 0) return 0;

	let s = state.eccBits;
	const t = state.t;
	const syn = new Uint32Array(2 * t);
	const m = s & 31;
	const synbuf = state.eccBuf.slice();
	if (m !== 0) {
		const idx = Math.floor(s / 32);
		const mask = ~(((1 << (32 - m)) >>> 0) - 1);
		synbuf[idx] = (synbuf[idx] & mask) >>> 0;
	}

	let synptr = 0;
	while (s > 0 || synptr === 0) {
		let poly = synbuf[synptr++];
		s -= 32;
		while (poly !== 0) {
			const i = ilog2(poly);
			for (let j = 0; j < 2 * t; j += 2) {
				syn[j] = (syn[j] ^ gPow(state, (j + 1) * (i + s))) >>> 0;
			}
			poly = (poly ^ (1 << i)) >>> 0;
		}
	}

	for (let i = 0; i < t; i++) {
		syn[2 * i + 1] = gSqrt(state, syn[i]);
	}

	const n = state.n;
	let pp = -1;
	let pd = 1;
	let pelp: Polynomial = { deg: 0, c: new Array(2 * t).fill(0) };
	pelp.c[0] = 1;
	const elp: Polynomial = { deg: 0, c: new Array(2 * t).fill(0) };
	elp.c[0] = 1;
	let d = syn[0];

	for (let i = 0; i < t; i++) {
		if (elp.deg > t) break;
		if (d !== 0) {
			const k = 2 * i - pp;
			const elpCopy: Polynomial = { deg: elp.deg, c: elp.c.slice() };
			const tmp = state.logarithms[d] + n - state.logarithms[pd];
			for (let j = 0; j <= pelp.deg; j++) {
				if (pelp.c[j] !== 0) {
					const l = state.logarithms[pelp.c[j]];
					elp.c[j + k] = (elp.c[j + k] ^ gPow(state, tmp + l)) >>> 0;
				}
			}
			const nextDeg = pelp.deg + k;
			if (nextDeg > elp.deg) {
				elp.deg = nextDeg;
				pelp = elpCopy;
				pd = d;
				pp = 2 * i;
			}
		}
		if (i < t - 1) {
			d = syn[2 * i + 2];
			for (let j = 1; j <= elp.deg; j++) {
				d = (d ^ gMul(state, elp.c[j], syn[2 * i + 2 - j])) >>> 0;
			}
		}
	}

	const nroots = getRoots(state, data.length, elp);
	if (nroots < 0) return 255;

	const nbits = data.length * 8 + state.eccBits;
	for (let i = 0; i < nroots; i++) {
		if (state.errloc[i] >= nbits) return 255;
		let loc = nbits - 1 - state.errloc[i];
		loc = (loc & ~7) | (7 - (loc & 7));
		state.errloc[i] = loc;
	}

	const recvCopy = recvecc.slice();
	for (const bitflip of state.errloc) {
		const byteIdx = Math.floor(bitflip / 8);
		const bit = 1 << (bitflip & 7);
		if (bitflip < (data.length + recvCopy.length) * 8) {
			if (byteIdx < data.length) {
				data[byteIdx] ^= bit;
			} else {
				recvCopy[byteIdx - data.length] ^= bit;
			}
		}
	}

	return nroots;
}

function packBits(bits: string): Uint8Array {
	const out = new Uint8Array(bits.length / 8);
	for (let i = 0; i < out.length; i++) {
		let byte = 0;
		for (let b = 0; b < 8; b++) {
			byte = (byte << 1) | (bits.charCodeAt(i * 8 + b) === 49 ? 1 : 0);
		}
		out[i] = byte;
	}
	return out;
}

function unpackBytes(bytes: Uint8Array): string {
	let out = '';
	for (const b of bytes) {
		out += b.toString(2).padStart(8, '0');
	}
	return out;
}

const eccCache = new Map<BchVersion, EccState>();
function getEccState(version: BchVersion): EccState {
	let s = eccCache.get(version);
	if (!s) {
		s = bchInit(VERSIONS[version].allowedBitFlips, BCH_POLYNOMIAL);
		eccCache.set(version, s);
	}
	return s;
}

function tryDecodeWithVersion(bitstr: string, version: BchVersion): { data: string; version: BchVersion } | null {
	const spec = VERSIONS[version];
	const eccBits = PAYLOAD_BITS - 4 - spec.dataBits;
	const dataPad = spec.dataBits + (8 - (spec.dataBits % 8));
	const eccPad = eccBits + (8 - (eccBits % 8));

	const dataStr = bitstr.slice(0, spec.dataBits).padEnd(dataPad, '0');
	const eccStr = bitstr.slice(spec.dataBits, spec.dataBits + eccBits).padEnd(eccPad, '0');

	const dataBytes = packBits(dataStr);
	const eccBytes = packBits(eccStr);
	const state = getEccState(version);
	const bitflips = bchDecode(state, dataBytes, eccBytes);
	if (bitflips > spec.allowedBitFlips) {
		return null;
	}
	return {
		data: unpackBytes(dataBytes).slice(0, spec.dataBits),
		version
	};
}

export interface DecodedTrustMarkPayload {
	dataBits: string;
	version: BchVersion;
	isMooshieUi: boolean;
	mooshieIdHex: string | null;
}

export function decodeTrustMarkBits(bitstr: string): DecodedTrustMarkPayload | null {
	if (bitstr.length !== PAYLOAD_BITS) return null;
	for (let i = 0; i < bitstr.length; i++) {
		const ch = bitstr[i];
		if (ch !== '0' && ch !== '1') return null;
	}

	const primary: BchVersion = VERSION_BY_BITS[bitstr.slice(96)] ?? 'BchSuper';
	let decoded = tryDecodeWithVersion(bitstr, primary);
	if (!decoded) {
		const order: BchVersion[] = ['Bch3', 'Bch4', 'Bch5', 'BchSuper'];
		for (const candidate of order) {
			if (candidate === primary) continue;
			decoded = tryDecodeWithVersion(bitstr, candidate);
			if (decoded) break;
		}
	}
	if (!decoded) return null;

	const idInfo = parseMooshiePayload(decoded.data, decoded.version);
	return {
		dataBits: decoded.data,
		version: decoded.version,
		isMooshieUi: idInfo !== null,
		mooshieIdHex: idInfo
	};
}

export function decodeTrustMarkLogits(logits: ArrayLike<number>): DecodedTrustMarkPayload | null {
	if (logits.length !== PAYLOAD_BITS) return null;
	let bitstr = '';
	for (let i = 0; i < logits.length; i++) {
		bitstr += logits[i] < 0 ? '0' : '1';
	}
	return decodeTrustMarkBits(bitstr);
}

export function parseMooshiePayload(dataBits: string, version: BchVersion): string | null {
	if (version !== 'Bch5' || dataBits.length !== 61) return null;
	if (!dataBits.startsWith(MOOSHIE_TAG_BITS)) return null;
	const rest = dataBits.slice(MOOSHIE_TAG_BITS.length);
	if (rest.length !== MOOSHIE_ID_BITS) return null;
	const id = BigInt('0b' + rest);
	if (id === 0n) return null;
	return '0x' + id.toString(16).padStart(14, '0');
}
