<script>
 import Icon from '$lib/icons/Icon.svelte';
 import { Button } from '$lib/components/ui/button';
 import { base } from '$app/paths';
 let { variant = 'landing' } = $props();
 let open = $state(false);
 let toggle = $state();
 const repo = 'https://github.com/Mooshieblob1/MooshieUI';
 function closeMenu() { open = false; }
 function onKeydown(event) { if (event.key === 'Escape' && open) { open = false; toggle?.focus(); } }
</script>
<svelte:window onkeydown={onKeydown} />
<a class="skip-link" href={variant === 'landing' ? '#top' : '#guide-content'}>Skip to content</a>
<header class="nav" class:guide={variant === 'guide'}>
 <div class="wrap nav-inner">
  <a class="brand" href="{base}/" aria-label="MooshieUI home"><img src="{base}/assets/logo.png" alt="" width="36" height="36" /><span class="word">Mooshie<b>UI</b></span></a>
  {#if variant === 'landing'}
   <nav class="desktop-links" aria-label="Main navigation"><a href="#features">Features</a><a href="#modes">How it runs</a><a href="#look">A closer look</a></nav>
   <div class="nav-right">
    <a class="github" href={repo} target="_blank" rel="noopener" aria-label="MooshieUI on GitHub"><Icon name="github" size={20} /><span>GitHub</span></a>
    <Button size="sm" href="#download">Download</Button>
    <button class="menu-toggle" bind:this={toggle} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'} onclick={() => open = !open}><Icon name={open ? 'close' : 'menu'} size={22} /></button>
   </div>
  {:else}
   <div class="nav-right"><a class="back text-link" href="{base}/"><Icon name="arrow-left" size={17} />Back to home</a><Button variant="secondary" size="sm" href={repo} target="_blank" rel="noopener"><Icon name="github" size={17} />Repo</Button></div>
  {/if}
 </div>
 {#if variant === 'landing'}
  <nav id="mobile-navigation" class="mobile-links" class:open aria-label="Mobile navigation" hidden={!open}>
   <a href="#features" onclick={closeMenu}>Features</a><a href="#modes" onclick={closeMenu}>How it runs</a><a href="#look" onclick={closeMenu}>A closer look</a><a href="#download" onclick={closeMenu}>Download</a><a href={repo} target="_blank" rel="noopener" onclick={closeMenu}>GitHub</a>
  </nav>
 {/if}
</header>
<style>
 .nav { position: sticky; top: 0; z-index: 50; background: color-mix(in srgb, var(--bg) 92%, transparent); backdrop-filter: blur(16px); border-bottom: 1px solid color-mix(in srgb, var(--border-700) 60%, transparent); }
 .nav-inner { display: flex; flex-wrap: wrap; padding-block: 14px; align-items: center; min-height: 88px; gap: 32px; }
 .brand { display: flex; align-items: center; gap: 11px; font-size: 1.25rem; font-weight: 600; letter-spacing: -.045em; }
 .brand img { flex-shrink: 0; }
 .desktop-links { display: flex; gap: 30px; margin-left: auto; }
 .desktop-links a, .github { font-size: .875rem; color: var(--text-muted); }
 .desktop-links a:hover, .github:hover { color: var(--text-strong); }
 .nav-right { display: flex; align-items: center; gap: 24px; margin-left: auto; }
 .github { display: inline-flex; align-items: center; gap: 8px; }
 .menu-toggle { display: none; color: var(--text); background: none; border: 1px solid var(--border-700); border-radius: 50%; width: 44px; height: 44px; align-items: center; justify-content: center; cursor: pointer; }
 .mobile-links { display: none; padding: 8px 24px 22px; border-top: 1px solid var(--border-700); }
 .mobile-links a { display: block; padding: 12px 0; font-size: 1rem; }
 @media (max-width: 1000px) { .desktop-links { gap: 20px; } .nav-inner { gap: 20px; } .github span { display: none; } }
 @media (max-width: 800px) { .nav-inner { min-height: 76px; } .desktop-links, .github { display: none; } .menu-toggle { display: flex; } .nav-right { gap: 10px; } .mobile-links.open { display: block; } .back { font-size: .875rem; } }
 @media (max-width: 430px) { .brand { font-size: 1.0625rem; gap: 7px; } .brand img { width: 29px; height: 29px; } .nav-inner { gap: 10px; } .nav-right :global(.btn-sm) { padding: 10px 13px; } .back { font-size: .8125rem; gap: 5px; } }
 @media (max-width: 560px) { .guide .brand .word { display: none; } }
 @media (max-width: 360px) { .brand .word { display: none; } }
</style>
