/**
 * Normalizes extracted generation recipes across MooshieUI (SwarmUI JSON),
 * NovelAI (chunks + MooshieUI marker + stealth), A1111 text, and ComfyUI.
 */

import type { ContainerMetadata } from './containers.ts';
import type { IptcResult } from './iptc.ts';

export interface LoraEntry {
	name: string;
	modelWeight?: number;
	clipWeight?: number;
}

export interface NormalizedRecipe {
	tool: string;
	mooshieVersion?: string;
	mooshieSource?: string;
	backend?: string;
	positivePrompt?: string;
	negativePrompt?: string;
	model?: string;
	loras: LoraEntry[];
	seed?: string;
	steps?: string;
	cfg?: string;
	sampler?: string;
	scheduler?: string;
	size?: string;
	rawFields: Record<string, string>;
}

export type RecipeCarrier = 'both' | 'chunks' | 'stealth_alpha' | 'none';

export interface ParsedRecipeResult {
	carrier: RecipeCarrier;
	recoveredFromStealthOnly: boolean;
	recipe: NormalizedRecipe | null;
	mooshieMarker: Record<string, unknown> | null;
	rawSources: {
		containerJson: string | null;
		stealthText: string | null;
		textChunks: Record<string, string>;
	};
}

function asStr(v: unknown): string | undefined {
	if (typeof v === 'string') return v;
	if (typeof v === 'number' || typeof v === 'boolean') return String(v);
	return undefined;
}

function parseLoras(sui: Record<string, unknown>): LoraEntry[] {
	const raw = sui.loras;
	if (!raw) return [];
	if (Array.isArray(raw)) {
		const modelWeights = Array.isArray(sui.loraweights) ? sui.loraweights : [];
		const clipWeights = Array.isArray(sui.loratencweights) ? sui.loratencweights : [];
		const out: LoraEntry[] = [];
		for (let i = 0; i < raw.length; i++) {
			const item = raw[i];
			if (typeof item === 'string') {
				const mw = Number(modelWeights[i] ?? 1);
				const cw = Number(clipWeights[i] ?? mw);
				out.push({
					name: item,
					modelWeight: Number.isFinite(mw) ? mw : 1,
					clipWeight: Number.isFinite(cw) ? cw : 1
				});
			} else if (item && typeof item === 'object') {
				const obj = item as Record<string, unknown>;
				const name = asStr(obj.name ?? obj.model);
				if (name) {
					const mw = Number(obj.strength_model ?? obj.weight ?? 1);
					const cw = Number(obj.strength_clip ?? mw);
					out.push({
						name,
						modelWeight: Number.isFinite(mw) ? mw : undefined,
						clipWeight: Number.isFinite(cw) ? cw : undefined
					});
				}
			}
		}
		return out;
	}
	if (typeof raw === 'string') {
		return raw
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
			.map((part) => {
				const [name, w] = part.split(':');
				const num = w !== undefined ? Number(w) : undefined;
				return { name: name.trim(), modelWeight: num !== undefined && Number.isFinite(num) ? num : undefined };
			});
	}
	return [];
}

