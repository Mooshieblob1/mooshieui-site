<script lang="ts">
	import { onDestroy } from 'svelte';
	import Icon from '$lib/icons/Icon.svelte';

	let { label = 'Terminal', lines = [] }: { label?: string; lines?: { text: string }[] } = $props();
	let copied = $state(false);
	let error = $state('');
	let resetTimer: ReturnType<typeof setTimeout>;

	async function copy() {
		error = '';
		try {
			await navigator.clipboard.writeText(lines.map((line) => line.text).join('\n'));
			copied = true;
			clearTimeout(resetTimer);
			resetTimer = setTimeout(() => (copied = false), 1600);
		} catch {
			copied = false;
			error = 'Could not copy. Select and copy the text below.';
		}
	}
	onDestroy(() => clearTimeout(resetTimer));
</script>

<div class="code">
	<div class="code-bar">
		<span class="label">{label}</span>
		<button class="copy" class:done={copied} type="button" onclick={copy} aria-label={'Copy ' + label + ' code'}>
			<Icon name={copied ? 'check' : 'copy'} size={15} />{copied ? 'Copied' : 'Copy'}
		</button>
	</div>
	<span class="sr-only" role="status">{copied ? 'Code copied to clipboard.' : error}</span>
	{#if error}<p class="copy-error">{error}</p>{/if}
	<!-- svelte-ignore a11y_no_noninteractive_tabindex (Scrollable code requires keyboard focus for horizontal scrolling.) -->
	<pre role="region" tabindex="0" aria-label={label + ' code'}><code>{#each lines as line, i}{#if label === 'Terminal'}<span class="pr" aria-hidden="true">$ </span>{/if}{line.text}{#if i < lines.length - 1}{'\n'}{/if}{/each}</code></pre>
</div>

<style>
	.code { min-width: 0; margin-top: 22px; border: 1px solid var(--border-700); border-radius: 6px; overflow: hidden; background: var(--surface-950); }
	.code-bar { display: flex; align-items: center; gap: 10px; padding: 4px 12px 4px 18px; border-bottom: 1px solid var(--border-700); background: var(--surface-900); }
  .code-bar::before { content: ''; width: 7px; height: 7px; flex-shrink: 0; border: 1px solid var(--accent-500); border-radius: 50%; background: var(--surface-950); }
  .label { font-family: var(--font-mono); font-size: .75rem; color: var(--text-subtle); }
	.copy { margin-left: auto; min-height: 40px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 8px 10px; border: 0; border-radius: 5px; background: transparent; color: var(--text-muted); font-size: .875rem; cursor: pointer; }
	.copy:hover { background: var(--surface-800); color: var(--text); }
	.copy.done { color: var(--accent-500); }
	.copy:focus-visible { outline-offset: 0; }
	pre { margin: 0; padding: 22px; overflow-x: auto; }
	pre:focus-visible { outline-offset: -3px; }
	code { font-family: var(--font-mono); font-size: .875rem; line-height: 1.9; color: var(--text); white-space: pre; }
	.pr { color: var(--accent-500); user-select: none; }
	.copy-error { margin: 0; padding: 12px 18px 0; font-size: .875rem; color: var(--accent-300); }
	.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
</style>
