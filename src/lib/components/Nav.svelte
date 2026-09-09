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
   <nav class="desktop-links" aria-label="Main navigation"><a href="#features"><Icon name="sliders" size={16} />Features</a><a href="#modes"><Icon name="browser" size={16} />How it runs</a><a href="#look"><Icon name="image" size={16} />A closer look</a></nav>
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
 .nav { position: sticky; top: 0; z-index: 50; padding-block: 10px; background: var(--bg); }
 .nav-inner { display: flex; flex-wrap: wrap; align-items: center; min-height: 64px; gap: 20px; }
 .brand { display: flex; align-items: center; gap: 10px; font-size: 1.25rem; font-weight: 700; letter-spacing: -.025em; }
 .brand img { flex-shrink: 0; border-radius: var(--radius-md); }
 .desktop-links { display: flex; gap: 4px; padding: 4px; border: 1px solid var(--border-700); background: var(--surface-900); border-radius: var(--app-panel-radius); margin-left: auto; }
 .desktop-links a { display: inline-flex; align-items: center; gap: 8px; padding: 9px 12px; border-radius: var(--radius-md); font-size: .875rem; font-weight: 500; color: var(--text-muted); transition: color var(--dur-fast), background var(--dur-fast); }
 .desktop-links a:hover, .desktop-links a:focus-visible { background: var(--surface-800); color: var(--accent-500); }
 .nav-right { display: flex; align-items: center; gap: 12px; margin-left: auto; }
 .github { display: inline-flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: .875rem; padding: 10px; border-radius: var(--radius-md); }
 .github:hover { color: var(--text); background: var(--surface-800); }
 .menu-toggle { display: none; color: var(--text); background: var(--surface-800); border: 1px solid var(--border-700); border-radius: var(--radius-md); width: 44px; height: 44px; align-items: center; justify-content: center; cursor: pointer; }
 .mobile-links { display: none; margin: 8px 20px 0; padding: 8px; border: 1px solid var(--border-700); background: var(--surface-900); border-radius: var(--app-panel-radius); }
 .mobile-links a { display: block; padding: 12px; border-radius: var(--radius-md); font-size: 1rem; }
 .mobile-links a:hover { color: var(--accent-500); background: var(--surface-800); }
 @media (max-width: 1100px) { .github span { display: none; } .desktop-links a { gap: 6px; padding-inline: 10px; } }
 @media (max-width: 900px) { .desktop-links, .github { display: none; } .menu-toggle { display: flex; } .nav-right { gap: 10px; } .mobile-links.open { display: block; } .back { font-size: .875rem; } }
 @media (max-width: 430px) { .brand { font-size: 1.0625rem; gap: 7px; } .brand img { width: 30px; height: 30px; } .nav-inner { gap: 10px; } .nav-right :global(.btn-sm) { padding: 10px 13px; } .back { font-size: .8125rem; gap: 5px; } }
 @media (max-width: 560px) { .guide .brand .word { display: none; } }
 @media (max-width: 360px) { .brand .word { display: none; } }
</style>
