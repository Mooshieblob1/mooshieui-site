// Loads the wiki snapshot in ./wiki (synced from the MooshieUI GitHub wiki by
// scripts/sync-wiki.mjs) and turns it into pages, navigation and a search index.
// Runs at build time only; every wiki route is prerendered.
import { Marked } from 'marked';
import GithubSlugger from 'github-slugger';
import source from '../../../wiki/source.json';
import { PAGE_ICONS, GROUP_ICONS } from '$lib/wiki/icons.js';
import { withFigures } from './figures.js';

const files = import.meta.glob('/wiki/*.md', { query: '?raw', import: 'default', eager: true });

export const WIKI_SOURCE = {
	commit: source.commit,
	short: source.commit.slice(0, 7),
	date: source.date,
	url: 'https://github.com/Mooshieblob1/MooshieUI/wiki'
};

/** "Server,-LAN-and-Multi-User" or "Server, LAN and Multi-User" -> "server-lan-and-multi-user" */
export function toSlug(name) {
	return name
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

const escapeHtml = (s) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Markdown -> plain text, good enough for descriptions and search. */
function plain(md) {
	return md
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, (_, a, b) => (b.includes('#') ? a : b))
		.replace(/\[\[([^\]]+)\]\]/g, '$1')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
		.replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, '')
		.replace(/^\|?[\s:|-]+\|?$/gm, '')
		.replace(/\|/g, ' ')
		.replace(/\\(.)/g, '$1')
		.replace(/\s+/g, ' ')
		.trim();
}

// ---- Raw pages -------------------------------------------------------------

const raw = {};
for (const [path, text] of Object.entries(files)) {
	const file = path.split('/').pop().replace(/\.md$/, '');
	raw[file] = text.replace(/\r\n/g, '\n');
}

const pageFiles = Object.keys(raw).filter((f) => !f.startsWith('_'));
const bySlug = new Map(); // slug -> file name
for (const f of pageFiles) bySlug.set(f === 'Home' ? '' : toSlug(f), f);

/** Resolves a wiki page name ("Generation Basics") to its site path. */
function pagePath(name) {
	const slug = toSlug(name);
	if (slug === 'home') return '/wiki';
	return bySlug.has(slug) ? `/wiki/${slug}` : null;
}

// ---- Markdown rendering ----------------------------------------------------

/** `[[Page]]`, `[[Page#anchor|Text]]` and `[[Text|Page]]` -> regular markdown links. */
function expandWikiLinks(md) {
	return md.replace(/\[\[([^\]]+)\]\]/g, (whole, inner) => {
		const [a, b] = inner.split('|').map((s) => s.trim());
		let page = a;
		let text = b ?? a;
		if (b !== undefined && !pagePath(a.split('#')[0]) && pagePath(b.split('#')[0])) {
			page = b;
			text = a;
		}
		const [name, anchor] = page.split('#');
		const path = pagePath(name);
		if (!path) return text;
		return `[${text}](${path}${anchor ? `#${anchor}` : ''})`;
	});
}

const SHELL = new Set(['bash', 'sh', 'shell', 'powershell', 'ps1', 'yaml', 'yml', 'dockerfile', 'env', '']);

