<script>
	import { tweaks, setTweak } from '$lib/theme.js';

	let open = $state(false);

	const sections = [
		{
			label: 'Palette',
			rows: [
				{
					key: 'theme',
					label: 'Theme',
					options: [
						{ label: 'Charcoal', value: 'charcoal' },
						{ label: 'Midnight', value: 'midnight' },
						{ label: 'Cream', value: 'cream' }
					]
				},
				{
					key: 'accent',
					label: 'Accent',
					options: [
						{ label: 'Honey', value: 'honey' },
						{ label: 'Mooshie', value: 'mooshie' },
						{ label: 'Terracotta', value: 'terracotta' }
					]
				}
			]
		},
		{
			label: 'Feel',
			rows: [
				{
					key: 'background',
					label: 'Backdrop',
					options: [
						{ label: 'Flat', value: 'flat' },
						{ label: 'Blobs', value: 'blobs' },
						{ label: 'Glow', value: 'glow' }
					]
				},
				{
					key: 'corners',
					label: 'Corners',
					options: [
						{ label: 'Soft', value: 'soft' },
						{ label: 'Sharp', value: 'sharp' }
					]
				},
				{
					key: 'font',
					label: 'Type',
					options: [
						{ label: 'Hanken', value: 'grotesk' },
						{ label: 'Rounded', value: 'rounded' },
						{ label: 'Clean', value: 'clean' }
					]
				}
			]
		}
	];
</script>

<div class="tweaks" class:open>
	<button class="toggle" onclick={() => (open = !open)} aria-expanded={open}>
		<svg
			width="15"
			height="15"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<line x1="4" y1="21" x2="4" y2="14" />
			<line x1="4" y1="10" x2="4" y2="3" />
			<line x1="12" y1="21" x2="12" y2="12" />
			<line x1="12" y1="8" x2="12" y2="3" />
			<line x1="20" y1="21" x2="20" y2="16" />
			<line x1="20" y1="12" x2="20" y2="3" />
			<line x1="1" y1="14" x2="7" y2="14" />
			<line x1="9" y1="8" x2="15" y2="8" />
			<line x1="17" y1="16" x2="23" y2="16" />
		</svg>
		Tweaks
	</button>

	{#if open}
		<div class="panel">
			<div class="panel-head">Tweaks</div>
			{#each sections as section}
				<div class="section-label">{section.label}</div>
				{#each section.rows as row}
					<div class="row">
						<span class="row-label">{row.label}</span>
						<div class="seg">
							{#each row.options as opt}
								<button
									class="seg-btn"
									class:active={$tweaks[row.key] === opt.value}
									onclick={() => setTweak(row.key, opt.value)}
								>
									{opt.label}
								</button>
							{/each}
						</div>
					</div>
				{/each}
			{/each}
		</div>
	{/if}
</div>

<style>
	.tweaks {
		position: fixed;
		right: 18px;
		bottom: 18px;
		z-index: 80;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 10px;
	}
	.toggle {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		height: 38px;
		padding: 0 14px;
		font-family: var(--font-sans);
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		color: var(--text);
		background: var(--surface-900);
		border: 1px solid var(--border-700);
		border-radius: var(--radius-full);
		cursor: pointer;
		box-shadow: var(--shadow-md);
		transition:
			background var(--dur-fast),
			border-color var(--dur-fast),
			color var(--dur-fast);
	}
	.toggle:hover {
		background: var(--surface-800);
		color: var(--text-strong);
	}
	.open .toggle {
		color: var(--accent-400);
		border-color: color-mix(in srgb, var(--accent-500) 45%, var(--border-700));
	}
	.panel {
		width: 250px;
		padding: 16px;
		background: var(--surface-900);
		border: 1px solid var(--border-700);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		animation: tweaks-in 0.2s var(--ease-out);
	}
	@keyframes tweaks-in {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
	.panel-head {
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		color: var(--text-strong);
		margin-bottom: 14px;
	}
	.section-label {
		font-size: var(--text-10);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--tracking-wide);
		text-transform: uppercase;
		color: var(--text-subtle);
		margin: 14px 0 8px;
	}
	.section-label:first-of-type {
		margin-top: 0;
	}
	.row {
		margin-bottom: 10px;
	}
	.row-label {
		display: block;
		font-size: var(--text-xs);
		color: var(--text-muted);
		margin-bottom: 6px;
	}
	.seg {
		display: flex;
		gap: 4px;
		padding: 3px;
		background: var(--surface-950);
		border: 1px solid var(--border-700);
		border-radius: var(--radius-md);
	}
	.seg-btn {
		flex: 1;
		height: 26px;
		padding: 0 4px;
		font-family: var(--font-sans);
		font-size: var(--text-10);
		font-weight: var(--weight-semibold);
		color: var(--text-muted);
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition:
			background var(--dur-fast),
			color var(--dur-fast);
	}
	.seg-btn:hover {
		color: var(--text);
	}
	.seg-btn.active {
		background: var(--accent-500);
		color: var(--accent-foreground);
	}
</style>
