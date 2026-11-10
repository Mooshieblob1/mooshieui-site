// Loads the wiki snapshot in ./wiki (synced from the MooshieUI GitHub wiki and
// repository docs by scripts/sync-wiki.mjs) and turns it into pages, navigation
// and a search index. Runs at build time only; every wiki route is prerendered.
import { posix } from 'node:path';
import { Marked } from 'marked';
import GithubSlugger from 'github-slugger';
import source from '../../../wiki/source.json';
import releases from '../../../wiki/releases.json';
import { PAGE_ICONS, GROUP_ICONS } from '$lib/wiki/icons.js';
import { REPO, REPO_DOC_GROUPS, REPO_DOCS } from '$lib/wiki/repo-docs.js';
import { ADDED_IN, releaseUrl } from '$lib/wiki/meta.js';
import { withFigures } from './figures.js';

const files = import.meta.glob('/wiki/*.md', { query: '?raw', import: 'default', eager: true });
const repoFiles = import.meta.glob('/wiki/repo/*.md', { query: '?raw', import: 'default', eager: true });

export const WIKI_SOURCE = {
	commit: source.commit,
	short: source.commit.slice(0, 7),
	date: source.date,
	url: `https://github.com/${REPO}/wiki`,
	docsCommit: source.docsCommit ?? '',
	docsShort: (source.docsCommit ?? '').slice(0, 7),
	docsDate: source.docsDate ?? ''
};

const RELEASES = new Set(releases);
const REPO_URL = `https://github.com/${REPO}`;
const RAW_URL = `https://raw.githubusercontent.com/${REPO}/main`;

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

/** For URLs, which marked may hand over with `&` already escaped. */
const escapeUrl = (s) => escapeHtml(s.replace(/&amp;/g, '&'));

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

// Repository docs: slug -> { doc, markdown }. Wiki page slugs win on a clash.
const repoRaw = new Map();
for (const [path, text] of Object.entries(repoFiles)) {
	const slug = path.split('/').pop().replace(/\.md$/, '');
	const doc = REPO_DOCS.find((d) => d.slug === slug);
	if (doc && !bySlug.has(slug)) repoRaw.set(slug, { doc, markdown: text.replace(/\r\n/g, '\n') });
}
const docByPath = new Map([...repoRaw.values()].map(({ doc }) => [doc.path, doc]));

/** Resolves a wiki page name ("Generation Basics") to its site path. */
function pagePath(name) {
	const slug = toSlug(name);
	if (slug === 'home') return '/wiki';
	return bySlug.has(slug) ? `/wiki/${slug}` : null;
}

const GH_FILE = new RegExp(`^${REPO_URL.replace(/[.]/g, '\\.')}/(?:blob|tree)/main/([^#?]+)(#.*)?$`, 'i');

/**
 * Resolves a link to a repository file: a GitHub blob URL anywhere, or a relative
 * path inside a repository doc (`base` is that doc's path). Docs shown on the site
 * become site links; other files point at GitHub. Returns null to keep `href`.
 */