function render(md) {
	const slugger = new GithubSlugger();
	const headings = [];
	const marked = new Marked({ gfm: true });
	marked.use({
		renderer: {
			heading({ tokens, depth, text }) {
				const html = this.parser.parseInline(tokens);
				const label = plain(text);
				const id = slugger.slug(label);
				if (depth === 1) return '';
				if (depth <= 3) headings.push({ depth, text: label, id });
				return `<h${depth} id="${id}"><a class="wk-anchor" href="#${id}" aria-label="Link to this section">#</a>${html}</h${depth}>\n`;
			},
			code({ text, lang }) {
				const language = (lang || '').trim().split(/\s/)[0].toLowerCase();
				let body = escapeHtml(text);
				if (SHELL.has(language)) {
					body = body.replace(/^(\s*#.*)$/gm, '<span class="wk-c">$1</span>');
				}
				const label = language || 'text';
				return `<div class="wk-code"><div class="wk-code-bar"><span>${escapeHtml(label)}</span><button type="button" class="wk-copy" data-copy>Copy</button></div><pre><code>${body}</code></pre></div>\n`;
			},
			blockquote({ tokens }) {
				const body = this.parser.parse(tokens);
				const alert = body.match(/^<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i);
				const kind = alert ? alert[1].toLowerCase() : 'note';
				const clean = alert ? body.replace(alert[0], '<p>') : body;
				return `<aside class="wk-callout wk-${kind}">${clean}</aside>\n`;
			},
			link({ href, title, tokens }) {
				const text = this.parser.parseInline(tokens);
				let url = href;
				const wiki = url.match(/^https:\/\/github\.com\/Mooshieblob1\/MooshieUI\/wiki\/?([^#?]*)(#.*)?$/i);
				if (wiki) url = (pagePath(decodeURIComponent(wiki[1] || 'Home').replace(/-/g, ' ')) ?? url) + (wiki[2] ?? '');
				const external = /^https?:\/\//.test(url);
				const t = title ? ` title="${escapeHtml(title)}"` : '';
				return external
					? `<a href="${escapeHtml(url)}"${t} target="_blank" rel="noopener" class="wk-ext">${text}</a>`
					: `<a href="${escapeHtml(url)}"${t}>${text}</a>`;
			}
		}
	});
	// Wrap tables so wide ones scroll sideways on phones.
	const html = marked
		.parse(md)
		.replace(/<table>/g, '<div class="wk-table"><table>')
		.replace(/<\/table>/g, '</table></div>');
	return { html, headings };
}

// ---- Sidebar ---------------------------------------------------------------

function parseSidebar(md) {
	const groups = [];
	let current = null;
	for (const line of md.split('\n')) {
		const group = line.match(/^\*\*(.+?)\*\*\s*$/);
		if (group) {
			current = { title: group[1], icon: GROUP_ICONS[group[1]] ?? 'book', pages: [] };
			groups.push(current);
			continue;
		}
		const item = line.match(/^\s*[-*]\s+\[\[([^\]|#]+)/);
		if (item && current) {
			const path = pagePath(item[1]);
			if (path) current.pages.push(path === '/wiki' ? '' : path.slice('/wiki/'.length));
		}
	}
	return groups;
}

/** Short blurbs from Home.md's "- [[Page]] - what it covers" lines. */
function parseBlurbs(md) {
	const blurbs = {};
	for (const line of md.split('\n')) {
		const m = line.match(/^\s*[-*]\s+\[\[([^\]|#]+)\]\](?:\s+\([^)]*\))?\s+-\s+(.+)$/);
		if (m) {
			const text = m[2].replace(/\[\[([^\]|]+)\]\]/g, '$1').trim();
			blurbs[toSlug(m[1])] = text.charAt(0).toUpperCase() + text.slice(1);
		}
	}
	return blurbs;
}

// ---- Build everything once -------------------------------------------------

const sidebar = parseSidebar(raw._Sidebar ?? '');
const blurbs = parseBlurbs(raw.Home ?? '');

// Pages the sidebar forgets still get listed, under "More".
const listed = new Set(sidebar.flatMap((g) => g.pages));
const unlisted = [...bySlug.keys()].filter((s) => !listed.has(s));
if (unlisted.length) sidebar.push({ title: 'More', icon: 'book', pages: unlisted });

const order = sidebar.flatMap((g) => g.pages);

const pages = new Map();
for (const slug of order) {
	const file = bySlug.get(slug);
	const markdown = raw[file];
	const h1 = markdown.match(/^#\s+(.+)$/m);
	const title = slug === '' ? 'Overview' : h1 ? plain(h1[1]) : file.replace(/-/g, ' ');
	const { html, headings } = render(expandWikiLinks(markdown));
	const body = markdown.replace(/^#\s+.+$/m, '');
	const firstPara = body
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.find((p) => p && !/^(#|\||```|[-*]\s|\d+\.\s|<)/.test(p));
	const words = plain(markdown).split(' ').length;
	const group = sidebar.find((g) => g.pages.includes(slug));
	pages.set(slug, {
		slug,
		file,
		title,
		group: group?.title ?? '',
		icon: PAGE_ICONS[slug] ?? group?.icon ?? 'book',
		blurb: blurbs[slug] ?? '',
		description: firstPara ? truncate(plain(firstPara), 180) : '',
		minutes: Math.max(1, Math.round(words / 220)),
		words,
		headings,
		html: withFigures(slug, html, headings),
		markdown,
		editUrl: `${WIKI_SOURCE.url}/${file === 'Home' ? '' : encodeURIComponent(file)}`
	});
}

function truncate(s, n) {
	if (s.length <= n) return s;
	const cut = s.slice(0, n);
	return cut.slice(0, cut.lastIndexOf(' ')) + '…';
}

/** Lightweight page list for navigation (no bodies). */
export const nav = sidebar.map((g) => ({
	title: g.title,
	icon: g.icon,
	pages: g.pages.map((slug) => {
		const p = pages.get(slug);
		return { slug, title: p.title, icon: p.icon, blurb: p.blurb || truncate(p.description, 110), minutes: p.minutes };
	})
}));

export function getPage(slug) {
	return pages.get(slug) ?? null;
}

export function allSlugs() {
	return order;
}

export function neighbours(slug) {
	const i = order.indexOf(slug);
	const brief = (s) => (s === undefined ? null : { slug: s, title: pages.get(s).title });
	return { prev: brief(order[i - 1]), next: brief(order[i + 1]) };
}

export function stats() {
	let words = 0;
	for (const p of pages.values()) words += p.words;
	return { pages: pages.size, words, minutes: Math.round(words / 220) };
}

/** Site path for a page slug. */
export const hrefFor = (slug) => (slug === '' ? '/wiki' : `/wiki/${slug}`);

/** Raw markdown URL for a page slug. */
export const rawHrefFor = (slug) => (slug === '' ? '/wiki/home.md' : `/wiki/${slug}.md`);

/** Search index: one entry per page section (intro, then each h2/h3). */
export function searchIndex() {
	const entries = [];
	for (const p of pages.values()) {
		const slugger = new GithubSlugger();
		const sections = [{ heading: '', id: '', lines: [] }];
		let inCode = false;
		for (const line of p.markdown.split('\n')) {
			if (/^```/.test(line)) inCode = !inCode;
			const h = !inCode && line.match(/^(#{1,6})\s+(.+)$/);
			if (h && h[1].length === 1) continue;
			if (h) {
				const text = plain(h[2]);
				const id = slugger.slug(text);
				if (h[1].length <= 3) sections.push({ heading: text, id, lines: [] });
				else sections.at(-1).lines.push(text);
				continue;
			}
			sections.at(-1).lines.push(line);
		}
		for (const s of sections) {
			const text = plain(s.lines.join('\n'));
			if (!text && !s.heading) continue;
			entries.push({ s: p.slug, t: p.title, h: s.heading, a: s.id, x: text });
		}
	}
	return entries;
}

/** Everything in one markdown document, for LLMs. */
export function fullMarkdown(origin) {
	const parts = [
		`# MooshieUI Wiki (complete)\n\nAll ${pages.size} pages of the MooshieUI wiki in one file. Source: ${WIKI_SOURCE.url} (commit ${WIKI_SOURCE.short}, ${WIKI_SOURCE.date}).\nWeb version: ${origin}/wiki\n`
	];
	for (const p of pages.values()) {
		parts.push(`\n\n---\n\n<!-- Page: ${p.title} | ${origin}${hrefFor(p.slug)} -->\n\n${p.markdown.trim()}\n`);
	}
	return parts.join('');
}

/** llms.txt index (https://llmstxt.org). */
export function llmsIndex(origin) {
	const lines = [
		'# MooshieUI',
		'',
		'> MooshieUI is a beginner-friendly interface for image, video, music and 3D generation through ComfyUI, with optional NovelAI image generation. It runs as a desktop app (Windows, Linux, Apple Silicon macOS) or as a browser/server app (LAN, Docker, mobile).',
		'',
		`The whole wiki as one markdown file: ${origin}/llms-full.txt`,
		''
	];
	for (const g of nav) {
		lines.push(`## ${g.title}`, '');
		for (const p of g.pages) {
			const page = pages.get(p.slug);
			const note = page.blurb || page.description;
			lines.push(`- [${p.title}](${origin}${rawHrefFor(p.slug)})${note ? `: ${note}` : ''}`);
		}
		lines.push('');
	}
	lines.push('## Optional', '', `- [Source repository](https://github.com/Mooshieblob1/MooshieUI)`, `- [GitHub wiki](${WIKI_SOURCE.url})`, '');
	return lines.join('\n');
}
