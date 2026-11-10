<script>
	import { base } from '$app/paths';
	import Icon from '$lib/icons/Icon.svelte';
	import RawMarkdown from '$lib/components/wiki/RawMarkdown.svelte';
	import { wikiUi } from '$lib/wiki/ui.svelte.js';
	import { copyText } from '$lib/wiki/clipboard.js';

	let { data } = $props();

	const START = ['installation', 'generation-basics', 'prompting-guide', 'prompt-assistant'];
	const all = $derived(data.nav.flatMap((g) => g.pages));
	const start = $derived(START.map((s) => all.find((p) => p.slug === s)).filter(Boolean));
	const groups = $derived(
		data.nav.map((g) => ({ ...g, pages: g.pages.filter((p) => p.slug !== '') })).filter((g) => g.pages.length)
	);
	const href = (slug) => `${base}/wiki/${slug}`;
	const updated = $derived(
		new Date(data.source.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
	);

	let copiedAll = $state(false);
	async function copyWiki() {
		const text = await fetch(`${base}/llms-full.txt`).then((r) => r.text());
		if (await copyText(text)) {
			copiedAll = true;
			setTimeout(() => (copiedAll = false), 1800);
		}
	}
</script>

<svelte:head>
	<title>Wiki · MooshieUI</title>
	<meta
		name="description"
		content="The MooshieUI wiki: installation, generation, prompting, NovelAI, video, music, 3D, models, gallery, self-hosting and MCP, with every page also available as Markdown for LLMs."
	/>
	<meta property="og:title" content="MooshieUI Wiki" />
	<link rel="alternate" type="text/plain" href="{base}/llms.txt" title="llms.txt" />
</svelte:head>

<section class="hero">
	<div class="hero-copy">
		<span class="eyebrow"><Icon name="book" size={16} />Documentation</span>
		<h1>MooshieUI <span class="accent-serif">Wiki</span></h1>
		<p class="lede">Every feature, from first install to NovelAI, video, music, 3D and self-hosting.</p>
		<button class="big-search" type="button" onclick={() => (wikiUi.searchOpen = true)}>
			<Icon name="search" size={20} />
			<span>Search {data.stats.pages} pages</span>
			<kbd>/</kbd>
		</button>
		<div class="chips">
			<span class="chip"><Icon name="file" size={14} />{data.stats.pages} pages</span>
			<span class="chip"><Icon name="clock" size={14} />{data.stats.minutes} min of reading</span>
			<a class="chip" href={data.source.url} target="_blank" rel="noopener"><Icon name="github" size={14} />Updated {updated}</a>
		</div>
	</div>
	<div class="hero-art" aria-hidden="true">
		<div class="glow"></div>
		<img src="{base}/assets/mooshieui-amber-sculpture.webp" alt="" width="420" height="420" />
	</div>
</section>

<section class="block">
	<h2 class="bh"><Icon name="rocket" size={18} />Start here</h2>
	<div class="start">
		{#each start as p, i}
			<a class="start-card" href={href(p.slug)}>
				<span class="step">{i + 1}</span>
				<span class="tile"><Icon name={p.icon} size={22} /></span>
				<b>{p.title}</b>
				<small>{p.blurb}</small>
				<span class="go">{p.minutes} min<Icon name="arrow-right" size={14} /></span>
			</a>
		{/each}
	</div>
</section>

<section class="block">
	<h2 class="bh"><Icon name="layers" size={18} />How it fits together</h2>
	<div class="wk-prose">{@html data.overview}</div>
</section>

{#each groups as g}
	<section class="block">
		<h2 class="bh"><Icon name={g.icon} size={18} />{g.title}</h2>
		<div class="cards">
			{#each g.pages as p}
				<a class="card" href={href(p.slug)}>
					<span class="ci"><Icon name={p.icon} size={18} /></span>
					<span class="ct">
						<b>{p.title}</b>
						{#if p.blurb}<small>{p.blurb}</small>{/if}
					</span>
					<Icon name="chevron-right" size={16} class="chev" />
				</a>
			{/each}
		</div>
	</section>
{/each}

<section class="block llm" id="for-llms">
	<div class="llm-head">
		<div>
			<h2 class="bh"><Icon name="bot" size={18} />For LLMs</h2>
			<p>The whole wiki as one Markdown file. Paste it into any assistant.</p>
		</div>
		<div class="llm-actions">
			<button class="btn btn-primary btn-sm" type="button" onclick={copyWiki}>
				{#if copiedAll}<Icon name="check" size={16} stroke={2.5} />Copied{:else}<Icon name="copy" size={16} />Copy entire wiki{/if}
			</button>
			<a class="btn btn-secondary btn-sm" href="{base}/llms.txt" target="_blank" rel="noopener">llms.txt</a>
			<a class="btn btn-secondary btn-sm" href="{base}/llms-full.txt" target="_blank" rel="noopener">llms-full.txt</a>
		</div>
	</div>
	<RawMarkdown src="{base}/llms-full.txt" filename="mooshieui-wiki.md" href="{base}/llms-full.txt" />
</section>

{#if data.notes}
	<section class="block notes wk-prose">{@html data.notes}</section>
{/if}

<style>
	.hero {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
		align-items: center;
		gap: 32px;
		margin-top: 28px;
		padding: clamp(28px, 4vw, 56px);
		border: 1px solid var(--border-700);
		border-radius: var(--radius-2xl, 24px);
		background:
			radial-gradient(70% 120% at 85% 50%, color-mix(in srgb, var(--accent-500) 12%, transparent), transparent 60%),
			var(--surface-900);
		overflow: hidden;
	}
	.hero::after {
		content: '';
		position: absolute;
		inset: 0;
		background-image: radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--neutral-500) 18%, transparent) 1px, transparent 0);
		background-size: 22px 22px;
		mask-image: linear-gradient(90deg, transparent 30%, #000);
		pointer-events: none;
	}
	.hero-copy {
		position: relative;
		z-index: 1;
	}
	h1 {
		margin: 14px 0 0;
		font-size: clamp(2.5rem, 5.4vw, 4rem);
		line-height: 1.02;
		letter-spacing: -0.04em;
		font-weight: 700;
		color: var(--text-strong);
	}
	.lede {
		max-width: 34rem;
		margin: 18px 0 0;
		font-size: 1.125rem;
		line-height: 1.6;
		color: var(--text-muted);
	}
	.big-search {
		display: flex;
		align-items: center;
		gap: 12px;
		width: min(460px, 100%);
		margin-top: 28px;
		padding: 15px 16px 15px 18px;
		border: 1px solid var(--border-700);
		border-radius: var(--radius-lg);
		background: var(--surface-950);
		color: var(--text-subtle);
		font-size: 1rem;
		cursor: pointer;
		box-shadow: var(--shadow-md);
		transition: border-color var(--dur-fast), box-shadow var(--dur-fast);
	}
	.big-search:hover {
		border-color: color-mix(in srgb, var(--accent-500) 50%, transparent);
		box-shadow: var(--shadow-md), 0 0 0 4px color-mix(in srgb, var(--accent-500) 8%, transparent);
	}
	.big-search kbd {
		margin-left: auto;
		padding: 1px 8px;
		border: 1px solid var(--border-700);
		border-bottom-width: 2px;
		border-radius: 5px;
		background: var(--surface-800);
		font-family: var(--font-sans);
		font-size: 12px;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 18px;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 5px 10px;
		border: 1px solid var(--border-700);
		border-radius: 999px;
		background: var(--surface-950);
		font-size: var(--text-xs);
		color: var(--text-muted);
	}
	a.chip:hover {
		color: var(--text);
	}
	.hero-art {
		position: relative;
		display: grid;
		place-items: center;
		z-index: 1;
	}
	.hero-art img {
		position: relative;
		width: min(100%, 380px);
		height: auto;
		border-radius: 28px;
		mask-image: radial-gradient(closest-side, #000 72%, transparent);
		animation: float 7s ease-in-out infinite;
	}
	.glow {
		position: absolute;
		width: 70%;
		aspect-ratio: 1;
		border-radius: 50%;
		background: radial-gradient(circle, color-mix(in srgb, var(--accent-500) 35%, transparent), transparent 65%);
		filter: blur(30px);
	}
	@keyframes float {
		50% {
			transform: translateY(-10px) rotate(-1.5deg);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.hero-art img {
			animation: none;
		}
	}

	.block {
		margin-top: 56px;
	}
	.bh {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 0 0 18px;
		font-size: 1.25rem;
		font-weight: 650;
		letter-spacing: -0.02em;
		color: var(--text-strong);
	}
	.bh :global(svg) {
		color: var(--accent-500);
	}

	.start {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 14px;
	}
	.start-card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 20px;
		border: 1px solid var(--border-700);
		border-radius: var(--radius-xl);
		background: linear-gradient(180deg, var(--surface-900), var(--surface-950));
		overflow: hidden;
		transition: border-color var(--dur-base), transform var(--dur-base) var(--ease-out);
	}
	.start-card:hover {
		border-color: color-mix(in srgb, var(--accent-500) 55%, transparent);
		transform: translateY(-3px);
	}
	.step {
		position: absolute;
		right: 14px;
		top: 4px;
		font-size: 4.5rem;
		font-weight: 800;
		line-height: 1;
		letter-spacing: -0.05em;
		color: color-mix(in srgb, var(--neutral-500) 14%, transparent);
	}
	.start-card .tile {
		display: grid;
		place-items: center;
		width: 46px;
		height: 46px;
		margin-bottom: 8px;
		border-radius: 13px;
		color: var(--accent-foreground);
		background: linear-gradient(145deg, var(--accent-300), var(--accent-600));
		box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 45%, transparent), 0 10px 24px -12px color-mix(in srgb, var(--accent-500) 70%, transparent);
	}
	.start-card b {
		font-size: 1.0625rem;
		color: var(--text-strong);
	}
	.start-card small {
		flex: 1;
		font-size: var(--text-sm);
		line-height: 1.5;
		color: var(--text-muted);
	}
	.go {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		margin-top: 6px;
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--text-subtle);
	}
	.start-card:hover .go {
		color: var(--accent-400);
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 10px;
	}
	.card {
		display: flex;
		align-items: flex-start;
		gap: 14px;
		padding: 16px;
		border: 1px solid var(--border-700);
		border-radius: var(--radius-lg);
		background: var(--surface-900);
		transition: border-color var(--dur-fast), background var(--dur-fast);
	}
	.card:hover {
		border-color: color-mix(in srgb, var(--accent-500) 45%, transparent);
		background: color-mix(in srgb, var(--accent-500) 4%, var(--surface-900));
	}
	.ci {
		flex-shrink: 0;
		display: grid;
		place-items: center;
		width: 38px;
		height: 38px;
		border-radius: 10px;
		border: 1px solid var(--border-700);
		background: var(--surface-800);
		color: var(--text-muted);
		transition: color var(--dur-fast), border-color var(--dur-fast);
	}
	.card:hover .ci {
		color: var(--accent-500);
		border-color: color-mix(in srgb, var(--accent-500) 40%, transparent);
	}
	.ct {
		display: flex;
		flex-direction: column;
		gap: 3px;
		min-width: 0;
		flex: 1;
	}
	.ct b {
		font-size: 0.9375rem;
		font-weight: 650;
		color: var(--text-strong);
	}
	.ct small {
		font-size: var(--text-xs);
		line-height: 1.5;
		color: var(--text-muted);
	}
	.card :global(.chev) {
		flex-shrink: 0;
		margin-top: 10px;
		color: var(--text-subtle);
		transition: transform var(--dur-fast), color var(--dur-fast);
	}
	.card:hover :global(.chev) {
		color: var(--accent-400);
		transform: translateX(2px);
	}

	.llm {
		padding: clamp(20px, 3vw, 32px);
		border: 1px solid var(--border-700);
		border-radius: var(--radius-xl);
		background: var(--surface-900);
	}
	.llm-head {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 18px;
	}
	.llm-head .bh {
		margin-bottom: 6px;
	}
	.llm-head p {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--text-muted);
	}
	.llm-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.llm-actions a {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
	}
	.notes {
		margin-bottom: 64px;
		font-size: var(--text-sm);
		color: var(--text-muted);
	}

	@media (max-width: 1200px) {
		.start {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 820px) {
		.hero {
			grid-template-columns: 1fr;
		}
		.hero-art {
			display: none;
		}
	}
	@media (max-width: 520px) {
		.start {
			grid-template-columns: 1fr;
		}
		.cards {
			grid-template-columns: 1fr;
		}
	}
</style>
