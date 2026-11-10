<script>
	import { base } from '$app/paths';
	import Icon from '$lib/icons/Icon.svelte';
	import WikiToc from '$lib/components/wiki/WikiToc.svelte';
	import RawMarkdown from '$lib/components/wiki/RawMarkdown.svelte';
	import { copyText } from '$lib/wiki/clipboard.js';
	import { releaseUrl } from '$lib/wiki/meta.js';

	let { data } = $props();
	const p = $derived(data.page);

	let view = $state('page');
	let copied = $state(false);

	// Each page starts on the rendered view.
	$effect(() => {
		p.slug;
		view = 'page';
	});

	async function copyPage() {
		if (await copyText(p.markdown)) {
			copied = true;
			setTimeout(() => (copied = false), 1800);
		}
	}

	// Copy buttons inside rendered code blocks.
	async function onProseClick(e) {
		const btn = e.target.closest?.('[data-copy]');
		if (!btn) return;
		const code = btn.closest('.wk-code')?.querySelector('code')?.textContent ?? '';
		if (await copyText(code)) {
			btn.textContent = 'Copied';
			btn.classList.add('done');
			setTimeout(() => {
				btn.textContent = 'Copy';
				btn.classList.remove('done');
			}, 1600);
		}
	}
</script>

<svelte:head>
	<title>{p.title} · MooshieUI Wiki</title>
	{#if p.description}<meta name="description" content={p.description} />{/if}
	<meta property="og:title" content="{p.title} · MooshieUI Wiki" />
	<link rel="alternate" type="text/markdown" href={data.rawHref} title="{p.title} (Markdown)" />
</svelte:head>

<div class="page">
	<article>
		<header class="head">
			<nav class="crumbs" aria-label="Breadcrumb">
				<a href="{base}/wiki">Wiki</a>
				<Icon name="chevron-right" size={13} />
				<span>{p.group}</span>
			</nav>
			<div class="title-row">
				<span class="tile" aria-hidden="true"><Icon name={p.icon} size={26} /></span>
				<h1>{p.title}</h1>
			</div>
			<div class="meta">
				{#if p.addedIn}
					<a class="added" href={releaseUrl(p.addedIn)} target="_blank" rel="noopener" title="Release notes for {p.addedIn}">
						<Icon name="tag" size={14} />Added in <b>{p.addedIn}</b>
					</a>
				{/if}
				{#if p.repo}<span class="from"><Icon name="file-code" size={14} />{p.file}</span>{/if}
				<span><Icon name="clock" size={14} />{p.minutes} min read</span>
				{#if p.headings.length}<span><Icon name="list" size={14} />{p.headings.filter((h) => h.depth === 2).length} sections</span>{/if}
			</div>
			<div class="actions">
				<div class="seg" role="tablist" aria-label="Page view">
					<button role="tab" type="button" aria-selected={view === 'page'} aria-controls="wiki-view" onclick={() => (view = 'page')}>
						<Icon name="eye" size={15} />Page
					</button>
					<button role="tab" type="button" aria-selected={view === 'md'} aria-controls="wiki-view" onclick={() => (view = 'md')}>
						<Icon name="file-code" size={15} />Markdown
					</button>
				</div>
				<button class="act" class:done={copied} type="button" onclick={copyPage}>
					{#if copied}<Icon name="check" size={15} stroke={2.5} />Copied{:else}<Icon name="copy" size={15} />Copy<span class="hide-sm">&nbsp;page</span>{/if}
				</button>
				<a class="act gh" href={p.editUrl} target="_blank" rel="noopener"><Icon name="github" size={15} />GitHub</a>
			</div>
			{#if view === 'page' && p.headings.length}
				<details class="mtoc">
					<summary><Icon name="list" size={15} />On this page<Icon name="chevron-down" size={15} class="chev" /></summary>
					<ul>
						{#each p.headings as h (h.id)}
							<li class:sub={h.depth === 3}><a href="#{h.id}" onclick={(e) => e.currentTarget.closest('details')?.removeAttribute('open')}>{h.text}</a></li>
						{/each}
					</ul>
				</details>
			{/if}
		</header>

		<div id="wiki-view">
			{#if view === 'md'}
				<RawMarkdown text={p.markdown} filename={p.repo ? p.file : `${p.file}.md`} href={data.rawHref} tall />
			{:else}
				<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
				<div class="wk-prose" onclick={onProseClick}>
					{@html p.html}
				</div>
			{/if}
		</div>

		<nav class="pager" aria-label="Previous and next page">
			{#if data.prev}
				<a class="prev" href="{base}/wiki{data.prev.slug ? `/${data.prev.slug}` : ''}">
					<small><Icon name="chevron-left" size={13} />Previous</small>
					<b>{data.prev.title}</b>
				</a>
			{:else}<span></span>{/if}
			{#if data.next}
				<a class="next" href="{base}/wiki/{data.next.slug}">
					<small>Next<Icon name="chevron-right" size={13} /></small>
					<b>{data.next.title}</b>
				</a>
			{/if}
		</nav>
	</article>

	<aside class="side">
		<WikiToc headings={view === 'page' ? p.headings : []} rawHref={data.rawHref} editUrl={p.editUrl} />
	</aside>
</div>

<style>
	.page {
		display: grid;
		grid-template-columns: minmax(0, 780px) 220px;
		justify-content: space-between;
		gap: 48px;
		padding: 32px 0 64px;
	}
	article {
		min-width: 0;
	}
	.head {
		position: relative;
		margin-bottom: 36px;
		padding-bottom: 24px;
		border-bottom: 1px solid var(--border-700);
	}
	.head::before {
		content: '';
		position: absolute;
		inset: -32px auto auto -40px;
		width: min(560px, calc(100% + 40px));
		height: 260px;
		background: radial-gradient(closest-side at 30% 40%, color-mix(in srgb, var(--accent-500) 9%, transparent), transparent);
		pointer-events: none;
		z-index: -1;
	}
	.crumbs {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: var(--text-xs);
		color: var(--text-subtle);
	}
	.crumbs a:hover {
		color: var(--accent-400);
	}
	.title-row {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-top: 18px;
	}
	.tile {
		flex-shrink: 0;
		display: grid;
		place-items: center;
		width: 56px;
		height: 56px;
		border-radius: 16px;
		color: var(--accent-foreground);
		background: linear-gradient(145deg, var(--accent-300), var(--accent-600));
		box-shadow:
			inset 0 1px 0 color-mix(in srgb, #fff 45%, transparent),
			0 10px 28px -10px color-mix(in srgb, var(--accent-500) 60%, transparent);
	}
	h1 {
		margin: 0;
		font-size: clamp(1.875rem, 3.6vw, 2.625rem);
		line-height: 1.12;
		font-weight: 680;
		letter-spacing: -0.03em;
		color: var(--text-strong);
		text-wrap: balance;
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 18px;
		margin-top: 16px;
		font-size: var(--text-xs);
		color: var(--text-subtle);
	}
	.meta {
		align-items: center;
	}
	.meta span {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.added {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px 4px 8px;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--accent-500) 45%, transparent);
		background: color-mix(in srgb, var(--accent-500) 14%, transparent);
		color: var(--accent-300, var(--text));
		font-weight: 600;
		text-decoration: none;
		transition: background var(--dur-fast);
	}
	.added b {
		font-family: var(--font-mono);
		font-weight: 700;
		color: var(--text);
	}
	.added:hover {
		background: color-mix(in srgb, var(--accent-500) 24%, transparent);
	}
	.meta .from {
		font-family: var(--font-mono);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 20px;
	}
	.seg {
		display: inline-flex;
		padding: 3px;
		border: 1px solid var(--border-700);
		border-radius: var(--radius-md);
		background: var(--surface-900);
	}
	.seg button {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		padding: 6px 12px;
		border: 0;
		border-radius: calc(var(--radius-md) - 3px);
		background: none;
		color: var(--text-muted);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
	}
	.seg button:hover {
		color: var(--text);
	}
	.seg button[aria-selected='true'] {
		background: var(--surface-800);
		color: var(--accent-400);
		box-shadow: var(--shadow-sm);
	}
	.act {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		padding: 7px 13px;
		border: 1px solid var(--border-700);
		border-radius: var(--radius-md);
		background: var(--surface-900);
		color: var(--text-muted);
		font-size: var(--text-sm);
		font-weight: 600;
		cursor: pointer;
		transition: color var(--dur-fast), border-color var(--dur-fast);
	}
	.act:hover {
		color: var(--text);
		border-color: var(--neutral-600);
	}
	.act.done {
		color: var(--success-text);
	}
	.pager {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		margin-top: 56px;
	}
	.pager a {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 16px 18px;
		border: 1px solid var(--border-700);
		border-radius: var(--radius-lg);
		background: var(--surface-900);
		transition: border-color var(--dur-fast), transform var(--dur-fast);
	}
	.pager a:hover {
		border-color: color-mix(in srgb, var(--accent-500) 50%, transparent);
		transform: translateY(-1px);
	}
	.pager small {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: var(--text-xs);
		color: var(--text-subtle);
	}
	.pager b {
		font-weight: 650;
		color: var(--text-strong);
	}
	.pager .next {
		text-align: right;
		align-items: flex-end;
	}
	.mtoc {
		display: none;
		margin-top: 16px;
		border: 1px solid var(--border-700);
		border-radius: var(--radius-md);
		background: var(--surface-900);
	}
	.mtoc summary {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 14px;
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-muted);
		cursor: pointer;
		list-style: none;
	}
	.mtoc summary::-webkit-details-marker {
		display: none;
	}
	.mtoc summary :global(.chev) {
		margin-left: auto;
		transition: transform var(--dur-fast);
	}
	.mtoc[open] summary :global(.chev) {
		transform: rotate(180deg);
	}
	.mtoc ul {
		list-style: none;
		margin: 0;
		padding: 4px 8px 10px;
		border-top: 1px solid var(--border-700);
		max-height: 50vh;
		overflow-y: auto;
	}
	.mtoc a {
		display: block;
		padding: 7px 8px;
		border-radius: var(--radius-sm);
		font-size: var(--text-sm);
		color: var(--text-muted);
	}
	.mtoc li.sub a {
		padding-left: 22px;
		font-size: var(--text-xs);
	}
	.mtoc a:hover {
		color: var(--accent-400);
		background: var(--surface-800);
	}
	@media (max-width: 1240px) {
		.mtoc {
			display: block;
		}
		.page {
			grid-template-columns: minmax(0, 1fr);
		}
		.side {
			display: none;
		}
	}
	@media (max-width: 600px) {
		.page {
			padding-top: 20px;
		}
		.tile {
			width: 46px;
			height: 46px;
			border-radius: 13px;
		}
		.hide-sm,
		.gh {
			display: none;
		}
		.pager {
			grid-template-columns: 1fr;
		}
	}
</style>
