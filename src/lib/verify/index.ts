import { extractContainerMetadata, type ContainerFormat, type ContainerMetadata } from './containers.ts';
import { parseXmpPackets, type IptcResult } from './iptc.ts';
import { decodeStealthAlpha, type StealthResult } from './stealth.ts';
import { resolveRecipe, type ParsedRecipeResult } from './metadata.ts';

export type { ContainerFormat, ContainerMetadata } from './containers.ts';
export type { IptcResult } from './iptc.ts';
export type { StealthResult } from './stealth.ts';
export type { NormalizedRecipe, ParsedRecipeResult, RecipeCarrier } from './metadata.ts';
export type { TrustMarkProgress, TrustMarkScanResult } from './trustmark.ts';

export interface VerificationReport {
	format: ContainerFormat;
	container: ContainerMetadata;
	iptc: IptcResult;
	stealth: StealthResult;
	parsed: ParsedRecipeResult;
	hasAnyAiSignal: boolean;
}

export async function verifyBytes(bytes: Uint8Array): Promise<VerificationReport> {
	const [container, stealth] = await Promise.all([
		extractContainerMetadata(bytes),
		decodeStealthAlpha(bytes)
	]);
	const iptc = parseXmpPackets(container.xmpPackets, container.c2paPresent);
	const parsed = resolveRecipe(container, iptc, stealth.rawText);

	const hasAnyAiSignal =
		iptc.isAiDisclosed ||
		iptc.c2paPresent ||
		stealth.found ||
		parsed.recipe !== null ||
		parsed.mooshieMarker !== null;

	return {
		format: container.format,
		container,
		iptc,
		stealth,
		parsed,
		hasAnyAiSignal
	};
}

export async function verifyFile(file: File): Promise<VerificationReport> {
	const buf = await file.arrayBuffer();
	return verifyBytes(new Uint8Array(buf));
}
