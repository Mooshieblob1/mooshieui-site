<script>
 import Icon from '$lib/icons/Icon.svelte';
 import { Button } from '$lib/components/ui/button';
 import { base } from '$app/paths';
 import { reveal } from '$lib/actions/reveal';
</script>

<section class="hero" aria-labelledby="hero-heading">
 <div class="wrap hero-layout">
  <div class="hero-copy" use:reveal>
   <h1 id="hero-heading">All the power<br />of ComfyUI.<span>None of the node graph.</span></h1>
   <p>Make images. Not node graphs.</p>
   <div class="hero-actions">
    <Button href="#download"><Icon name="download" size={18} />Download</Button>
    <a class="text-link" href="#modes">Two ways to run <Icon name="arrow-down" size={17} /></a>
   </div>
  </div>
  <div class="hero-art" aria-hidden="true">
   <img src="{base}/assets/mooshieui-amber-sculpture.webp" width="1254" height="1254" alt="" fetchpriority="high" />
  </div>
 </div>
 <div class="wrap showcase" use:reveal>
  <div class="screenshot">
   <img src="{base}/assets/app-screenshot.avif" width="1874" height="1347"
    alt="MooshieUI generation workspace with prompt controls, a generated illustration, model settings, and artist styles." />
  </div>
 </div>
</section>

<style>
 .hero { padding-top: clamp(36px, 5vw, 72px); }
 .hero-layout { display: grid; grid-template-columns: 1.2fr 1fr; align-items: center; min-height: 510px; padding-bottom: 72px; }
 .hero-copy { position: relative; z-index: 1; }
 h1 { font-size: clamp(3.15rem, 6.4vw, 6rem); line-height: 1.04; font-weight: 450; letter-spacing: -.055em; margin: 0; color: var(--text-strong); }
 h1 span { display: block; font-size: clamp(1.6rem, 2.65vw, 2.55rem); color: var(--accent-500); letter-spacing: -.035em; line-height: 1.3; margin-top: 24px; }
 .hero-copy p { color: var(--text-muted); font-size: 1.125rem; margin: 22px 0 0; line-height: 1.6; }
 .hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 18px 28px; margin-top: 32px; }
 .hero-art { min-width: 0; }
 .hero-art img { display: block; width: 100%; height: auto; mask-image: radial-gradient(ellipse 65% 65% at center, black 50%, transparent 78%); }
 .showcase { padding-bottom: 16px; }
 .screenshot { border-radius: 14px; overflow: hidden; border: 1px solid var(--border-700); box-shadow: 0 24px 72px -30px #0008; }
 .screenshot img { display: block; width: 100%; height: auto; }
 @media (max-width: 800px) { .hero-layout { min-height: auto; grid-template-columns: 1fr; padding-bottom: 32px; } .hero-art { width: min(380px, 82%); margin: 24px auto 0; } .hero-copy { padding-top: 20px; } h1 { font-size: clamp(3rem, 9vw, 4.75rem); } }
 @media (max-width: 420px) { .hero-actions { gap: 10px 22px; } .hero-art { width: 74%; margin-top: 12px; } }
</style>
