<script>
	import { base } from '$app/paths';
	import Icon from '$lib/icons/Icon.svelte';
	import { Button } from '$lib/components/ui/button';
	import { wikiUi } from '$lib/wiki/ui.svelte.js';

	const repo = 'https://github.com/Mooshieblob1/MooshieUI';
	let mac = $state(false);
	$effect(() => {
		mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
	});
</script>

<a class="skip-link" href="#wiki-content">Skip to content</a>
<header class="wh">
	<div class="wh-inner">
		<button
			class="icon-btn menu"
			type="button"
			aria-label={wikiUi.menuOpen ? 'Close wiki navigation' : 'Open wiki navigation'}
			aria-expanded={wikiUi.menuOpen}
			aria-controls="wiki-sidebar"
			onclick={() => (wikiUi.menuOpen = !wikiUi.menuOpen)}
		>
			<Icon name={wikiUi.menuOpen ? 'close' : 'menu'} size={20} />
		</button>
		<a class="brand" href="{base}/" aria-label="MooshieUI home">
			<img src="{base}/assets/logo.png" alt="" width="32" height="32" />
			<span class="word">Mooshie<b>UI</b></span>
		</a>
		<a class="section" href="{base}/wiki">Wiki</a>

		<button class="search" type="button" onclick={() => (wikiUi.searchOpen = true)}>
			<Icon name="search" size={16} />
			<span class="ph">Search the wiki</span>
			<span class="keys"><kbd>{mac ? '⌘' : 'Ctrl'}</kbd><kbd>K</kbd></span>
		</button>

		<nav class="links" aria-label="Site">
			<a href="{base}/">Home</a>
			<a href="{base}/docker">Docker</a>
			<a href="{base}/build">Build</a>
		</nav>
		<a class="icon-btn gh" href={repo} target="_blank" rel="noopener" aria-label="MooshieUI on GitHub"><Icon name="github" size={18} /></a>
		<span class="dl"><Button size="sm" href="{base}/#download">Download</Button></span>
	</div>
</header>

<style>
	.wh {
		position: sticky;
		top: 0;
		z-index: 60;
		background: color-mix(in srgb, var(--bg) 88%, transparent);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--border-700);
	}
	.wh-inner {
		display: flex;
		align-items: center;
		gap: 14px;
		height: var(--wiki-header, 64px);
		max-width: 1480px;
		margin-inline: auto;
		padding-inline: clamp(16px, 2.4vw, 32px);
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 9px;
		font-size: 1.125rem;
		font-weight: 700;
		letter-spacing: -0.025em;
	}
	.brand img {
		border-radius: var(--radius-md);
	}
	.section {
		padding: 4px 10px;
		border: 1px solid color-mix(in srgb, var(--accent-500) 35%, transparent);
		background: color-mix(in srgb, var(--accent-500) 10%, transparent);
		color: var(--accent-400);
		border-radius: 999px;
		font-size: var(--text-xs);
		font-weight: 650;
	}
	.search {
		display: flex;
		align-items: center;
		gap: 10px;
		width: min(420px, 34vw);
		margin-left: clamp(8px, 4vw, 64px);
		padding: 9px 10px 9px 14px;
		background: var(--surface-900);
		border: 1px solid var(--border-700);
		border-radius: var(--radius-lg);
		color: var(--text-subtle);
		cursor: pointer;
		transition: border-color var(--dur-fast), color var(--dur-fast);
	}
	.search:hover {
		border-color: var(--neutral-600);
		color: var(--text-muted);
	}
	.ph {
		font-size: var(--text-sm);
	}
	.keys {
		margin-left: auto;
		display: flex;
		gap: 3px;
	}
	kbd {
		padding: 1px 6px;
		border: 1px solid var(--border-700);
		border-bottom-width: 2px;
		border-radius: 5px;
		background: var(--surface-800);
		font-family: var(--font-sans);
		font-size: 11px;
		color: var(--text-muted);
	}
	.links {
		display: flex;
		gap: 2px;
		margin-left: auto;
	}
	.links a {
		padding: 8px 12px;
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
		color: var(--text-muted);
	}
	.links a:hover {
		color: var(--text);
		background: var(--surface-800);
	}
	.icon-btn {
		display: inline-grid;
		place-items: center;
		width: 40px;
		height: 40px;
		border-radius: var(--radius-md);
		color: var(--text-muted);
		background: none;
		border: 0;
		cursor: pointer;
	}
	.icon-btn:hover {
		color: var(--text);
		background: var(--surface-800);
	}
	.menu {
		display: none;
		border: 1px solid var(--border-700);
		background: var(--surface-900);
	}
	@media (max-width: 1080px) {
		.links {
			display: none;
		}
		.gh {
			margin-left: auto;
		}
	}
	@media (max-width: 960px) {
		.menu {
			display: inline-grid;
		}
	}
	@media (max-width: 720px) {
		.search {
			width: auto;
			margin-left: auto;
			padding: 10px;
		}
		.ph,
		.keys,
		.dl {
			display: none;
		}
		.gh {
			margin-left: 0;
		}
		.wh-inner {
			gap: 8px;
		}
	}
	@media (max-width: 380px) {
		.brand .word {
			display: none;
		}
	}
</style>
