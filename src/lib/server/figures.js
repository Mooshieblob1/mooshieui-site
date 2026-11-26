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

const shot = (src, alt, caption) =>
	`<figure class="wk-fig wk-shot"><div class="wk-shot-frame"><img src="${src}" alt="${alt}" loading="lazy" decoding="async" /></div><figcaption>${caption}</figcaption></figure>`;

const phoneShot = (src, alt, caption) =>
	`<figure class="wk-fig wk-shot"><div class="wk-shot-frame is-phone"><img src="${src}" alt="${alt}" loading="lazy" decoding="async" /></div><figcaption>${caption}</figcaption></figure>`;

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
		}
	],
	'generation-basics': [
		{
			after: 'Page layout',
			html: shot('/assets/app-screenshot.avif', 'The MooshieUI Generate page with panels around the preview', 'The Generate page on desktop: left panel, preview, right panel and the generate footer.')
		}
	],
	'prompt-assistant': [
		{
			after: 'What it does',
			html: shot(
				'/assets/screenshots/ui-enhance-v5.avif',
				'MooshieUI Prompt Assistant modal in Enhance for V5 mode breaking down base and character prompts with applied recipes',
				'Enhance for V5 splitting base scene tags and isolated multi-character prompts inside the Prompt Assistant modal.'
			)
		}
	],
	'novelai-backend': [
		{
			after: 'Characters',
			html: shot(
				'/assets/screenshots/ui-novelai-workspace.avif',
				'MooshieUI NovelAI V5 Full workspace with multi-character slots, Precise Reference character cards, and Anlas indicator',
				'NovelAI V5 Full workspace: per-character positive and undesired prompts, Precise Reference portraits, and Anlas budgeting.'
			)
		}
	],
	'video-generation': [
		{
			after: 'Timeline',
			html: shot(
				'/assets/screenshots/ui-video-timeline.avif',
				'MooshieUI Video mode with the multi-shot Timeline storyboard drawer open showing shot bars and reference tracks',
				'Video Timeline drawer with multi-shot duration segments, MiniMax prompt format, motion refs, and audio refs.'
			)
		}
	],
	'music-generation': [
		{
			after: 'Compose a song',
			html: shot(
				'/assets/screenshots/ui-music-studio.avif',
				'MooshieUI Music studio YuE2 view with style prompt, section lyrics, vinyl player, waveform scrubber, and FLAC export',
				'Music studio YuE2 composer with style tags, lyric sections, waveform scrubbing, and lossless FLAC download.'
			)
		}
	],
	'comic-pages': [
		{
			after: 'Layout',
			html: shot(
				'/assets/screenshots/ui-comic-pages.avif',
				'MooshieUI Comic Page editor showing a three-panel layout, vector speech bubbles, model settings, and CBZ or PDF export',
				'Comic Page editor with multi-panel layout, movable caption and speech bubbles, and CBZ/PDF export.'
			)
		}
	],
	'gallery-and-metadata': [
		{
			after: 'Gallery',
			html: shot(
				'/assets/screenshots/ui-gallery.avif',
				'MooshieUI Gallery filtered by boards with search, rating filters, and character-tagged illustrations',
				'Gallery page organized into boards with search, metadata filters, star ratings, and favourites.'
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
				'Phone browser layout over LAN or tunnel with collapsible prompt, model, and library drawers.'
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
				'Settings > AI assistants (MCP) with ready-to-copy client commands, JSON config, and Cloudflare tunnel controls.'
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
