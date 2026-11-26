<script>
	import { base } from '$app/paths';
	import { reveal } from '$lib/actions/reveal';
	import Icon from '$lib/icons/Icon.svelte';

	const steps = [
		{
			title: 'Describe or enhance',
			body: 'Write positive and negative prompts manually, load saved Character sheets and Artist Styles, or iterate with the built-in Prompt Assistant.'
		},
		{
			title: 'Pick your backend',
			body: "Generate locally on any ComfyUI checkpoint and LoRA stack with Apply presets, or switch to your NovelAI V4 or V5 subscription in the same sidebar."
		},
		{
			title: 'Generate, edit & finish',
			body: 'Watch live previews, refine with tiled upscaling or Image Edit, compose Comic Pages, storyboard H3 video, or organize everything in Gallery boards.'
		}
	];

	const screenshots = [
		{
			id: 'novelai',
			label: 'NovelAI & Characters',
			image: `${base}/assets/screenshots/ui-novelai-workspace.avif`,
			width: 1500,
			height: 940,
			isPhone: false,
			alt: 'MooshieUI workspace in NovelAI V5 Full mode with multi-character prompts, Precise Reference character sheets for Hana and Ren, Anlas budgeting, and live preview.',
			caption:
				'Multi-character prompts, Precise Reference character sheets, live Anlas estimates, and unified preview controls inside the main workspace.',
			href: `${base}/wiki/novelai-backend`,
			linkLabel: 'NovelAI Backend guide'
		},
		{
			id: 'video',
			label: 'Video Timeline',
			image: `${base}/assets/screenshots/ui-video-timeline.avif`,
			width: 1500,
			height: 940,
			isPhone: false,
			alt: 'MooshieUI Video generation view with storyboard Timeline showing multi-shot segments, motion references, and audio tracks.',
			caption:
				'Multi-shot H3 video storyboards with duration budgeting, cast tags, motion references, and synchronized audio tracks.',
			href: `${base}/wiki/video-generation`,
			linkLabel: 'Video Generation guide'
		},
		{
			id: 'music',
			label: 'Music Studio',
			image: `${base}/assets/screenshots/ui-music-studio.avif`,
			width: 1500,
			height: 940,
			isPhone: false,
			alt: 'MooshieUI Music studio YuE2 screen with custom style prompt, section lyrics, vinyl player, waveform scrubber, and FLAC download.',
			caption:
				'Compose YuE2 original tracks or covers with section lyrics, waveform playback scrubbing, manual lyric sync, and lossless FLAC download.',
			href: `${base}/wiki/music-generation`,
			linkLabel: 'Music Generation guide'
		},
		{
			id: 'comic',
			label: 'Comic Pages',
			image: `${base}/assets/screenshots/ui-comic-pages.avif`,
			width: 1500,
			height: 940,
			isPhone: false,
			alt: 'MooshieUI Comic Page editor with a three-panel layout, vector caption and speech bubbles, NovelAI V5 settings, and CBZ/PDF export.',
			caption:
				'Arrange grid or freeform panels, position caption and speech bubbles, generate per-panel or whole pages, and export CBZ or PDF.',
			href: `${base}/wiki/comic-pages`,
			linkLabel: 'Comic Pages guide'
		},
		{
			id: 'gallery',
			label: 'Gallery & Boards',
			image: `${base}/assets/screenshots/ui-gallery.avif`,
			width: 1500,
			height: 940,
			isPhone: false,
			alt: 'MooshieUI Gallery filtered into boards showing character sheets, environments, star ratings, and favourites.',
			caption:
				'Search across prompts, models, LoRAs, and detected characters, rate and group outputs into boards, and keep embedded metadata handy.',
			href: `${base}/wiki/gallery-and-metadata`,
			linkLabel: 'Gallery & Metadata guide'
		},
		{
			id: 'mobile',
			label: 'Mobile UI',
			image: `${base}/assets/screenshots/ui-mobile.avif`,
			width: 860,
			height: 1864,
			isPhone: true,
			alt: 'MooshieUI responsive mobile browser layout showing generated artwork, compact prompt and library dock buttons, and bottom tab bar.',
			caption:
				'Responsive phone layout served in browser mode for prompting, monitoring live generations, and browsing results over LAN or tunnel.',
			href: `${base}/wiki/server-lan-and-multi-user`,
			linkLabel: 'Server, LAN & Multi-User guide'
		}
	];

	let activeId = $state('novelai');
	const activeShot = $derived(screenshots.find((s) => s.id === activeId) ?? screenshots[0]);

	function handleTabKeydown(event, index) {
		if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
		event.preventDefault();
		const delta = event.key === 'ArrowRight' ? 1 : -1;
		const next = (index + delta + screenshots.length) % screenshots.length;
		activeId = screenshots[next].id;
	}
</script>

