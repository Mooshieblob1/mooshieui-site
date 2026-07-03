<script>
	import Icon from '$lib/icons/Icon.svelte';
	import { base } from '$app/paths';
	import { Button } from '$lib/components/ui/button';

	let { variant = 'landing' } = $props();

	let scrolled = $state(false);

	function onScroll() {
		scrolled = window.scrollY > 8;
	}

	$effect(() => {
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	const repo = 'https://github.com/Mooshieblob1/MooshieUI';
</script>

<header class="nav" class:scrolled class:guide={variant === 'guide'} class:liquid-glass={scrolled || variant === 'guide'}>
	<div class="wrap nav-inner">
		<a class="brand" href="{base}/">
			<img src="{base}/assets/logo.png" alt="" />
			<span class="word">Mooshie<b>UI</b></span>
		</a>

		{#if variant === 'landing'}
			<nav class="nav-links">
				<a href="#features">Features</a>
				<a href="#modes">How it runs</a>
				<a href="#look">A closer look</a>
				<a href="#download">Get started</a>
			</nav>
			<div class="nav-right">
				<Button variant="ghost" size="sm" href={repo} target="_blank" rel="noopener" class="liquid-glass">
					<Icon name="github" size={15} />
					GitHub
				</Button>
				<Button size="sm" href="#download" class="liquid-glass">Get started</Button>
			</div>
		{:else}
			<div class="nav-right">
				<a class="back" href="{base}/">
					<Icon name="arrow-left" size={16} />
					Back to home
				</a>
				<a class="btn btn-secondary btn-sm" href={repo} target="_blank" rel="noopener">
					<Icon name="github" size={16} />
					Repo
				</a>
			</div>
		{/if}
	</div>
</header>

<style>
	.nav {
		position: sticky;
		top: 0;
		z-index: 50;
		background: color-mix(in srgb, var(--bg) 72%, transparent);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		transition: background var(--dur-base);
	}
	.nav-inner {
		display: flex;
		align-items: center;
		gap: 28px;
		height: 64px;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 10px;
		font-weight: var(--weight-bold);
		font-size: var(--text-lg);
		letter-spacing: -0.02em;
	}
	.brand img {
		width: 30px;
		height: 30px;
	}
	.nav-links {
		display: flex;
		align-items: center;
		gap: 4px;
		margin-left: 8px;
	}
	.nav-links a {
		padding: 8px 12px;
		font-size: var(--text-sm);
		color: var(--text-muted);
		border-radius: var(--radius-md);
		transition:
			color var(--dur-fast),
			background var(--dur-fast);
	}
	.nav-links a:hover {
		color: var(--text);
		background: var(--surface-800);
	}
	.nav-right {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.back {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		font-size: var(--text-sm);
		color: var(--text-muted);
		padding: 8px 12px;
		border-radius: var(--radius-md);
		transition:
			color var(--dur-fast),
			background var(--dur-fast);
	}
	.back:hover {
		color: var(--text);
		background: var(--surface-800);
	}
	@media (max-width: 820px) {
		.nav-links {
			display: none;
		}
	}
</style>
