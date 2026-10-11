<script lang="ts">
	import Icon from '$lib/icons/Icon.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { KOFI_URL, SPONSORS_URL } from '$lib/site.js';
</script>

<section class="section support" id="support" aria-labelledby="support-heading">
	<div class="wrap">
		<div class="section-heading" use:reveal>
			<div><span class="eyebrow">Support MooshieUI</span>
			<h2 id="support-heading">Keep the <span class="accent-serif">queue</span> running</h2></div>
			<p>
				MooshieUI is free and open source, and it will stay that way. If it has earned a spot in
				your workflow, you can help fund its development.
			</p>
		</div>
		<div class="support-grid">
			<div class="support-card sponsor" use:reveal>
				<div class="card-head">
					<img
						class="avatar"
						src="https://github.com/Mooshieblob1.png?size=96"
						alt=""
						width="48"
						height="48"
						loading="lazy"
					/>
					<div>
						<h3>Sponsor Mooshieblob1</h3>
						<p class="meta"><Icon name="github" size={13} /> GitHub Sponsors</p>
					</div>
				</div>
				<p class="note">
					Back development directly through GitHub. Sponsorships go straight to the developer
					behind MooshieUI.
				</p>
				<a class="btn btn-primary" href={SPONSORS_URL} target="_blank" rel="noopener">
					<Icon name="heart" size={18} />
					Sponsor on GitHub
				</a>
			</div>

			<div class="support-card" use:reveal>
				<div class="card-head">
					<span class="badge"><Icon name="coffee" size={24} /></span>
					<div>
						<h3>Buy a coffee</h3>
						<p class="meta">Ko-fi</p>
					</div>
				</div>
				<p class="note">
					Prefer a quick one-off thank-you? Leave a tip on Ko-fi. Every coffee helps keep new
					features coming.
				</p>
				<a class="btn btn-secondary" href={KOFI_URL} target="_blank" rel="noopener">
					<Icon name="coffee" size={18} />
					Support on Ko-fi
				</a>
			</div>
		</div>
	</div>
</section>

<style>
 .support { border-bottom: 1px solid var(--border-700); }
 .support-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
 .support-card { display: flex; flex-direction: column; gap: 20px; border: 1px solid var(--border-700); border-radius: var(--app-shell-radius); background: var(--surface-900); padding: 24px; min-width: 0; }
 .sponsor { border-color: color-mix(in srgb, var(--accent-500) 35%, var(--border-700)); box-shadow: 0 18px 40px -28px color-mix(in srgb, var(--accent-600) 45%, transparent); }
 .card-head { display: flex; align-items: center; gap: 14px; padding-bottom: 18px; border-bottom: 1px solid var(--border-700); }
 .avatar { width: 48px; height: 48px; border-radius: var(--radius-full); border: 2px solid var(--accent-500); background: var(--surface-800); flex-shrink: 0; }
 .badge { display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: var(--radius-full); background: var(--surface-800); border: 1px solid var(--border-700); color: var(--accent-400); flex-shrink: 0; }
 h3 { font-size: 1.25rem; font-weight: 600; margin: 0; letter-spacing: -.01em; }
 .meta { display: flex; align-items: center; gap: 6px; font-size: .8125rem; color: var(--text-muted); margin: 5px 0 0; line-height: 1.5; }
 .note { font-size: 1rem; line-height: 1.65; color: var(--text-muted); margin: 0; flex: 1; }
 .support-card > .btn { width: 100%; }
 .support-card .btn-secondary :global(svg) { color: var(--accent-400); }
 @media(max-width: 800px) { .support-grid { grid-template-columns: 1fr; gap: 24px; } }
</style>
