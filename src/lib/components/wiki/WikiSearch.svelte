<script>
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import Icon from '$lib/icons/Icon.svelte';
	import { wikiUi } from '$lib/wiki/ui.svelte.js';
	import { PAGE_ICONS } from '$lib/wiki/icons.js';

	let index = $state(null);
	let query = $state('');
	let active = $state(0);
	let input = $state();
	let list = $state();
	let loading = null;

	function load() {
		if (index || loading) return loading;
		loading = fetch(`${base}/wiki/search.json`)
			.then((r) => r.json())
			.then((data) => {
				index = data.map((e) => ({ ...e, lt: e.t.toLowerCase(), lh: e.h.toLowerCase(), lx: e.x.toLowerCase() }));
			})
			.catch(() => (loading = null));
		return loading;
	}

	const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	const reEscape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

	function highlight(text, terms) {
		if (!terms.length) return escape(text);
		const re = new RegExp(`(${terms.map(reEscape).join('|')})`, 'gi');
		return escape(text).replace(re, '<mark>$1</mark>');
	}

	function snippet(text, terms) {
		const lower = text.toLowerCase();
		let at = -1;
		for (const t of terms) {
			const i = lower.indexOf(t);
			if (i !== -1 && (at === -1 || i < at)) at = i;
		}
		if (at === -1) return text.slice(0, 140) + (text.length > 140 ? '…' : '');
		const start = Math.max(0, at - 50);
		const end = Math.min(text.length, at + 110);
		return (start > 0 ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '');
	}

	const results = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!index || q.length < 2) return [];
		const terms = q.split(/\s+/).filter(Boolean);
		const scored = [];
		for (const e of index) {
			let score = 0;
			let all = true;
			for (const t of terms) {
				const inT = e.lt.includes(t);
				const inH = e.lh.includes(t);
				const n = e.lx.split(t).length - 1;
				if (!inT && !inH && !n) {
					all = false;
					break;
				}
				score += (inT ? 6 : 0) + (inH ? 10 : 0) + Math.min(n, 5);
			}
			if (!all) continue;
			if (e.lh.includes(q)) score += 15;
			if (e.lt.includes(q)) score += 8;
			if (e.lx.includes(q)) score += 4;
			if (!e.h) score += 2;
			scored.push({ e, score });
		}
		scored.sort((a, b) => b.score - a.score);
		return scored.slice(0, 30).map(({ e }) => ({
			href: `${base}/wiki${e.s ? `/${e.s}` : ''}${e.a ? `#${e.a}` : ''}`,
			page: e.t,
			icon: PAGE_ICONS[e.s] ?? 'book',
			heading: e.h ? highlight(e.h, terms) : '',
			title: highlight(e.t, terms),
			text: highlight(snippet(e.x, terms), terms)
		}));
	});

	$effect(() => {
		query;
		active = 0;
	});

	$effect(() => {
		if (wikiUi.searchOpen) {
			load();
			queueMicrotask(() => input?.focus());
		}
	});

	function close() {
		wikiUi.searchOpen = false;
	}

	function open(href) {
		close();
		query = '';
		goto(href);
	}

	function onKeydown(e) {
		if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			wikiUi.searchOpen = !wikiUi.searchOpen;
			return;
		}
		const tag = /** @type {HTMLElement} */ (e.target)?.tagName;
		if (e.key === '/' && !wikiUi.searchOpen && tag !== 'INPUT' && tag !== 'TEXTAREA') {
			e.preventDefault();
			wikiUi.searchOpen = true;
			return;
		}
		if (!wikiUi.searchOpen) return;
		if (e.key === 'Escape') close();
		else if (e.key === 'ArrowDown' && results.length) {
			e.preventDefault();
			active = (active + 1) % results.length;
			scrollActive();
		} else if (e.key === 'ArrowUp' && results.length) {
			e.preventDefault();
			active = (active - 1 + results.length) % results.length;
			scrollActive();
		} else if (e.key === 'Enter' && results[active]) {
			e.preventDefault();
			open(results[active].href);
		}
	}

	function scrollActive() {
		queueMicrotask(() => list?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }));
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#if wikiUi.searchOpen}
	<div class="backdrop" role="presentation" onclick={close}>
		<div
			class="dialog"
			role="dialog"
			aria-modal="true"
			aria-label="Search the wiki"
			tabindex="-1"
			onclick={(e) => e.stopPropagation()}
			onkeydown={() => {}}
		>
			<div class="field">
				<Icon name="search" size={18} />
				<input
					bind:this={input}
					bind:value={query}
					type="search"
					placeholder="Search the wiki"
					aria-label="Search the wiki"
					aria-controls="wiki-search-results"
					autocomplete="off"
					spellcheck="false"
				/>
				<kbd>Esc</kbd>
			</div>
			<ul id="wiki-search-results" class="results" role="listbox" bind:this={list}>
				{#if !index}
					<li class="empty">Loading…</li>
				{:else if query.trim().length < 2}
					<li class="empty">Type to search {index.length} sections</li>
				{:else if !results.length}
					<li class="empty">No results for “{query}”</li>
				{:else}
					{#each results as r, i (r.href)}
						<li role="option" aria-selected={i === active}>
							<a href={r.href} onclick={(e) => { e.preventDefault(); open(r.href); }} onmousemove={() => (active = i)}>
								<span class="ri"><Icon name={r.icon} size={16} /></span>
								<span class="rt">
									<span class="rh">
										{#if r.heading}<span class="rp">{@html r.title}</span><Icon name="chevron-right" size={12} />{@html r.heading}{:else}{@html r.title}{/if}
									</span>
									<span class="rx">{@html r.text}</span>
								</span>
							</a>
						</li>
					{/each}
				{/if}
			</ul>
			<div class="foot">
				<span><kbd>↑</kbd><kbd>↓</kbd> to move</span>
				<span><kbd>Enter</kbd> to open</span>
				<span class="right"><kbd>Ctrl</kbd><kbd>K</kbd> anywhere</span>
			</div>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 90;
		background: color-mix(in srgb, #000 62%, transparent);
		backdrop-filter: blur(6px);
		display: flex;
		justify-content: center;
		align-items: flex-start;
		padding: 10vh 16px 16px;
		animation: fade var(--dur-base) var(--ease-out);
	}
	.dialog {
		width: min(680px, 100%);
		max-height: 76vh;
		display: flex;
		flex-direction: column;
		background: var(--surface-900);
		border: 1px solid var(--border-700);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-panel);
		overflow: hidden;
		animation: rise var(--dur-slow) var(--ease-spring);
	}
	.field {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 18px;
		border-bottom: 1px solid var(--border-700);
		color: var(--text-muted);
	}
	.field input {
		flex: 1;
		min-width: 0;
		background: none;
		border: 0;
		outline: 0;
		color: var(--text-strong);
		font: inherit;
		font-size: 1.0625rem;
	}
	.field input::-webkit-search-cancel-button {
		display: none;
	}
	.results {
		list-style: none;
		margin: 0;
		padding: 8px;
		overflow-y: auto;
		flex: 1;
	}
	.empty {
		padding: 28px 12px;
		text-align: center;
		color: var(--text-subtle);
		font-size: var(--text-sm);
	}
	.results a {
		display: flex;
		gap: 12px;
		padding: 10px 12px;
		border-radius: var(--radius-md);
		color: var(--text);
	}
	[aria-selected='true'] a {
		background: var(--surface-800);
	}
	[aria-selected='true'] .ri {
		color: var(--accent-500);
		border-color: color-mix(in srgb, var(--accent-500) 45%, transparent);
	}
	.ri {
		flex-shrink: 0;
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border-radius: var(--radius-md);
		border: 1px solid var(--border-700);
		background: var(--surface-950);
		color: var(--text-muted);
	}
	.rt {
		display: flex;
		flex-direction: column;
		gap: 3px;
		min-width: 0;
	}
	.rh {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-wrap: wrap;
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-strong);
	}
	.rp {
		color: var(--text-muted);
		font-weight: 500;
	}
	.rx {
		font-size: var(--text-xs);
		line-height: 1.5;
		color: var(--text-muted);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.results :global(mark) {
		background: color-mix(in srgb, var(--accent-500) 22%, transparent);
		color: var(--accent-300);
		border-radius: 3px;
		padding: 0 1px;
	}
	.foot {
		display: flex;
		gap: 16px;
		padding: 10px 18px;
		border-top: 1px solid var(--border-700);
		font-size: var(--text-xs);
		color: var(--text-subtle);
	}
	.foot .right {
		margin-left: auto;
	}
	kbd {
		display: inline-block;
		min-width: 20px;
		padding: 1px 6px;
		margin-right: 3px;
		border: 1px solid var(--border-700);
		border-bottom-width: 2px;
		border-radius: 5px;
		background: var(--surface-800);
		font-family: var(--font-sans);
		font-size: 11px;
		color: var(--text-muted);
		text-align: center;
	}
	@media (max-width: 600px) {
		.backdrop {
			padding: 12px;
		}
		.dialog {
			max-height: calc(100dvh - 24px);
		}
		.foot {
			display: none;
		}
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(10px) scale(0.98);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.backdrop,
		.dialog {
			animation: none;
		}
	}
</style>
