<script>
	import Icon from '$lib/icons/Icon.svelte';

	let { headings = [], rawHref = '', editUrl = '' } = $props();
	let activeId = $state('');

	// Highlight the last heading scrolled past the sticky header.
	$effect(() => {
		const els = headings.map((h) => document.getElementById(h.id)).filter(Boolean);
		if (!els.length) return;
		let frame = 0;
		const update = () => {
			frame = 0;
			const line = 120;
			let id = els[0].id;
			for (const el of els) {
				if (el.getBoundingClientRect().top <= line) id = el.id;
				else break;
			}
			if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) id = els.at(-1).id;
			activeId = id;
		};
		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};
		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', onScroll);
			cancelAnimationFrame(frame);
		};
	});
</script>

<nav class="toc" aria-label="On this page">
	{#if headings.length}
		<h2><Icon name="list" size={14} />On this page</h2>
		<ul>
			{#each headings as h (h.id)}
				<li class:sub={h.depth === 3}>
					<a href="#{h.id}" class:active={activeId === h.id}>{h.text}</a>
				</li>
			{/each}
		</ul>
	{/if}
	<div class="tools">
		{#if rawHref}<a href={rawHref} target="_blank" rel="noopener"><Icon name="file-code" size={14} />View as Markdown</a>{/if}
		{#if editUrl}<a href={editUrl} target="_blank" rel="noopener"><Icon name="github" size={14} />View on GitHub</a>{/if}
		<a href="#top"><Icon name="arrow-down" size={14} class="up" />Back to top</a>
	</div>
</nav>

<style>
	.toc {
		position: sticky;
		top: calc(var(--wiki-header, 64px) + 28px);
		max-height: calc(100dvh - var(--wiki-header, 64px) - 56px);
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: var(--border-700) transparent;
		font-size: var(--text-sm);
	}
	h2 {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 0 0 10px;
		font-size: var(--text-xs);
		font-weight: 650;
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--text-subtle);
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		border-left: 1px solid var(--border-700);
	}
	li a {
		display: block;
		margin-left: -1px;
		padding: 5px 0 5px 14px;
		border-left: 2px solid transparent;
		color: var(--text-subtle);
		line-height: 1.4;
		transition: color var(--dur-fast), border-color var(--dur-fast);
	}
	li.sub a {
		padding-left: 26px;
		font-size: var(--text-xs);
	}
	li a:hover {
		color: var(--text);
	}
	li a.active {
		color: var(--accent-400);
		border-left-color: var(--accent-500);
	}
	.tools {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin-top: 20px;
		padding-top: 16px;
		border-top: 1px solid var(--border-700);
	}
	.tools a {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 5px 0;
		font-size: var(--text-xs);
		color: var(--text-muted);
	}
	.tools a:hover {
		color: var(--accent-400);
	}
	.tools :global(.up) {
		transform: rotate(180deg);
	}
</style>