function parseSwarmUiJson(
	text: string,
	mooshieMarker: Record<string, unknown> | null
): NormalizedRecipe | null {
	let obj: Record<string, unknown>;
	try {
		obj = JSON.parse(text);
	} catch {
		return null;
	}
	if (!obj || typeof obj !== 'object') return null;
	const sui = (obj.sui_image_params ?? obj) as Record<string, unknown>;
	if (
		typeof sui !== 'object' ||
		(!('prompt' in sui) && !('positive_prompt' in sui) && !('seed' in sui) && !('model' in sui) && !('sui_image_params' in obj))
	) {
		return null;
	}

	const extra = (obj.sui_extra_data ?? obj.mooshie_extra ?? {}) as Record<string, unknown>;
	const rawFields: Record<string, string> = {};
	for (const [k, v] of Object.entries(sui)) {
		if (v === null || v === undefined) continue;
		rawFields[k] = typeof v === 'object' ? JSON.stringify(v) : String(v);
	}

	const width = asStr(sui.width);
	const height = asStr(sui.height);
	const tool =
		asStr(mooshieMarker?.software) ??
		(asStr(extra.software) ??
			('sui_image_params' in obj ? 'MooshieUI / SwarmUI' : 'SwarmUI JSON'));

	return {
		tool,
		mooshieVersion: asStr(mooshieMarker?.version ?? extra.version),
		mooshieSource: asStr(mooshieMarker?.source ?? extra.source),
		backend: asStr(mooshieMarker?.backend ?? extra.backend ?? sui.mooshie_backend),
		positivePrompt: asStr(sui.prompt ?? sui.positive_prompt),
		negativePrompt: asStr(sui.negativeprompt ?? sui.negative_prompt),
		model: asStr(sui.model),
		loras: parseLoras(sui),
		seed: asStr(sui.seed),
		steps: asStr(sui.steps),
		cfg: asStr(sui.cfgscale ?? sui.cfg_scale ?? sui.cfg),
		sampler: asStr(sui.sampler ?? sui.sampler_name),
		scheduler: asStr(sui.scheduler),
		size: width && height ? `${width}x${height}` : undefined,
		rawFields
	};
}

function parseNovelAi(
	chunks: Record<string, string>,
	mooshieMarker: Record<string, unknown> | null
): NormalizedRecipe | null {
	const sw = (chunks.Software ?? '').toLowerCase();
	const src = (chunks.Source ?? '').toLowerCase();
	if (!sw.includes('novelai') && !src.includes('novelai')) return null;

	let comment: Record<string, unknown> = {};
	if (chunks.Comment) {
		try {
			comment = JSON.parse(chunks.Comment);
		} catch {
			comment = {};
		}
	}

	const v4Pos = (comment.v4_prompt as Record<string, unknown> | undefined)?.caption as
		| Record<string, unknown>
		| undefined;
	const v4Neg = (comment.v4_negative_prompt as Record<string, unknown> | undefined)?.caption as
		| Record<string, unknown>
		| undefined;

	const positivePrompt =
		asStr(v4Pos?.base_caption) ?? asStr(comment.prompt) ?? chunks.Description;
	const negativePrompt = asStr(v4Neg?.base_caption) ?? asStr(comment.uc);
	const width = asStr(comment.width);
	const height = asStr(comment.height);

	const rawFields: Record<string, string> = {};
	for (const [k, v] of Object.entries(comment)) {
		if (v !== null && v !== undefined) {
			rawFields[k] = typeof v === 'object' ? JSON.stringify(v) : String(v);
		}
	}

	return {
		tool: mooshieMarker ? 'MooshieUI (NovelAI)' : 'NovelAI',
		mooshieVersion: asStr(mooshieMarker?.version),
		mooshieSource: asStr(mooshieMarker?.source),
		backend: 'novelai',
		positivePrompt,
		negativePrompt,
		model: asStr(mooshieMarker?.model) ?? chunks.Source,
		loras: [],
		seed: asStr(comment.seed),
		steps: asStr(comment.steps),
		cfg: asStr(comment.scale),
		sampler: asStr(comment.sampler),
		scheduler: asStr(comment.noise_schedule),
		size: width && height ? `${width}x${height}` : undefined,
		rawFields
	};
}

