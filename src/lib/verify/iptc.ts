/**
 * IPTC DigitalSourceType & XMP AI disclosure parser.
 */

export interface IptcResult {
	xmpFound: boolean;
	isAiDisclosed: boolean;
	digitalSourceType: string | null;
	sourceTypeLabel: string | null;
	creatorTool: string | null;
	mooshieParametersRaw: string | null;
	c2paPresent: boolean;
	rawXmpPackets: string[];
}

const DIGITAL_SOURCE_LABELS: Record<string, string> = {
	trainedAlgorithmicMedia: 'Trained algorithmic media (Generative AI)',
	compositeWithTrainedAlgorithmicMedia: 'Composite with trained algorithmic media',
	algorithmicMedia: 'Algorithmic media (non-ML procedural)',
	digitalCapture: 'Digital capture (camera)',
	compositeCapture: 'Composite capture',
	negativeFilm: 'Digitized film negative',
	positiveFilm: 'Digitized film positive',
	print: 'Digitized print',
	humanEdits: 'Minor human edits',
	minorHumanEdits: 'Minor human edits',
	compositeSynthetic: 'Composite synthetic',
	virtualRecording: 'Virtual recording',
	dataDrivenMedia: 'Data-driven media'
};

const AI_DISCLOSURE_CODES = new Set([
	'trainedAlgorithmicMedia',
	'compositeWithTrainedAlgorithmicMedia',
	'compositeSynthetic',
	'algorithmicMedia'
]);

function decodeXmlEntities(text: string): string {
	return text
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&amp;/g, '&');
}

function extractDigitalSourceType(xmp: string): string | null {
	// Attribute form: iptcExt:DigitalSourceType="..." (any prefix)
	const attrMatch = xmp.match(
		/\b(?:[A-Za-z_][\w.-]*:)?DigitalSourceType\s*=\s*["']([^"']+)["']/i
	);
	if (attrMatch) return attrMatch[1].trim();

	// Element text or rdf:resource form: <...:DigitalSourceType ...>...</...:DigitalSourceType>
	const elemMatch = xmp.match(
		/<(?:[A-Za-z_][\w.-]*:)?DigitalSourceType(?:\s+[^>]*)?(?:\brdf:resource\s*=\s*["']([^"']+)["'][^>]*\/>|>([^<]+)<)/i
	);
	if (elemMatch) {
		return (elemMatch[1] ?? elemMatch[2] ?? '').trim() || null;
	}
	return null;
}

function extractCreatorTool(xmp: string): string | null {
	const attrMatch = xmp.match(/\b(?:[A-Za-z_][\w.-]*:)?CreatorTool\s*=\s*["']([^"']+)["']/);
	if (attrMatch) return decodeXmlEntities(attrMatch[1].trim());
	const elemMatch = xmp.match(
		/<(?:[A-Za-z_][\w.-]*:)?CreatorTool[^>]*>([^<]+)<\/(?:[A-Za-z_][\w.-]*:)?CreatorTool>/
	);
	if (elemMatch) return decodeXmlEntities(elemMatch[1].trim());
	return null;
}

function extractMooshieParameters(xmp: string): string | null {
	const match = xmp.match(/<mooshie:parameters>([\s\S]*?)<\/mooshie:parameters>/);
	if (!match) return null;
	return decodeXmlEntities(match[1].trim());
}

export function parseXmpPackets(packets: string[], c2paPresent: boolean = false): IptcResult {
	let digitalSourceType: string | null = null;
	let creatorTool: string | null = null;
	let mooshieParametersRaw: string | null = null;

	for (const xmp of packets) {
		if (!digitalSourceType) digitalSourceType = extractDigitalSourceType(xmp);
		if (!creatorTool) creatorTool = extractCreatorTool(xmp);
		if (!mooshieParametersRaw) mooshieParametersRaw = extractMooshieParameters(xmp);
	}

	let shortCode: string | null = null;
	if (digitalSourceType) {
		const tail = digitalSourceType.split('/').pop() ?? digitalSourceType;
		shortCode = tail.trim();
	}

	const isAiDisclosed = shortCode !== null && AI_DISCLOSURE_CODES.has(shortCode);
	const sourceTypeLabel = shortCode
		? (DIGITAL_SOURCE_LABELS[shortCode] ?? shortCode)
		: null;

	return {
		xmpFound: packets.length > 0,
		isAiDisclosed,
		digitalSourceType,
		sourceTypeLabel,
		creatorTool,
		mooshieParametersRaw,
		c2paPresent,
		rawXmpPackets: packets
	};
}
