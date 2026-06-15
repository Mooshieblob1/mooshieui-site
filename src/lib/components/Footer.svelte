<script>
	import { base } from '$app/paths';
	const repo = 'https://github.com/Mooshieblob1/MooshieUI';
</script>

<footer class="site">
	<div class="wrap">
		<div class="foot-top">
			<div class="foot-brand">
				<a class="brand" href="{base}/">
					<img src="{base}/assets/logo.png" alt="" />
					<span class="word">Mooshie<b>UI</b></span>
				</a>
				<p>
					A beginner-friendly interface for ComfyUI. Generate without hand-editing graphs, on your
					desktop or in any browser.
				</p>
			</div>
			<div class="foot-cols">
				<div class="foot-col">
					<h5>Product</h5>
					<a href="{base}/#features">Features</a>
					<a href="{base}/#modes">How it runs</a>
					<a href="{base}/#look">A closer look</a>
					<a href="{base}/#download">Get started</a>
				</div>
				<div class="foot-col">
					<h5>Guides</h5>
					<a href="{base}/build">Build from source</a>
					<a href="{base}/docker">Docker guide</a>
					<a href={repo + '#readme'} target="_blank" rel="noopener">Documentation</a>
				</div>
				<div class="foot-col">
					<h5>Resources</h5>
					<a href={repo} target="_blank" rel="noopener">GitHub repo</a>
					<a href={repo + '/releases'} target="_blank" rel="noopener">Releases</a>
					<a href="https://github.com/comfyanonymous/ComfyUI" target="_blank" rel="noopener"
						>ComfyUI</a
					>
				</div>
			</div>
		</div>
		<div class="foot-bottom">
			<span class="meta">Open source · MIT-style license · © 2026 MooshieUI</span>
			<span class="status"><span class="dot"></span>Open source · v1.4.11</span>
		</div>
	</div>
</footer>

<style>
	.site {
		padding: 56px 0 40px;
	}
	.foot-top {
		display: flex;
		justify-content: space-between;
		gap: 40px;
		flex-wrap: wrap;
		padding-bottom: 32px;
		border-bottom: 1px solid var(--border-700);
	}
	.foot-brand {
		max-width: 300px;
	}
	.foot-brand .brand {
		margin-bottom: 12px;
		display: flex;
		align-items: center;
		gap: 10px;
		font-weight: var(--weight-bold);
		font-size: var(--text-lg);
		letter-spacing: -0.02em;
	}
	.foot-brand .brand img {
		width: 30px;
		height: 30px;
	}
	.foot-brand p {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--text-muted);
		line-height: var(--leading-snug);
	}
	.foot-cols {
		display: flex;
		gap: 56px;
		flex-wrap: wrap;
	}
	.foot-col h5 {
		margin: 0 0 14px;
		font-size: var(--text-10);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--text-subtle);
	}
	.foot-col a {
		display: block;
		padding: 5px 0;
		font-size: var(--text-sm);
		color: var(--text-muted);
		transition: color var(--dur-fast);
	}
	.foot-col a:hover {
		color: var(--accent-400);
	}
	.foot-bottom {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
		flex-wrap: wrap;
		padding-top: 24px;
	}
	.foot-bottom .meta {
		font-size: var(--text-xs);
		color: var(--text-subtle);
	}
	.foot-bottom .status {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-size: var(--text-xs);
		color: var(--text-muted);
	}
	.foot-bottom .status .dot {
		width: 7px;
		height: 7px;
		border-radius: 9999px;
		background: var(--success);
	}
</style>