function parseA1111Parameters(text: string): NormalizedRecipe | null {
	const trimmed = text.trim();
	if (!trimmed) return null;
	const lines = trimmed.split(/\r?\n/);
	const negIdx = lines.findIndex((l) => l.startsWith('Negative prompt:'));
	const lastLine = lines[lines.length - 1];
	const hasSettings = /Steps:\s*\d+/i.test(lastLine);

	const settingsEnd = hasSettings ? lines.length - 1 : lines.length;
	const posEnd = negIdx >= 0 ? negIdx : settingsEnd;
	const positivePrompt = lines.slice(0, posEnd).join('\n').trim() || undefined;
	const negativePrompt =
		negIdx >= 0
			? lines
					.slice(negIdx, settingsEnd)
					.join('\n')
					.replace(/^Negative prompt:\s*/i, '')
					.trim() || undefined
			: undefined;

	const rawFields: Record<string, string> = {};
	if (hasSettings) {
		for (const part of lastLine.split(/,(?![^"]*":)/)) {
			const colon = part.indexOf(':');
			if (colon > 0) {
				rawFields[part.slice(0, colon).trim()] = part.slice(colon + 1).trim();
			}
		}
	}
	if (!positivePrompt && !hasSettings) return null;

	return {
		tool: 'A1111 / Stable Diffusion WebUI',
		positivePrompt,
		negativePrompt,
		model: rawFields['Model'],
		loras: [],
		seed: rawFields['Seed'],
		steps: rawFields['Steps'],
		cfg: rawFields['CFG scale'],
		sampler: rawFields['Sampler'],
		scheduler: rawFields['Schedule type'],
		size: rawFields['Size'],
		rawFields
	};
}

function parseSinglePayload(
	text: string,
	mooshieMarker: Record<string, unknown> | null
): NormalizedRecipe | null {
	const trimmed = text.trim();
	if (!trimmed) return null;
	if (trimmed.startsWith('{')) {
		let obj: Record<string, unknown> | null = null;
		try {
			obj = JSON.parse(trimmed);
		} catch {
			obj = null;
		}
		if (obj && ('Software' in obj || 'Comment' in obj)) {
			const strMap: Record<string, string> = {};
			for (const [k, v] of Object.entries(obj)) {
				if (v !== null && v !== undefined) {
					strMap[k] = typeof v === 'string' ? v : JSON.stringify(v);
				}
			}
			const nai = parseNovelAi(strMap, mooshieMarker);
			if (nai) return nai;
		}
		const swarm = parseSwarmUiJson(trimmed, mooshieMarker);
		if (swarm) return swarm;
	}
	return parseA1111Parameters(trimmed);
}

export function resolveRecipe(
	container: ContainerMetadata,
	iptc: IptcResult,
	stealthText: string | null
): ParsedRecipeResult {
	let mooshieMarker: Record<string, unknown> | null = null;
	if (container.textChunks.MooshieUI) {
		try {
			mooshieMarker = JSON.parse(container.textChunks.MooshieUI);
		} catch {
			mooshieMarker = null;
		}
	}

	const containerPayload =
		container.textChunks.parameters ??
		container.textChunks.jxl_xml ??
		container.exifUserComment ??
		container.mp4Comment ??
		container.gifComment ??
		iptc.mooshieParametersRaw ??
		null;

	let chunkRecipe: NormalizedRecipe | null = null;
	if (containerPayload) {
		chunkRecipe = parseSinglePayload(containerPayload, mooshieMarker);
	} else {
		chunkRecipe = parseNovelAi(container.textChunks, mooshieMarker);
	}

	if (!chunkRecipe && container.textChunks.prompt) {
		chunkRecipe = {
			tool: 'ComfyUI Workflow',
			loras: [],
			rawFields: { prompt: container.textChunks.prompt }
		};
	}

	const stealthRecipe = stealthText ? parseSinglePayload(stealthText, mooshieMarker) : null;

	let carrier: RecipeCarrier = 'none';
	if (chunkRecipe && stealthRecipe) carrier = 'both';
	else if (chunkRecipe) carrier = 'chunks';
	else if (stealthRecipe) carrier = 'stealth_alpha';

	const recipe = chunkRecipe ?? stealthRecipe;
	const recoveredFromStealthOnly = !chunkRecipe && !!stealthRecipe;

	return {
		carrier,
		recoveredFromStealthOnly,
		recipe,
		mooshieMarker,
		rawSources: {
			containerJson: containerPayload,
			stealthText,
			textChunks: container.textChunks
		}
	};
}
