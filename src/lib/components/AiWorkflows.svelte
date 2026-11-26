<script>
	import { base } from '$app/paths';
	import { reveal } from '$lib/actions/reveal';
	import Icon from '$lib/icons/Icon.svelte';

	const workflows = [
		{
			icon: 'sparkles',
			tag: 'Built-in Prompt Assistant',
			title: 'Iterate on prompts inside the workspace',
			body: 'Connect local Ollama or LM Studio models, or your own OpenAI, Anthropic, Gemini, Grok, or OpenRouter keys. Model-aware modes help expand scenes, format multi-character NovelAI V5 tags with isolated undesired content, reuse recipes, and look up your saved character sheets.',
			image: `${base}/assets/screenshots/ui-enhance-v5.avif`,
			width: 1500,
			height: 940,
			alt: 'MooshieUI Enhance for V5 prompt assistant modal splitting base prompt and Hana and Ren character prompts with recipes applied.',
			href: `${base}/wiki/prompt-assistant`,
			linkLabel: 'Prompt Assistant guide'
		},
		{
			icon: 'bot',
			tag: 'External AI via MCP',
			title: 'Control generations from Claude, Cursor, and ChatGPT',
			body: 'Enable the opt-in MCP server (off by default) on 127.0.0.1:3210 with bearer token auth and an optional Cloudflare quick tunnel. Assistants can generate images and music, expand prompts, lay out Comic Pages, and search your gallery while reusing your active ComfyUI or NovelAI setup.',
			image: `${base}/assets/screenshots/ui-mcp-settings.avif`,
			width: 1500,
			height: 940,
			alt: 'MooshieUI Settings screen on the AI assistants (MCP) tab showing port 3210, masked token, Claude Code command, JSON config, and running Cloudflare tunnel.',
			href: `${base}/wiki/ai-assistants-and-mcp`,
			linkLabel: 'AI Assistants and MCP guide'
		}
	];
</script>

<section class="section" id="ai-workflows" aria-labelledby="ai-workflows-heading">
	<div class="wrap">
		<div class="ai-heading" use:reveal>
			<div>
				<span class="eyebrow">Prompting &amp; automation</span>
				<h2 id="ai-workflows-heading" class="section-title">
					Refine prompts with an LLM.<br />Drive MooshieUI via <span class="accent-serif">MCP</span>.
				</h2>
			</div>
			<p class="section-intro">
				Draft better prompts right beside your canvas with local or API language models, or let an
				external AI assistant trigger tools through MooshieUI's built-in MCP server.
			</p>
		</div>

		<div class="ai-grid">
			{#each workflows as item}
				<article class="ai-card" use:reveal>
					<div class="ai-card-head">
						<span class="ai-tag"><Icon name={item.icon} size={15} />{item.tag}</span>
						<h3>{item.title}</h3>
						<p>{item.body}</p>
					</div>
					<div class="ai-shot">
						<img
							src={item.image}
							width={item.width}
							height={item.height}
							loading="lazy"
							decoding="async"
							alt={item.alt}
						/>
					</div>
					<a class="ai-link" href={item.href}>
						{item.linkLabel}<Icon name="arrow-right" size={15} />
					</a>
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	.ai-heading {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
		gap: 24px 48px;
		align-items: end;
		margin-bottom: 40px;
	}
	.ai-heading .section-intro {
		margin: 0;
	}
	.ai-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 24px;
	}
	.ai-card {
		display: flex;
		flex-direction: column;
		gap: 20px;
		padding: 28px;
		background: var(--surface-900);
		border: 1px solid var(--border-700);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-panel);
	}
	.ai-card-head {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.ai-tag {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		align-self: flex-start;
		padding: 6px 12px;
		border-radius: 999px;
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--accent-400);
		background: color-mix(in srgb, var(--accent-500) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--accent-500) 30%, transparent);
	}
	h3 {
		font-size: 1.25rem;
		line-height: 1.35;
		font-weight: 600;
		color: var(--text-strong);
		margin: 4px 0 0;
	}
	.ai-card-head p {
		margin: 0;
		font-size: 0.96875rem;
		line-height: 1.65;
		color: var(--text-muted);
	}
	.ai-shot {
		margin-top: auto;
		padding: 8px;
		border: 1px solid var(--border-700);
		border-radius: var(--radius-lg);
		background:
			radial-gradient(
				120% 80% at 50% 0%,
				color-mix(in srgb, var(--accent-500) 10%, transparent),
				transparent 60%
			),
			var(--surface-950);
	}
	.ai-shot img {
		display: block;
		width: 100%;
		height: auto;
		border-radius: calc(var(--radius-lg) - 4px);
	}
	.ai-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		align-self: flex-start;
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--accent-400);
		text-decoration: none;
		transition: color var(--dur-fast);
	}
	.ai-link:hover {
		color: var(--text-strong);
	}
	@media (max-width: 960px) {
		.ai-heading,
		.ai-grid {
			grid-template-columns: 1fr;
		}
		.ai-card {
			padding: 22px;
		}
	}
</style>
