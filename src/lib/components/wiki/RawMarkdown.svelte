<script>
	import Icon from '$lib/icons/Icon.svelte';
	import { copyText } from '$lib/wiki/clipboard.js';

	/**
	 * A plain-text box with a Copy all button, for pasting docs into an LLM.
	 * Pass `text`, or `src` to fetch it the first time the box scrolls into view.
	 */
	let { text = '', src = '', filename = 'page.md', href = '', tall = false } = $props();

	let loaded = $state('');
	let failed = $state(false);
	let copied = $state(false);
	let box = $state();

	const content = $derived(text || loaded);
	const lines = $derived(content ? content.split('\n').length : 0);
	const kb = $derived(content ? Math.max(1, Math.round(new Blob([content]).size / 1024)) : 0);

	async function fetchText() {
		if (!src || loaded) return loaded;
		try {
			const r = await fetch(src);
			if (!r.ok) throw new Error(String(r.status));
			loaded = await r.text();
		} catch {
			failed = true;
		}
		return loaded;
	}

	$effect(() => {
		if (!src || text || !box) return;
		const io = new IntersectionObserver((entries) => {
			if (entries.some((e) => e.isIntersecting)) {
				fetchText();
				io.disconnect();
			}
		}, { rootMargin: '200px' });
		io.observe(box);
		return () => io.disconnect();
	});

	async function copyAll() {
		const value = content || (await fetchText());
		if (!value) return;
		if (await copyText(value)) {
			copied = true;
			setTimeout(() => (copied = false), 1800);
		}
	}
</script>

<div class="raw" class:tall bind:this={box}>
	<div class="bar">
		<Icon name="file-code" size={15} />
		<span class="name">{filename}</span>
		{#if content}<span class="meta">{lines.toLocaleString('en')} lines · {kb} KB</span>{/if}
		<span class="actions">
			{#if href}
				<a class="btn-raw" href={href} target="_blank" rel="noopener"><Icon name="external" size={14} />Raw</a>
			{/if}
			<button class="copy" class:done={copied} type="button" onclick={copyAll} disabled={!content && !src}>
				{#if copied}<Icon name="check" size={14} stroke={2.5} />Copied{:else}<Icon name="copy" size={14} />Copy all{/if}
			</button>
		</span>
	</div>
	<textarea
		readonly
		spellcheck="false"
		aria-label="{filename} as plain text"
		value={content || (failed ? 'Could not load the file. Use the Raw link instead.' : 'Loading…')}
		onfocus={(e) => e.currentTarget.select()}
	></textarea>
</div>

<style>
	.raw {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border-700);
		border-radius: var(--radius-lg);
		background: var(--surface-950);
		overflow: hidden;
	}
	.bar {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
		padding: 8px 8px 8px 14px;
		background: var(--surface-900);
		border-bottom: 1px solid var(--border-700);
		color: var(--text-muted);
	}
	.name {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text);
	}
	.meta {
		font-size: var(--text-xs);
		color: var(--text-subtle);
	}
	.actions {
		margin-left: auto;
		display: flex;
		gap: 6px;
	}
	.btn-raw,
	.copy {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 7px 12px;
		border-radius: var(--radius-md);
		font-size: var(--text-xs);
		font-weight: 600;
		cursor: pointer;
		border: 1px solid var(--border-700);
		background: var(--surface-800);
		color: var(--text);
		transition: background var(--dur-fast), border-color var(--dur-fast);
	}
	.btn-raw:hover {
		border-color: var(--neutral-600);
	}
	.copy {
		background: var(--accent-600);
		border-color: var(--accent-600);
		color: var(--accent-foreground);
	}
	.copy:hover {
		background: var(--accent-500);
	}
	.copy.done {
		background: var(--success-strong);
		border-color: var(--success-strong);
		color: #fff;
	}
	.copy:disabled {
		opacity: 0.5;
		cursor: default;
	}
	textarea {
		display: block;
		width: 100%;
		height: 420px;
		resize: vertical;
		margin: 0;
		padding: 14px 16px;
		border: 0;
		outline: 0;
		background: transparent;
		color: var(--text);
		font-family: var(--font-mono);
		font-size: 13px;
		line-height: 1.65;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		overflow: auto;
		tab-size: 4;
	}
	.tall textarea {
		height: min(70vh, 760px);
	}
</style>