<section class="section" id="look" aria-labelledby="look-heading">
	<div class="wrap">
		<div class="look-heading" use:reveal>
			<span class="eyebrow">From prompt to polished</span>
			<h2 id="look-heading" class="section-title">
				Three steps across<br /><span class="accent-serif">every</span> workflow
			</h2>
		</div>

		<ol class="steps">
			{#each steps as step, i}
				<li use:reveal>
					<span class="step-number" aria-hidden="true">0{i + 1}</span>
					<h3>{step.title}</h3>
					<p>{step.body}</p>
				</li>
			{/each}
		</ol>

		<div class="showcase" use:reveal>
			<div class="showcase-head">
				<span class="eyebrow">Inside the UI</span>
				<div class="tabs" role="tablist" aria-label="MooshieUI workspace screenshots">
					{#each screenshots as shot, i}
						<button
							type="button"
							role="tab"
							id="shot-tab-{shot.id}"
							aria-selected={activeShot.id === shot.id}
							aria-controls="shot-panel-{shot.id}"
							tabindex={activeShot.id === shot.id ? 0 : -1}
							class:active={activeShot.id === shot.id}
							onclick={() => (activeId = shot.id)}
							onkeydown={(e) => handleTabKeydown(e, i)}
						>
							{shot.label}
						</button>
					{/each}
				</div>
			</div>

			<div
				class="shot-panel"
				role="tabpanel"
				id="shot-panel-{activeShot.id}"
				aria-labelledby="shot-tab-{activeShot.id}"
			>
				<div class="shot-frame" class:is-phone={activeShot.isPhone}>
					{#key activeShot.id}
						<img
							src={activeShot.image}
							width={activeShot.width}
							height={activeShot.height}
							loading="lazy"
							decoding="async"
							alt={activeShot.alt}
						/>
					{/key}
				</div>
				<div class="shot-meta">
					<p>{activeShot.caption}</p>
					<a class="shot-link" href={activeShot.href}>
						{activeShot.linkLabel}<Icon name="arrow-right" size={15} />
					</a>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.look-heading {
		margin-bottom: 32px;
	}
	.steps {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.steps li {
		border-top: 1px solid var(--border-700);
		padding: 24px 24px 0 0;
	}
	.steps li + li {
		padding-left: 24px;
	}
	.step-number {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: var(--radius-md);
		color: var(--accent-foreground);
		background: var(--accent-600);
		font-size: 0.875rem;
		font-weight: 600;
		line-height: 1;
		margin-bottom: 16px;
	}
	h3 {
		font-size: 1.125rem;
		line-height: 1.4;
		font-weight: 600;
		margin: 0 0 12px;
	}
	.steps p {
		font-size: 1rem;
		line-height: 1.65;
		color: var(--text-muted);
		margin: 0;
	}
	.showcase {
		margin-top: 64px;
	}
	.showcase-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 16px 24px;
		margin-bottom: 20px;
	}
	.showcase-head .eyebrow {
		margin-bottom: 0;
	}
	.tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.tabs button {
		appearance: none;
		border: 1px solid var(--border-700);
		background: var(--surface-900);
		color: var(--text-muted);
		border-radius: 999px;
		padding: 8px 16px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition:
			background var(--dur-fast),
			border-color var(--dur-fast),
			color var(--dur-fast);
	}
	.tabs button:hover {
		color: var(--text-strong);
		border-color: color-mix(in srgb, var(--accent-500) 45%, var(--border-700));
	}
	.tabs button.active {
		background: var(--accent-600);
		border-color: var(--accent-600);
		color: var(--accent-foreground);
		font-weight: 600;
	}
	.shot-frame {
		padding: 10px;
		border: 1px solid var(--border-700);
		border-radius: var(--radius-xl);
		background:
			radial-gradient(
				120% 80% at 50% 0%,
				color-mix(in srgb, var(--accent-500) 10%, transparent),
				transparent 60%
			),
			var(--surface-900);
		box-shadow: var(--shadow-panel);
	}
	.shot-frame.is-phone {
		max-width: 340px;
		margin-inline: auto;
	}
	.shot-frame img {
		display: block;
		width: 100%;
		height: auto;
		border-radius: calc(var(--radius-xl) - 6px);
	}
	.shot-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px 24px;
		margin-top: 16px;
	}
	.shot-meta p {
		margin: 0;
		font-size: 0.96875rem;
		line-height: 1.6;
		color: var(--text-muted);
		max-width: 68ch;
	}
	.shot-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--accent-400);
		text-decoration: none;
		white-space: nowrap;
		transition: color var(--dur-fast);
	}
	.shot-link:hover {
		color: var(--text-strong);
	}
	@media (max-width: 800px) {
		.steps {
			grid-template-columns: 1fr;
			gap: 24px;
		}
		.steps li:nth-child(n) {
			padding: 24px 0 0;
		}
		.showcase {
			margin-top: 48px;
		}
	}
</style>
