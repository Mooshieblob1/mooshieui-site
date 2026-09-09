<script>
	import Icon from '$lib/icons/Icon.svelte';
	import { base } from '$app/paths';

	let { variant = 'landing' } = $props();
	let menuOpen = $state(false);
	const repo = 'https://github.com/Mooshieblob1/MooshieUI';
	const links = [
		{ href: '#features', label: 'Features' },
		{ href: '#modes', label: 'How it runs' },
		{ href: '#look', label: 'A closer look' },
		{ href: '#download', label: 'Get started' }
	];
</script>

<svelte:window onkeydown={(event) => { if (event.key === 'Escape') menuOpen = false; }} />
<a class="skip-link" href={variant === 'landing' ? '#top' : '#guide-content'}>Skip to content</a>
<header class="nav">
	<div class="wrap nav-inner">
		<a class="brand" href="{base}/" aria-label="MooshieUI home">
			<img src="{base}/assets/logo.png" alt="" width="36" height="36" />
			<span class="word">Mooshie<b>UI</b></span>
		</a>
		{#if variant === 'landing'}
			<nav class="nav-links" aria-label="Main navigation">
				{#each links.slice(0, 3) as link}<a href={link.href}>{link.label}</a>{/each}
			</nav>
			<div class="nav-right">
				<a class="github-link" href={repo} target="_blank" rel="noopener"><Icon name="github" size={19} /><span>GitHub</span></a>
				<a class="btn btn-primary btn-sm" href="#download">Get started<Icon name="arrow-right" size={15} /></a>
				<button class="menu-toggle" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onclick={() => menuOpen = !menuOpen}><Icon name={menuOpen ? 'close' : 'menu'} size={22} /></button>
			</div>
		{:else}
			<div class="nav-right">
				<a class="back" href="{base}/"><Icon name="arrow-left" size={16} /><span>Back to home</span></a>
				<a class="github-link" href={repo} target="_blank" rel="noopener"><Icon name="github" size={19} /><span>Repo</span></a>
			</div>
		{/if}
	</div>
	{#if variant === 'landing' && menuOpen}
		<nav class="mobile-navigation" id="mobile-navigation" aria-label="Mobile navigation">
			{#each links as link}<a href={link.href} onclick={() => menuOpen = false}>{link.label}<Icon name="arrow-right" size={16} /></a>{/each}
		</nav>
	{/if}
</header>

<style>
	.nav { position: sticky; top: 0; z-index: 50; background: #131512ed; backdrop-filter: blur(18px); border-bottom: 1px solid var(--border-700); box-shadow: 0 1px 0 color-mix(in srgb, var(--accent-500) 7%, transparent); }
	.nav-inner { display: flex; align-items: center; gap: 40px; min-height: 80px; }
	.brand { display: inline-flex; align-items: center; gap: 11px; flex-shrink: 0; font-weight: 600; font-size: 1.375rem; letter-spacing: -.045em; }
	.brand img { width: 36px; height: 36px; }
	.nav-links { display: flex; align-items: center; gap: 30px; margin-left: auto; }
	.nav-links a { position: relative; padding: 12px 0; font-family: var(--font-mono); font-size: .875rem; letter-spacing: -.025em; color: var(--text-muted); }
	.nav-links a:hover, .github-link:hover, .back:hover { color: var(--accent-500); }
  .nav-links a::after {
    content: '';
    position: absolute;
    bottom: 4px;
    left: 0;
    width: 100%;
    height: 1px;
    background: var(--accent-500);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform .2s;
  }
  .nav-links a:hover::after, .nav-links a:focus-visible::after { transform: scaleX(1); }
  .nav-right { margin-left: auto; display: flex; align-items: center; gap: 24px; }
	.github-link, .back { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; font-size: .875rem; color: var(--text-muted); }
	.menu-toggle { display: none; align-items: center; justify-content: center; width: 44px; height: 44px; background: transparent; border: 1px solid var(--border-700); border-radius: 8px; color: var(--text); cursor: pointer; }
	.mobile-navigation { padding: 8px 24px 18px; border-top: 1px solid var(--border-700); }
	.mobile-navigation a { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; color: var(--text-muted); }
	@media (min-width: 901px) { .mobile-navigation { display: none; } }
	@media (max-width: 900px) { .nav-links { display: none; } .menu-toggle { display: inline-flex; } .nav-inner { gap: 16px; min-height: 72px; } .nav-right { gap: 16px; } }
	@media (max-width: 540px) { .nav-inner { gap: 10px; flex-wrap: wrap; padding-block: 12px; } .nav-right { gap: 10px; } .nav-right > .github-link { display: none; } .brand { font-size: 1.125rem; gap: 8px; } .brand img { width: 30px; height: 30px; } .nav-right > .btn { padding-inline: 12px; } }
</style>
