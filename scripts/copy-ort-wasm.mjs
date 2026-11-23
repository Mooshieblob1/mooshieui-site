import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'node_modules', 'onnxruntime-web', 'dist');
const outDir = path.join(root, 'static', 'ort');

const FILES = ['ort-wasm-simd-threaded.wasm', 'ort-wasm-simd-threaded.mjs'];

fs.mkdirSync(outDir, { recursive: true });
for (const file of FILES) {
	const src = path.join(srcDir, file);
	const dst = path.join(outDir, file);
	if (!fs.existsSync(src)) {
		throw new Error(`Missing ONNX Runtime asset: ${src}`);
	}
	fs.copyFileSync(src, dst);
}
