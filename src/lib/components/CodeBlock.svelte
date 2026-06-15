<script>
	import Icon from '$lib/icons/Icon.svelte';

	let { label = 'Terminal', lines = [] } = $props();

	let copied = $state(false);

	function copy() {
		const text = lines.map((l) => l.text).join('\n');
		navigator.clipboard.writeText(text).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 1600);
		});
	}
</script>

<div class="code">
	<div class="code-bar">
		<span class="label">{label}</span>
		<button class="copy" class:done={copied} type="button" onclick={copy}>
			{#if copied}
				<Icon name="check" size={13} stroke={2.5} />Copied
			{:else}
				<Icon name="copy" size={13} />Copy
			{/if}
		</button>
	</div>
	<pre><code>{#each lines as line, i}<span class="pr">$</span> {line.text}{#if i < lines.length - 1}{'\n'}{/if}{/each}</code></pre>
</div>

<style>
	.code {
		margin: 14px 0 0;
		position: relative;
		background: var(--surface-950);
		border: 1px solid var(--border-700);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}
	.code-bar {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		border-bottom: 1px solid var(--border-700);
		background: var(--surface-900);
	}
	.label {
		font-size: var(--text-10);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--text-subtle);
		font-weight: var(--weight-semibold);
	}
	.copy {
		margin-left: auto;
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: var(--text-10);
		font-weight: var(--weight-semibold);
		color: var(--text-muted);
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px 6px;
		border-radius: var(--radius-sm);
		transition:
			color var(--dur-fast),
			background var(--dur-fast);
	}
	.copy:hover {
		color: var(--text);
		background: var(--surface-800);
	}
	.copy.done {
		color: var(--success-text);
	}
	pre {
		margin: 0;
		padding: 14px 16px;
		overflow-x: auto;
	}
	code {
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		line-height: 1.7;
		color: var(--text);
		white-space: pre;
	}
	.pr {
		color: var(--accent-400);
	}
</style>
