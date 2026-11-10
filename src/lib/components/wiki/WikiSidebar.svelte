<script>
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import Icon from '$lib/icons/Icon.svelte';
	import { wikiUi } from '$lib/wiki/ui.svelte.js';

	let { nav, source } = $props();

	const current = $derived(page.url.pathname.replace(/\/$/, '').replace(`${base}/wiki`, '').replace(/^\//, ''));
	const href = (slug) => `${base}/wiki${slug ? `/${slug}` : ''}`;

	// Close the drawer after navigating on small screens.
	$effect(() => {
		page.url.pathname;
		wikiUi.menuOpen = false;
	});
</script>

{#if wikiUi.menuOpen}
	<button class="scrim" type="button" aria-label="Close wiki navigation" onclick={() => (wikiUi.menuOpen = false)}></button>
{/if}
<aside id="wiki-sidebar" class="sb" class:open={wikiUi.menuOpen} aria-label="Wiki pages">
	<nav>
		{#each nav as group, i}
			{#if group.repo && !nav[i - 1]?.repo}
				<div class="divider"><Icon name="github" size={13} />From the repository</div>
			{/if}
			<div class="group">
				<h2><Icon name={group.icon} size={14} />{group.title}</h2>
				<ul>
					{#each group.pages as p}
						<li>
							<a href={href(p.slug)} aria-current={current === p.slug ? 'page' : undefined}>
								<Icon name={p.icon} size={15} />
								<span>{p.title}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</nav>
	<div class="llm">
		<span class="llm-title"><Icon name="bot" size={14} />For LLMs</span>
		<a href="{base}/llms.txt">llms.txt</a>
		<a href="{base}/llms-full.txt">llms-full.txt</a>
	</div>
	<a class="src" href="{source.url}" target="_blank" rel="noopener">
		<Icon name="github" size={14} />Synced from GitHub · <code>{source.short}</code>
	</a>
</aside>

<style>
	.sb {
		position: sticky;
		top: var(--wiki-header, 64px);
		height: calc(100dvh - var(--wiki-header, 64px));
		overflow-y: auto;
		padding: 28px 12px 28px 0;
		scrollbar-width: thin;
		scrollbar-color: var(--border-700) transparent;
	}
	.group + .group {
		margin-top: 22px;
	}
	.divider {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 28px 0 16px 10px;
		padding-top: 18px;
		border-top: 1px solid var(--border-700);
		font-size: var(--text-xs);
		color: var(--text-subtle);
	}
	h2 {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 0 0 6px;
		padding-left: 10px;
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
	}
	li a {
		position: relative;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 7px 10px;
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		color: var(--text-muted);
		transition: color var(--dur-fast), background var(--dur-fast);
	}
	li a :global(svg) {
		flex-shrink: 0;
		opacity: 0.8;
	}
	li a:hover {
		color: var(--text);
		background: var(--surface-900);
	}
	li a[aria-current='page'] {
		color: var(--accent-400);
		background: color-mix(in srgb, var(--accent-500) 9%, var(--surface-900));
		font-weight: 600;
	}
	li a[aria-current='page']::before {
		content: '';
		position: absolute;
		left: -1px;
		top: 8px;
		bottom: 8px;
		width: 3px;
		border-radius: 3px;
		background: var(--accent-500);
	}
	li a[aria-current='page'] :global(svg) {
		opacity: 1;
	}
	.llm {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px 12px;
		margin: 28px 0 0;
		padding: 12px;
		border: 1px solid var(--border-700);
		border-radius: var(--radius-lg);
		background: var(--surface-900);
		font-size: var(--text-xs);
	}
	.llm-title {
		display: flex;
		align-items: center;
		gap: 6px;
		width: 100%;
		color: var(--text-muted);
		font-weight: 600;
	}
	.llm a {
		font-family: var(--font-mono);
		color: var(--accent-400);
	}
	.llm a:hover {
		text-decoration: underline;
	}
	.src {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: 12px;
		padding-left: 4px;
		font-size: var(--text-xs);
		color: var(--text-subtle);
	}
	.src:hover {
		color: var(--text-muted);
	}
	.src code {
		font-family: var(--font-mono);
	}
	.scrim {
		display: none;
	}
	@media (max-width: 960px) {
		.sb {
			position: fixed;
			z-index: 70;
			top: var(--wiki-header, 64px);
			left: 0;
			width: min(320px, 86vw);
			padding: 20px 16px 32px;
			background: var(--bg);
			border-right: 1px solid var(--border-700);
			transform: translateX(-102%);
			transition: transform var(--dur-slow) var(--ease-out), visibility 0s var(--dur-slow);
			visibility: hidden;
		}
		.sb.open {
			transform: none;
			visibility: visible;
			transition: transform var(--dur-slow) var(--ease-out), visibility 0s;
		}
		.scrim {
			display: block;
			position: fixed;
			inset: var(--wiki-header, 64px) 0 0 0;
			z-index: 65;
			background: color-mix(in srgb, #000 55%, transparent);
			border: 0;
		}
	}
</style>
