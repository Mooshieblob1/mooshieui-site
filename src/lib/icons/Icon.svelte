<script>
	/**
	 * Lucide-weight line icons (2px stroke, round caps/joins) drawn inline so they
	 * inherit text color and tint to the accent only when their control is active.
	 * GitHub mark is the one filled glyph.
	 */
	let { name, size = 18, stroke = 2, class: klass = '' } = $props();
	const filled = name === 'github';
</script>

<svg
	class={klass}
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill={filled ? 'currentColor' : 'none'}
	stroke={filled ? 'none' : 'currentColor'}
	stroke-width={stroke}
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#if name === 'github'}
		<path
			d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.34 9.34 0 0 1 12 6.84c.85 0 1.71.12 2.51.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.03 10.03 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"
		/>
	{:else if name === 'download'}
		<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
		<polyline points="7 10 12 15 17 10" />
		<line x1="12" y1="15" x2="12" y2="3" />
	{:else if name === 'browser'}
		<rect x="2" y="4" width="20" height="16" rx="2" />
		<path d="M2 9h20" />
		<circle cx="5.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
		<circle cx="7.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
	{:else if name === 'sliders'}
		<line x1="4" y1="21" x2="4" y2="14" />
		<line x1="4" y1="10" x2="4" y2="3" />
		<line x1="12" y1="21" x2="12" y2="12" />
		<line x1="12" y1="8" x2="12" y2="3" />
		<line x1="20" y1="21" x2="20" y2="16" />
		<line x1="20" y1="12" x2="20" y2="3" />
		<line x1="1" y1="14" x2="7" y2="14" />
		<line x1="9" y1="8" x2="15" y2="8" />
		<line x1="17" y1="16" x2="23" y2="16" />
	{:else if name === 'image'}
		<rect x="3" y="3" width="18" height="18" rx="2" />
		<circle cx="9" cy="9" r="2" />
		<path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 21" />
	{:else if name === 'layers'}
		<polygon points="12 2 2 7 12 12 22 7 12 2" />
		<polyline points="2 17 12 22 22 17" />
		<polyline points="2 12 12 17 22 12" />
	{:else if name === 'wand'}
		<path d="m15 4 5 5L9 20l-5 1 1-5L15 4z" />
		<path d="m18 7-3-3" />
	{:else if name === 'grid'}
		<rect x="3" y="3" width="7" height="7" rx="1" />
		<rect x="14" y="3" width="7" height="7" rx="1" />
		<rect x="14" y="14" width="7" height="7" rx="1" />
		<rect x="3" y="14" width="7" height="7" rx="1" />
	{:else if name === 'phone'}
		<rect x="6" y="2" width="12" height="20" rx="2.5" />
		<line x1="11" y1="18" x2="13" y2="18" />
	{:else if name === 'check'}
		<polyline points="20 6 9 17 4 12" />
	{:else if name === 'code'}
		<polyline points="16 18 22 12 16 6" />
		<polyline points="8 6 2 12 8 18" />
	{:else if name === 'server'}
		<rect x="2" y="4" width="20" height="6" rx="1" />
		<rect x="2" y="14" width="20" height="6" rx="1" />
		<line x1="6" y1="7" x2="6.01" y2="7" />
		<line x1="6" y1="17" x2="6.01" y2="17" />
	{:else if name === 'cloud'}
		<path d="M17.5 19a4.5 4.5 0 0 0 .5-8.97 6 6 0 0 0-11.64-1.4A4 4 0 0 0 6.5 19h11Z" />
	{:else if name === 'info'}
		<circle cx="12" cy="12" r="10" />
		<line x1="12" y1="16" x2="12" y2="12" />
		<line x1="12" y1="8" x2="12.01" y2="8" />
	{:else if name === 'arrow-left'}
		<line x1="19" y1="12" x2="5" y2="12" />
		<polyline points="12 19 5 12 12 5" />
	{:else if name === 'copy'}
		<rect x="9" y="9" width="13" height="13" rx="2" />
		<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
	{:else if name === 'sparkles'}
		<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
	{:else if name === 'sliders-h'}
		<line x1="4" y1="6" x2="20" y2="6" />
		<line x1="4" y1="12" x2="20" y2="12" />
		<line x1="4" y1="18" x2="20" y2="18" />
		<circle cx="9" cy="6" r="2" fill="currentColor" stroke="none" />
		<circle cx="15" cy="12" r="2" fill="currentColor" stroke="none" />
		<circle cx="8" cy="18" r="2" fill="currentColor" stroke="none" />
	{/if}
</svg>
