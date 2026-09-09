<script>
 import Icon from '$lib/icons/Icon.svelte';
 import { Button } from '$lib/components/ui/button';
 import { base } from '$app/paths';
 import { reveal } from '$lib/actions/reveal';
</script>

<section class="hero" aria-labelledby="hero-heading">
 <div class="wrap">
  <div class="hero-shell">
   <div class="hero-heading" use:reveal>
    <h1 id="hero-heading">All the power of ComfyUI.<span>None of the node graph.</span></h1>
    <div class="hero-intro">
     <p>Make images. Not node graphs.</p>
     <div class="hero-actions">
      <Button href="#download"><Icon name="download" size={18} />Download</Button>
      <Button variant="secondary" href="#modes"><Icon name="browser" size={18} />Two ways to run</Button>
     </div>
    </div>
   </div>
   <div class="screenshot" use:reveal>
    <img src="{base}/assets/app-screenshot.avif" width="1874" height="1347" fetchpriority="high"
     alt="MooshieUI generation workspace with prompt controls, a generated illustration, model settings, and artist styles." />
   </div>
  </div>
 </div>
</section>

<style>
 .hero { padding-top: 24px; }
 .hero-shell {
  padding: clamp(16px, 2.5vw, 32px);
  border-radius: var(--app-shell-radius);
  border: 1px solid var(--border-700);
  background: var(--surface-900);
  box-shadow: 0 24px 48px -24px #0008;
 }
 .hero-heading { display: grid; grid-template-columns: 1.25fr 1fr; align-items: center; gap: 32px; padding: 12px 4px 32px; }
 h1 { font-size: clamp(2.125rem, 3.7vw, 3.375rem); line-height: 1.12; font-weight: 700; letter-spacing: -.035em; margin: 0; color: var(--text-strong); text-wrap: balance; }
 h1 span { display: block; font-size: .7em; color: var(--accent-500); letter-spacing: -.025em; line-height: 1.3; margin-top: 12px; }
 .hero-intro p { color: var(--text-muted); font-size: 1.125rem; margin: 0 0 20px; line-height: 1.6; }
 .hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
 .screenshot { border-radius: var(--app-panel-radius); overflow: hidden; border: 1px solid var(--border-700); background: var(--surface-950); }
 .screenshot img { display: block; width: 100%; height: auto; }
 @media (max-width: 1000px) { .hero-heading { grid-template-columns: 1fr; gap: 24px; } .hero-intro { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; } .hero-intro p { margin: 0; } }
 @media (max-width: 600px) { .hero { padding-top: 16px; } .hero-heading { padding: 6px 0 24px; } .hero-intro { display: block; } .hero-intro p { margin-bottom: 18px; } .hero-actions { gap: 10px; } .hero-actions :global(.btn) { padding-inline: 16px; } }
</style>
