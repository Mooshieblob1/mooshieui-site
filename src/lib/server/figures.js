// Site-side graphics for wiki pages. The GitHub wiki is text only, so these are
// added here and placed by heading text, which survives most wiki edits. If a
// heading is renamed, the figure falls back to the top of the page.
import { ICON_PATHS } from '$lib/icons/paths.js';

const icon = (name) =>
	`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] ?? ''}</svg>`;

const node = ({ icon: i, title, sub, accent }) =>
	`<div class="wk-node${accent ? ' is-accent' : ''}"><span class="wk-node-icon">${icon(i)}</span><span class="wk-node-text"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</span></div>`;

const arrow = (label = '') =>
	`<div class="wk-arrow" aria-hidden="true"><span class="wk-arrow-line"></span>${label ? `<span class="wk-arrow-label">${label.split('\n').map((t) => `<span>${t}</span>`).join('')}</span>` : ''}</div>`;

/** Columns of nodes joined by labelled arrows; stacks vertically on phones. */
export function flow(columns, caption) {
	const parts = [];
	columns.forEach((col, i) => {
		if (i > 0) parts.push(arrow(col.via));
		parts.push(`<div class="wk-flow-col">${col.nodes.map(node).join('')}</div>`);
	});
	return `<figure class="wk-fig wk-flow"><div class="wk-flow-row">${parts.join('')}</div>${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;
}

const shot = (src, alt, caption, width = 1280, height = 720) =>
	`<figure class="wk-fig wk-shot"><div class="wk-shot-frame"><img src="${src}" width="${width}" height="${height}" alt="${alt}" loading="lazy" decoding="async" /></div><figcaption>${caption}</figcaption></figure>`;

const phoneShot = (src, alt, caption, width = 860, height = 1864) =>
	`<figure class="wk-fig wk-shot"><div class="wk-shot-frame is-phone"><img src="${src}" width="${width}" height="${height}" alt="${alt}" loading="lazy" decoding="async" /></div><figcaption>${caption}</figcaption></figure>`;

/** Grid of link cards that jump to sections of the same page. */
const choices = (items, caption) => (headings) => {
	const cards = items
		.map((c) => {
			const h = headings.find((h) => h.text.toLowerCase().startsWith(c.heading.toLowerCase()));
			const href = h ? `#${h.id}` : '#';
			return `<a class="wk-choice" href="${href}"><span class="wk-node-icon">${icon(c.icon)}</span><b>${c.title}</b><small>${c.sub}</small></a>`;
		})
		.join('');
	return `<figure class="wk-fig wk-choices">${cards}${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;
};

/** The big picture, used on the wiki home page. */
export const OVERVIEW_FLOW = flow(
	[
		{
			nodes: [
				{ icon: 'laptop', title: 'Desktop app', sub: 'Windows, Linux, Apple Silicon' },
				{ icon: 'phone', title: 'Browser or phone', sub: 'Server mode, LAN, Docker' },
				{ icon: 'bot', title: 'AI assistants (MCP)', sub: 'Claude, Cursor, ChatGPT' }
			]
		},
		{ nodes: [{ icon: 'sparkles', title: 'MooshieUI', sub: 'Guided UI, Prompt Assistant, gallery', accent: true }] },
		{
			nodes: [
				{ icon: 'cpu', title: 'ComfyUI', sub: 'Managed, your own, or remote' },
				{ icon: 'key', title: 'NovelAI API', sub: 'First-class backend, your key' },
				{ icon: 'cloud', title: 'ElevenLabs, fal.ai', sub: 'Anime Scenes, your keys' }
			]
		}
	],
	'One interface across ComfyUI, NovelAI, LLM prompting, and optional cloud services.'
);

/**
 * Figures per page slug. `after` is the start of a heading's text (case-insensitive);
 * null places the figure under the page intro, before the first section.
 */
export const FIGURES = {
	installation: [
		{
			after: null,
			html: choices([
				{ icon: 'download', title: 'One-click setup', sub: 'Windows and Linux installers', heading: 'One-click setup' },
				{ icon: 'container', title: 'Docker', sub: 'Self-host the web server', heading: 'Self-host' },
				{ icon: 'terminal', title: 'Your own ComfyUI', sub: 'No managed install', heading: 'Use your own ComfyUI' },
				{ icon: 'cloud', title: 'Remote ComfyUI', sub: 'RunPod, Vast.ai and others', heading: 'Remote' },
				{ icon: 'laptop', title: 'macOS', sub: 'Apple Silicon DMG', heading: 'macOS' }
			])
		},
		{
			after: 'One-click setup',
			html: shot(
				'/assets/wiki/wiki-install-setup.avif',
				'Desktop workstation, studio laptop, and smartphone linked cleanly across local, LAN, and remote setups',
				'Run the desktop installer with managed ComfyUI, connect NovelAI directly, or serve any browser over LAN and Docker.'
			)
		}
	],
	'generation-basics': [
		{
			after: 'Page layout',
			html: shot('/assets/app-screenshot.avif', 'The MooshieUI Generate page with panels around the preview', 'The Generate page on desktop: left panel, preview, right panel and the generate footer.', 1718, 1376)
		}
	],
	'prompting-guide': [
		{
			after: 'Random prompt syntax',
			html: shot(
				'/assets/wiki/wiki-prompt-variations.avif',
				'Three variations of the same glass conservatory scene at golden dawn, rainy blue hour with hanging lanterns, and starry night with a desk lamp',
				'Random alternation and wildcards vary lighting, weather, and mood from one shared base scene.'
			)
		}
	],
	'anima-prompting': [
		{
			after: 'Non-anime styles: dataset tags',
			html: shot(
				'/assets/wiki/wiki-anima-styles.avif',
				'Three-panel study of the same braided character rendered in loose watercolor wash, sepia ink crosshatching, and textured gouache impasto',
				'Dataset style tags steer Anima smoothly into watercolor, ink lineart, or textured impasto strokes.'
			)
		}
	],
	'novelai-prompting': [
		{
			after: 'Several characters',
			html: shot(
				'/assets/wiki/wiki-novelai-multichar.avif',
				'Two distinct anime characters on opposite sides of a coastal stone promenade without bleeding outfits or traits',
				'Multi-character prompt blocks and coordinates keep distinct hair, outfits, and accessories cleanly separated.'
			)
		}
	],
	'prompt-assistant': [
		{
			after: 'What it does',
			html: shot(
				'/assets/screenshots/ui-enhance-v5.avif',
				'MooshieUI Prompt Assistant modal in Enhance for V5 mode breaking down base and character prompts with applied recipes',
				'Enhance for V5 splitting base scene tags and isolated multi-character prompts inside the Prompt Assistant modal.',
				1500,
				940
			)
		}
	],
	'novelai-backend': [
		{
			after: 'Characters',
			html: shot(
				'/assets/screenshots/ui-novelai-workspace.avif',
				'MooshieUI NovelAI V5 Full workspace with multi-character slots, Precise Reference character cards, and Anlas indicator',
				'NovelAI V5 Full workspace: per-character positive and undesired prompts, Precise Reference portraits, and Anlas budgeting.',
				1500,
				940
			)
		}
	],
	'video-generation': [
		{
			after: 'Timeline',
			html: shot(
				'/assets/screenshots/ui-video-timeline.avif',
				'MooshieUI Video mode with the multi-shot Timeline storyboard drawer open showing shot bars and reference tracks',
				'Video Timeline drawer with multi-shot duration segments, MiniMax prompt format, motion refs, and audio refs.',
				1500,
				940
			)
		}
	],
	'anime-scenes': [
		{
			after: 'Keyframes (optional)',
			html: shot(
				'/assets/wiki/wiki-anime-scenes.avif',
				'Cinematic dusk anime scene of a traveler on a rain-slicked platform beside the warm windows of a coastal train',
				'Anime Scenes pair consistent character design, dialogue tracks, SFX, and video generation from a single script.'
			)
		}
	],
	'comic-pages': [
		{
			after: 'Layout',
			html: shot(
				'/assets/screenshots/ui-comic-pages.avif',
				'MooshieUI Comic Page editor showing a three-panel layout, vector speech bubbles, model settings, and CBZ or PDF export',
				'Comic Page editor with multi-panel layout, movable caption and speech bubbles, and CBZ/PDF export.',
				1500,
				940
			)
		}
	],
	'music-generation': [
		{
			after: 'Compose a song',
			html: shot(
				'/assets/screenshots/ui-music-studio.avif',
				'MooshieUI Music studio YuE2 view with style prompt, section lyrics, vinyl player, waveform scrubber, and FLAC export',
				'Music studio YuE2 composer with style tags, lyric sections, waveform scrubbing, and lossless FLAC download.',
				1500,
				940
			)
		}
	],
	'image-to-3d': [
		{
			after: 'Viewer',
			html: shot(
				'/assets/wiki/wiki-image-to-3d.avif',
				'Stylized 2D illustration of a mechanical brass-and-oak owl beside its 3D turntable reconstruction showing shaded PBR geometry and wireframe topology',
				'Single-image reconstruction turns a clean 2D subject into an inspectable 3D mesh or Gaussian splat.'
			)
		}
	],
	'upscaling-and-face-fix': [
		{
			after: 'Upscale (tiled diffusion)',
			html: shot(
				'/assets/wiki/wiki-upscale-detail.avif',
				'Split close-up comparison between soft low-resolution input on the left and sharp tiled upscale plus face detailer output on the right',
				'Tiled diffusion upscaling and Face Fix restore crisp hair strands, irises, and stitched fabric detail without seam artifacts.'
			)
		}
	],
	'controlnet-and-style-transfer': [
		{
			after: 'ControlNet',
			html: shot(
				'/assets/wiki/wiki-controlnet-pose.avif',
				'Side-by-side comparison of a white-on-black Canny edge control map on the left and the matching golden-hour anime illustration on the right',
				'Preprocessor maps lock edges, pose, and depth structure while your checkpoint renders the final style.'
			)
		},
		{
			after: 'Style Reference',
			html: shot(
				'/assets/wiki/wiki-style-transfer.avif',
				'Painterly cerulean, ochre, and gold-leaf style study on the left applied to a full coastal harbor town illustration on the right',
				'Style Reference transfers palette, brushwork, and surface texture from a reference study onto new scenes.'
			)
		}
	],
	'inpainting-and-the-canvas-editor': [
		{
			after: 'Mask painting',
			html: shot(
				'/assets/wiki/wiki-inpaint-mask.avif',
				'Before-and-after inpainting split showing a magenta mask painted over a white shirt on the left and a fitted navy courier jacket replacing it on the right',
				'Paint a mask directly over the region to change while keeping face, pose, and background untouched.'
			)
		},
		{
			after: 'Outpainting',
			html: shot(
				'/assets/wiki/wiki-outpaint.avif',
				'Panoramic coastal rooftop cafe showing the dashed inner original square expanded outward across pergola arches, sea cliffs, and harbor rooftops',
				'Extend any edge around an existing crop to reveal wider architecture and scenery in matching style.'
			)
		}
	],
	'image-edit-mode': [
		{
			after: 'Using it',
			html: shot(
				'/assets/wiki/wiki-image-edit.avif',
				'Before-and-after architectural edit changing a sunlit summer glass conservatory into a snowy winter twilight interior with glowing lanterns',
				'Instruction-based Image Edit transforms lighting, season, wardrobe, or objects from words without painting a mask.'
			)
		}
	],
	'image-editor': [
		{
			after: 'Layers',
			html: shot(
				'/assets/wiki/wiki-image-editor.avif',
				'Isometric stack of three floating digital artwork layers separating lineart sketch, flat color fills, and warm lighting glow',
				'Non-destructive layer stacks keep adjustments, paint strokes, and color grading isolated while preserving generation metadata.'
			)
		}
	],
	'compare-grid': [
		{
			after: null,
			html: shot(
				'/assets/wiki/wiki-compare-grid.avif',
				'Four-cell parameter sweep grid showing A1 Golden Hour, B1 Pastel Dawn, A2 Amber Dusk, and B2 Cel Contrast across the same base composition',
				'Parameter sweeps share one seed across A1/B1/A2/B2 cells and stitch diffs cleanly into one grid image.'
			)
		}
	],
	'image-comparison': [
		{
			after: 'Modes',
			html: shot(
				'/assets/wiki/wiki-image-comparison.avif',
				'Interactive slider comparison splitting one continuous coastal railway viaduct between sunset lighting on side A and moonlight on side B',
				'Pin any two results as A and B to swipe a live divider, fade-blend, or highlight pixel differences.'
			)
		}
	],
	'models-and-the-model-hub': [
		{
			after: 'Smart model detection and architecture presets',
			html: shot(
				'/assets/wiki/wiki-model-hub.avif',
				'Four-column showcase comparing anime cel shading, oil painting, architectural photography, and miniature diorama model styles side by side',
				'MooshieUI inspects weights and metadata to pair each model family with matching samplers, schedules, and defaults.'
			)
		}
	],
	'gallery-and-metadata': [
		{
			after: 'Gallery',
			html: shot(
				'/assets/screenshots/ui-gallery.avif',
				'MooshieUI Gallery filtered by boards with search, rating filters, and character-tagged illustrations',
				'Gallery page organized into boards with search, metadata filters, star ratings, and favourites.',
				1500,
				940
			)
		}
	],
	'server-lan-and-multi-user': [
		{
			after: 'Running the server',
			html: flow(
				[
					{
						nodes: [
							{ icon: 'phone', title: 'Phones, tablets', sub: 'Mobile layout' },
							{ icon: 'laptop', title: 'Other computers', sub: 'Any browser' }
						]
					},
					{
						via: 'LAN\nport 3200',
						nodes: [{ icon: 'server', title: 'MooshieUI server', sub: 'Accounts, roles, gallery', accent: true }]
					},
					{ nodes: [{ icon: 'cpu', title: 'ComfyUI', sub: 'Your GPU' }] }
				],
				'Every device on your network uses the same server and queue.'
			)
		},
		{
			after: 'Phone layout',
			html: phoneShot(
				'/assets/screenshots/ui-mobile.avif',
				'MooshieUI responsive mobile browser view showing live artwork preview, compact controls, and five-tab navigation',
				'Phone browser layout over LAN or tunnel with collapsible prompt, model, and library drawers.',
				860,
				1864
			)
		}
	],
	'settings-and-accessibility': [
		{
			after: 'Appearance and i18n',
			html: shot(
				'/assets/wiki/wiki-themes-a11y.avif',
				'Five UI theme palette swatch cards ranging from dark charcoal and amber-gold to slate blue and light parchment',
				'Choose built-in themes or save custom accent profiles with font scaling and accessible high-contrast UI tokens.'
			)
		}
	],
	'ai-assistants-and-mcp': [
		{
			after: 'Turning it on',
			html: flow(
				[
					{
						nodes: [
							{ icon: 'terminal', title: 'Claude Code, Cursor', sub: 'Apps on this computer' },
							{ icon: 'cloud', title: 'Claude.ai, ChatGPT', sub: 'Through a tunnel' }
						]
					},
					{
						via: 'Token\n127.0.0.1:3210',
						nodes: [{ icon: 'bot', title: 'MCP server', sub: 'Off by default', accent: true }]
					},
					{
						nodes: [
							{ icon: 'image', title: 'Generate', sub: 'Images and music' },
							{ icon: 'list', title: 'Queue, gallery', sub: 'Check and search' }
						]
					}
				],
				'Assistants reach MooshieUI through the opt-in MCP server.'
			)
		},
		{
			after: 'Connecting an assistant',
			html: shot(
				'/assets/screenshots/ui-mcp-settings.avif',
				'MooshieUI Settings screen on AI assistants (MCP) showing localhost URL, bearer token, Claude Code command, JSON config, and Cloudflare tunnel',
				'Settings > AI assistants (MCP) with ready-to-copy client commands, JSON config, and Cloudflare tunnel controls.',
				1500,
				940
			)
		}
	],
	faq: [
		{
			after: null,
			html: choices(
				[
					{ icon: 'shuffle', title: 'Prompt wildcards', sub: 'Inline choices and Chunks', heading: 'Where do I put wildcards' },
					{ icon: 'image', title: 'Recover settings', sub: 'Embedded image metadata', heading: 'How do I recover' },
					{ icon: 'phone', title: 'Phone & tablet UI', sub: 'Browser mode on LAN', heading: 'Can I run this on my phone' },
					{ icon: 'cloud', title: 'Cloud GPUs', sub: 'Connect a remote ComfyUI', heading: 'ComfyUI is on a cloud GPU' }
				],
				'Common starting points across prompting, metadata, mobile, and remote setups.'
			)
		}
	],
	contributing: [
		{
			after: 'Before opening a PR',
			html: flow(
				[
					{ nodes: [{ icon: 'edit', title: 'Frontend gates', sub: 'npm run check (i18n, portals, types)' }] },
					{
						nodes: [
							{ icon: 'cpu', title: 'Desktop check', sub: 'cargo check + cargo test' },
							{ icon: 'server', title: 'Server check', sub: '--no-default-features --features server' }
						]
					},
					{
						via: 'PR CI',
						nodes: [{ icon: 'shield-check', title: 'Guardrails & Audit', sub: 'Clippy, bundle audit, review', accent: true }]
					}
				],
				'Verify both the frontend build gates and both Rust feature configurations before opening a PR.'
			)
		}
	],
	'project-scope': [
		{
			after: 'What MooshieUI is',
			html: shot(
				'/assets/wiki/wiki-project-scope.avif',
				'Creator desk setup showing illustration sketchbook, storyboard panels, blank cinema clapperboard, golden vinyl record, and sculpted brass owl figure',
				'MooshieUI focuses on guided workflows across images, video, music, comics, and experimental 3D without turning into a raw graph editor.'
			)
		}
	],

	// Key technical reference repo docs (reuse curated visuals and UI screenshots)
	'mcp-reference': [
		{
			after: 'How it works',
			html: shot(
				'/assets/screenshots/ui-mcp-settings.avif',
				'MooshieUI Settings screen on AI assistants (MCP) showing localhost URL, bearer token, Claude Code command, JSON config, and Cloudflare tunnel',
				'MCP server configuration in Settings > AI assistants (MCP).',
				1500,
				940
			)
		}
	],
	'random-prompt-syntax': [
		{
			after: 'Basic alternation',
			html: shot(
				'/assets/wiki/wiki-prompt-variations.avif',
				'Three variations of the same conservatory scene showing dawn, blue hour rain, and starry night rolls',
				'Brace alternation rolls different lighting, weather, and style clauses cleanly across seeds.'
			)
		}
	],
	'style-reference': [
		{
			after: 'Using the panel',
			html: shot(
				'/assets/wiki/wiki-style-transfer.avif',
				'Painterly cerulean and gold-leaf style study applied to a coastal harbor village illustration',
				'Style reference inputs steer palette and brushstroke style across Redux, IP-Adapter, and Anima adapters.'
			)
		}
	],
	'video-methods': [
		{
			after: 'Timeline stills in the middle of a clip',
			html: shot(
				'/assets/screenshots/ui-video-timeline.avif',
				'MooshieUI Video Timeline drawer showing multi-shot segments, motion references, and audio tracks',
				'The Video Timeline maps shot ranges, stills, and audio tracks onto H3 generation parameters.',
				1500,
				940
			)
		}
	],
	'music-studio': [
		{
			after: 'Create and review a score',
			html: shot(
				'/assets/screenshots/ui-music-studio.avif',
				'MooshieUI Music studio YuE2 view with style prompt, lyric sections, waveform player, and FLAC export',
				'Music studio workspace with section lyrics, waveform scrubber, manual timing sync, and lossless FLAC export.',
				1500,
				940
			)
		}
	],
	'image-to-3d-reference': [
		{
			after: 'Pixal3D (textured mesh)',
			html: shot(
				'/assets/wiki/wiki-image-to-3d.avif',
				'Stylized 2D mechanical owl illustration beside its shaded and wireframe 3D mesh reconstruction',
				'Single-image 3D pipeline output across textured meshes (Pixal3D) and Gaussian splats (Idol).'
			)
		}
	],
	'seedance-prompting-rules': [
		{
			after: 'Prompt shape',
			html: shot(
				'/assets/wiki/wiki-anime-scenes.avif',
				'Cinematic anime dusk frame at a rain-slicked station platform beside glowing train windows',
				'Seedance scene generation pairs concise camera motion prompts with character references and dialogue tracks.'
			)
		}
	],
	'metadata-carriers': [
		{
			after: 'What is written',
			html: shot(
				'/assets/screenshots/ui-gallery.avif',
				'MooshieUI Gallery displaying saved illustrations with embedded metadata boards, star ratings, and character filters',
				'Gallery search and Image Info read embedded MooshieUI metadata across PNG, WebP, JXL, and MP4 outputs.',
				1500,
				940
			)
		}
	]
};

/** Inserts a page's figures into its rendered HTML. */
export function withFigures(slug, html, headings) {
	const figs = FIGURES[slug];
	if (!figs) return html;
	let out = html;
	for (const f of figs) {
		const markup = typeof f.html === 'function' ? f.html(headings) : f.html;
		const h = f.after && headings.find((h) => h.text.toLowerCase().startsWith(f.after.toLowerCase()));
		if (h) {
			const re = new RegExp(`(<h${h.depth} id="${h.id}">[\\s\\S]*?</h${h.depth}>\\n?)`);
			if (re.test(out)) {
				out = out.replace(re, `$1${markup}`);
				continue;
			}
		}
		// Under the intro: before the first section heading, or at the end.
		const first = out.search(/<h2 /);
		out = first === -1 ? out + markup : out.slice(0, first) + markup + out.slice(first);
	}
	return out;
}