function repoHref(href, base) {
	let path;
	let hash = '';
	const gh = href.match(GH_FILE);
	if (gh) {
		path = decodeURIComponent(gh[1]);
		hash = gh[2] ?? '';
	} else if (base && !/^((?:https?|mailto|data|tel|ftp):|#|\/)/i.test(href)) {
		const [p, h] = href.split('#');
		path = posix.normalize(posix.join(posix.dirname(base), decodeURIComponent(p)));
		hash = h ? `#${h}` : '';
	} else return null;
	const line = path.match(/:(\d+)$/);
	if (line) path = path.slice(0, -line[0].length);
	const doc = docByPath.get(path.replace(/\/$/, ''));
	if (doc) return `/wiki/${doc.slug}${hash}`;
	if (gh) return null;
	return `${REPO_URL}/blob/main/${path}${line ? `#L${line[1]}` : hash}`;
}

/** Relative image paths in a repository doc -> raw GitHub URLs. */
function repoImage(src, base) {
	if (!base || /^((?:https?|mailto|data|tel|ftp):|\/|#)/i.test(src)) return src;
	return `${RAW_URL}/${posix.normalize(posix.join(posix.dirname(base), src))}`;
}

/** Relative links and images in raw repository markdown -> absolute GitHub URLs, for LLMs. */
function absoluteRepoLinks(md, base) {
	const abs = (href) => {
		if (/^((?:https?|mailto|data|tel|ftp):|#|\/)/i.test(href)) return href;
		const [p, h] = href.split('#');
		let path = posix.normalize(posix.join(posix.dirname(base), p));
		const line = path.match(/:(\d+)$/);
		if (line) path = path.slice(0, -line[0].length);
		return `${REPO_URL}/blob/main/${path}${line ? `#L${line[1]}` : h ? `#${h}` : ''}`;
	};
	return md
		.replace(/(!?\[[^\]]*\]\()([^)\s]+)/g, (_, pre, href) =>
			pre.startsWith('!') ? pre + repoImage(href, base) : pre + abs(href)
		)
		.replace(/(<img\b[^>]*\ssrc=")([^"]+)"/g, (_, pre, src) => `${pre}${repoImage(src, base)}"`);
}

// ---- Version chips -----------------------------------------------------------

const SKIP_TAGS = new Set(['a', 'code', 'pre', 'textarea', 'script', 'style', 'svg', 'button']);
const VERSION = /(^|[^\w./-])(v\d+\.\d+(?:\.\d+)?)(\+)?(?![\w.]*\w)/g;

/**
 * Wraps version numbers in text (not code or links) in chips. MooshieUI release
 * tags link to their release notes; other versions (ComfyUI, model versions) get
 * a plain chip.
 */
function highlightVersions(html) {
	const parts = html.split(/(<[^>]+>)/);
	const stack = [];
	let before = '';
	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];
		if (part.startsWith('<')) {
			const m = part.match(/^<(\/)?([a-z0-9]+)/i);
			if (m && SKIP_TAGS.has(m[2].toLowerCase()) && !part.endsWith('/>')) {
				if (m[1]) stack.pop();
				else stack.push(m[2]);
			}
			continue;
		}
		if (!stack.length && part.includes('v')) {
			parts[i] = part.replace(VERSION, (whole, lead, v, plus = '', offset) => {
				const context = (before + part.slice(0, offset)).slice(-24);
				const mooshie = RELEASES.has(v) && !/comfyui\s*$/i.test(context);
				const label = `${v}${plus}`;
				return mooshie
					? `${lead}<a class="wk-ver" href="${releaseUrl(v)}" target="_blank" rel="noopener" title="MooshieUI ${v} release notes">${label}</a>`
					: `${lead}<span class="wk-ver is-other">${label}</span>`;
			});
		}
		before = part;
	}
	return parts.join('');
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

function render(md, base = null) {
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
			image({ href, title, text }) {
				const t = title ? ` title="${escapeHtml(title)}"` : '';
				return `<img src="${escapeUrl(repoImage(href, base))}" alt="${escapeHtml(text)}"${t} loading="lazy" decoding="async" />`;
			},
			link({ href, title, tokens }) {
				const text = this.parser.parseInline(tokens);
				let url = href;
				const wiki = url.match(/^https:\/\/github\.com\/Mooshieblob1\/MooshieUI\/wiki\/?([^#?]*)(#.*)?$/i);
				if (wiki) url = (pagePath(decodeURIComponent(wiki[1] || 'Home').replace(/-/g, ' ')) ?? url) + (wiki[2] ?? '');
				else url = repoHref(url, base) ?? url;
				const external = /^https?:\/\//.test(url);
				const t = title ? ` title="${escapeHtml(title)}"` : '';
				return external
					? `<a href="${escapeUrl(url)}"${t} target="_blank" rel="noopener" class="wk-ext">${text}</a>`
					: `<a href="${escapeUrl(url)}"${t}>${text}</a>`;
			}
		}
	});
	// Wrap tables so wide ones scroll sideways on phones.
	let html = marked
		.parse(md)
		.replace(/<table>/g, '<div class="wk-table"><table>')
		.replace(/<\/table>/g, '</table></div>');
	if (base) {
		// Raw HTML in repository docs (README logo, badges)
		html = html
			.replace(/(<img\b[^>]*\ssrc=")([^"]+)"/g, (_, pre, src) => `${pre}${escapeHtml(repoImage(src, base))}"`)
			.replace(/(<a\b[^>]*\shref=")([^"#][^"]*)"/g, (whole, pre, href) => {
				const url = repoHref(href, base);
				return url ? `${pre}${escapeHtml(url)}"` : whole;
			});
	}
	return { html: highlightVersions(html), headings };
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

// Repository docs follow the wiki's own groups.
for (const g of REPO_DOC_GROUPS) {
	const slugs = g.docs.map((d) => d.slug).filter((s) => repoRaw.has(s));
	if (slugs.length) sidebar.push({ title: g.title, icon: g.icon, repo: true, pages: slugs });
}

const order = sidebar.flatMap((g) => g.pages);

function firstParagraph(markdown) {
	return markdown
		.replace(/^#\s+.+$/m, '')
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.find((p) => p && !/^(#|\||```|[-*]\s|\d+\.\s|<|!\[|\[!\[|---)/.test(p));
}

const pages = new Map();
for (const slug of order) {
	const repoDoc = repoRaw.get(slug);
	const file = repoDoc ? repoDoc.doc.path : bySlug.get(slug);
	const markdown = repoDoc ? absoluteRepoLinks(repoDoc.markdown, file) : raw[file];
	const source = repoDoc ? repoDoc.markdown : markdown;
	const h1 = markdown.match(/^#\s+(.+)$/m);
	const title = repoDoc
		? repoDoc.doc.title
		: slug === ''
			? 'Overview'
			: h1
				? plain(h1[1])
				: file.replace(/-/g, ' ');
	const { html, headings } = repoDoc ? render(source, file) : render(expandWikiLinks(source));
	const firstPara = firstParagraph(source);
	const words = plain(markdown).split(' ').length;
	const group = sidebar.find((g) => g.pages.includes(slug));
	pages.set(slug, {
		slug,
		file,
		title,
		group: group?.title ?? '',
		repo: Boolean(repoDoc),
		icon: repoDoc?.doc.icon ?? PAGE_ICONS[slug] ?? group?.icon ?? 'book',
		blurb: blurbs[slug] ?? '',
		description: firstPara ? truncate(plain(firstPara), 180) : '',
		minutes: Math.max(1, Math.round(words / 220)),
		words,
		headings,
		addedIn: ADDED_IN[slug] ?? null,
		html: withFigures(slug, html, headings),
		markdown,
		editUrl: repoDoc
			? `${REPO_URL}/blob/main/${file}`
			: `${WIKI_SOURCE.url}/${file === 'Home' ? '' : encodeURIComponent(file)}`
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
	repo: Boolean(g.repo),
	pages: g.pages.map((slug) => {
		const p = pages.get(slug);
		return {
			slug,
			title: p.title,
			icon: p.icon,
			blurb: p.blurb || truncate(p.description, 110),
			minutes: p.minutes,
			addedIn: p.addedIn
		};
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
	let docs = 0;
	for (const p of pages.values()) {
		words += p.words;
		if (p.repo) docs++;
	}
	return { pages: pages.size - docs, docs, words, minutes: Math.round(words / 220) };
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
		`# MooshieUI Wiki (complete)\n\nEvery page of the MooshieUI wiki, then the key documents from the MooshieUI repository, in one file.\nWiki source: ${WIKI_SOURCE.url} (commit ${WIKI_SOURCE.short}, ${WIKI_SOURCE.date}).\nRepository docs: ${REPO_URL} (main at ${WIKI_SOURCE.docsShort}, ${WIKI_SOURCE.docsDate}).\nWeb version: ${origin}/wiki\n"Added in" gives the MooshieUI release a feature first shipped in.\n`
	];
	for (const p of pages.values()) {
		const meta = [`Page: ${p.title}`, `${origin}${hrefFor(p.slug)}`];
		if (p.repo) meta.push(`Repository file: ${p.file}`);
		if (p.addedIn) meta.push(`Added in ${p.addedIn}`);
		parts.push(`\n\n---\n\n<!-- ${meta.join(' | ')} -->\n\n${p.markdown.trim()}\n`);
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
		`The whole wiki and the repository docs as one markdown file: ${origin}/llms-full.txt. Every page below is plain markdown; the "added in" version is the MooshieUI release the feature first shipped in.`,
		''
	];
	for (const g of nav) {
		lines.push(`## ${g.title}`, '');
		for (const p of g.pages) {
			const page = pages.get(p.slug);
			let note = page.blurb || page.description;
			if (page.addedIn) note = `${note ? `${note} ` : ''}(added in ${page.addedIn})`;
			lines.push(`- [${p.title}](${origin}${rawHrefFor(p.slug)})${note ? `: ${note}` : ''}`);
		}
		lines.push('');
	}
	lines.push(
		'## Optional',
		'',
		`- [Changelog](${RAW_URL}/CHANGELOG.md): every release, newest first (large)`,
		`- [NovelAI architecture notes](${RAW_URL}/docs/NOVELAI.md): personal keys, face detailing and historical test notes (large)`,
		`- [Source repository](${REPO_URL})`,
		`- [GitHub wiki](${WIKI_SOURCE.url})`,
		''
	);
	return lines.join('\n');
}
