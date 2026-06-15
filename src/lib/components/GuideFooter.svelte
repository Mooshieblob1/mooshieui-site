<script>
	import { base } from '$app/paths';
</script>

<footer class="site">
	<div class="wrap-narrow foot-inner">
		<span class="meta">MooshieUI · a friendly front-end for ComfyUI</span>
		<div class="foot-links">
			<a href="{base}/">Home</a>
			<a href="{base}/build">Build from source</a>
			<a href="{base}/docker">Docker guide</a>
			<a href="https://github.com/Mooshieblob1/MooshieUI" target="_blank" rel="noopener">GitHub</a>
		</div>
	</div>
</footer>

<style>
	.site {
		padding: 40px 0;
		border-top: 1px solid var(--border-700);
		margin-top: 24px;
	}
	.foot-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
	}
	.meta {
		font-size: var(--text-xs);
		color: var(--text-subtle);
	}
	.foot-links {
		display: flex;
		gap: 18px;
		flex-wrap: wrap;
	}
	.foot-links a {
		font-size: var(--text-sm);
		color: var(--text-muted);
		transition: color var(--dur-fast);
	}
	.foot-links a:hover {
		color: var(--accent-400);
	}
</style>
