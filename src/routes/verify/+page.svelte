<script lang="ts">
	import { onDestroy } from 'svelte';
	import Nav from '$lib/components/Nav.svelte';
	import GuideFooter from '$lib/components/GuideFooter.svelte';
	import Icon from '$lib/icons/Icon.svelte';
	import {
		verifyFile,
		type VerificationReport,
		type TrustMarkProgress,
		type TrustMarkScanResult
	} from '$lib/verify/index.ts';
	import { isTrustMarkCached, scanTrustMark } from '$lib/verify/trustmark.ts';

	let fileInput = $state<HTMLInputElement | null>(null);
	let isDragging = $state(false);
	let currentFile = $state<File | null>(null);
	let previewUrl = $state<string | null>(null);
	let report = $state<VerificationReport | null>(null);
	let parseError = $state<string | null>(null);

	let trustmarkCached = $state(false);
	let trustmarkResult = $state<TrustMarkScanResult | null>(null);
	let trustmarkProgress = $state<TrustMarkProgress | null>(null);
	let trustmarkScanning = $state(false);
	let trustmarkError = $state<string | null>(null);
	let copiedKey = $state<string | null>(null);

	$effect(() => {
		isTrustMarkCached().then((c) => {
			trustmarkCached = c;
		});
	});

	onDestroy(() => {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
	});

	const canRunTrustmark = $derived(
		report !== null &&
			(report.format === 'png' ||
				report.format === 'webp' ||
				report.format === 'jpeg' ||
				report.format === 'avif')
	);

	const overallVerdict = $derived.by(() => {
		if (!report) return null;
		const tm = trustmarkResult;
		if (report.hasAnyAiSignal || tm?.status === 'mooshieui') {
			const signals: string[] = [];
			if (report.iptc.isAiDisclosed) signals.push('IPTC AI disclosure');
			if (report.iptc.c2paPresent) signals.push('C2PA manifest');
			if (report.stealth.found) signals.push('Stealth Alpha');
			if (report.parsed.carrier === 'chunks' || report.parsed.carrier === 'both') {
				signals.push('Container metadata');
			}
			if (tm?.status === 'mooshieui') signals.push('MooshieUI TrustMark');
			return {
				kind: 'ai' as const,
				title: 'AI-generated signals detected',
				detail:
					signals.length > 0
						? `Verified via ${signals.join(' · ')}.`
						: 'Generation metadata was found inside this file.'
			};
		}
		if (tm?.status === 'third_party') {
			return {
				kind: 'third_party' as const,
				title: 'Third-party TrustMark watermark detected',
				detail: `Detected a non-MooshieUI TrustMark (${tm.version ?? 'BCH'}) payload in the pixels.`
			};
		}
		return {
			kind: 'none' as const,
			title: 'No AI metadata or watermark detected',
			detail:
				tm === null && canRunTrustmark
					? 'No container metadata or Stealth Alpha was found. Run the pixel TrustMark scan below to check for screenshot-resistant marks.'
					: 'No IPTC disclosure, generation metadata, Stealth Alpha, or readable TrustMark was found. Note that metadata can be stripped outside MooshieUI and this does not prove human authorship.'
		};
	});

	function formatBytes(n: number): string {
		if (n < 1024) return `${n} B`;
		if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
		return `${(n / (1024 * 1024)).toFixed(2)} MB`;
	}

	async function inspectFile(file: File) {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			previewUrl = null;
		}
		currentFile = file;
		report = null;
		parseError = null;
		trustmarkResult = null;
		trustmarkProgress = null;
		trustmarkError = null;

		if (file.type.startsWith('image/') || /\.(png|webp|jpe?g|jxl|avif|gif)$/i.test(file.name)) {
			previewUrl = URL.createObjectURL(file);
		}

		try {
			const res = await verifyFile(file);
			if (currentFile !== file) return;
			report = res;
			if (
				trustmarkCached &&
				(res.format === 'png' || res.format === 'webp' || res.format === 'jpeg' || res.format === 'avif')
			) {
				void runTrustmark(file);
			}
		} catch (e) {
			parseError = e instanceof Error ? e.message : String(e);
		}
	}

	async function runTrustmark(target?: File) {
		const file = target ?? currentFile;
		if (!file || trustmarkScanning) return;
		trustmarkScanning = true;
		trustmarkError = null;
		trustmarkProgress = { phase: 'downloading', loaded: 0, total: 47_400_467 };
		try {
			const res = await scanTrustMark(file, (p) => {
				if (currentFile === file) trustmarkProgress = p;
			});
			if (currentFile !== file) return;
			trustmarkResult = res;
			trustmarkCached = true;
		} catch (e) {
			if (currentFile === file) {
				trustmarkError = e instanceof Error ? e.message : String(e);
			}
		} finally {
			if (currentFile === file) {
				trustmarkScanning = false;
				trustmarkProgress = null;
			}
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		const file = e.dataTransfer?.files?.[0];
		if (file) void inspectFile(file);
	}

	function handleFileInput(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (file) void inspectFile(file);
		input.value = '';
	}

	function handlePaste(e: ClipboardEvent) {
		const item = Array.from(e.clipboardData?.items ?? []).find((it) => it.kind === 'file');
		const file = item?.getAsFile();
		if (file) void inspectFile(file);
	}

	async function copyText(key: string, text: string) {
		try {
			await navigator.clipboard.writeText(text);
			copiedKey = key;
			setTimeout(() => {
				if (copiedKey === key) copiedKey = null;
			}, 1600);
		} catch {
			// Clipboard API blocked
		}
	}

	function reset() {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		previewUrl = null;
		currentFile = null;
		report = null;
		parseError = null;
		trustmarkResult = null;
		trustmarkProgress = null;
		trustmarkError = null;
	}

	const progressPct = $derived.by(() => {
		if (!trustmarkProgress?.loaded || !trustmarkProgress?.total) return 0;
		return Math.min(100, Math.round((trustmarkProgress.loaded / trustmarkProgress.total) * 100));
	});
</script>

<svelte:window onpaste={handlePaste} />

<svelte:head>
	<title>Verify AI image · MooshieUI</title>
	<meta
		name="description"
		content="Inspect images and videos for IPTC AI disclosure, Stealth Alpha recipes, generation metadata, and TrustMark invisible watermarks locally in your browser."
	/>
</svelte:head>

<Nav variant="guide" />

<div class="wrap-narrow head" id="guide-content" tabindex="-1">
	<span class="eyebrow">
		<Icon name="shield-check" size={18} />
		Image provenance verifier
	</span>
	<h1>Verify AI images locally</h1>
	<p class="lede">
		Drop, browse, or paste (<span class="inline-code">Ctrl+V</span>) an image or video to inspect
		IPTC AI disclosure, hidden Stealth Alpha recipes, embedded generation metadata, and TrustMark
		invisible watermarks.
	</p>
	<div class="privacy-pill">
		<Icon name="lock" size={15} />
		<span>Runs 100% in your browser. Files never leave your device.</span>
	</div>
</div>

<section class="verify-section">
	<div class="wrap-narrow">
		<input
			bind:this={fileInput}
			type="file"
			accept="image/png,image/webp,image/jpeg,image/jxl,image/avif,image/gif,video/mp4,.png,.webp,.jpg,.jpeg,.jxl,.avif,.gif,.mp4"
			onchange={handleFileInput}
			hidden
		/>

		{#if !currentFile}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="dropzone"
				class:dragging={isDragging}
				role="button"
				tabindex="0"
				onclick={() => fileInput?.click()}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						fileInput?.click();
					}
				}}
				ondragenter={(e) => {
					e.preventDefault();
					isDragging = true;
				}}
				ondragover={(e) => {
					e.preventDefault();
					isDragging = true;
				}}
				ondragleave={() => {
					isDragging = false;
				}}
				ondrop={handleDrop}
			>
				<div class="drop-icon">
					<Icon name="image" size={28} />
				</div>
				<h2>Drop an image or video here</h2>
				<p>Supports PNG, WebP, JPEG, JXL, AVIF, GIF, and MP4 · or click to browse · or press Ctrl+V</p>
			</div>
		{:else}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="workspace"
				class:dragging={isDragging}
				ondragenter={(e) => {
					e.preventDefault();
					isDragging = true;
				}}
				ondragover={(e) => {
					e.preventDefault();
					isDragging = true;
				}}
				ondragleave={() => {
					isDragging = false;
				}}
				ondrop={handleDrop}
			>
				<div class="file-bar">
					<div class="file-meta">
						{#if previewUrl}
							<img class="thumb" src={previewUrl} alt="Inspected media preview" />
						{/if}
						<div>
							<div class="file-name">{currentFile.name}</div>
							<div class="file-sub">
								<span>{report ? report.format.toUpperCase() : '...'}</span>
								{#if report?.container.dimensions}
									<span>· {report.container.dimensions.width}×{report.container.dimensions.height}</span>
								{/if}
								<span>· {formatBytes(currentFile.size)}</span>
							</div>
						</div>
					</div>
					<div class="file-actions">
						<button class="btn btn-secondary btn-sm" onclick={() => fileInput?.click()}>
							Replace file
						</button>
						<button class="btn btn-secondary btn-sm" onclick={reset}>Clear</button>
					</div>
				</div>

				{#if parseError}
					<div class="verdict verdict-none">
						<Icon name="info" size={20} />
						<div>
							<h3>Could not inspect file</h3>
							<p>{parseError}</p>
						</div>
					</div>
				{:else if overallVerdict}
					<div class="verdict verdict-{overallVerdict.kind}">
						<Icon name={overallVerdict.kind === 'none' ? 'info' : 'shield-check'} size={22} />
						<div>
							<h3>{overallVerdict.title}</h3>
							<p>{overallVerdict.detail}</p>
						</div>
					</div>
				{/if}

				{#if report}
					<div class="layers-grid">
						<!-- Layer 1: IPTC / XMP / C2PA -->
						<div class="layer-card" class:hit={report.iptc.isAiDisclosed || report.iptc.c2paPresent}>
							<div class="layer-head">
								<span class="layer-title">1. IPTC / XMP &amp; C2PA</span>
								<span
									class="pill"
									class:pill-ok={report.iptc.isAiDisclosed || report.iptc.c2paPresent}
									class:pill-muted={!report.iptc.isAiDisclosed && !report.iptc.c2paPresent}
								>
									{report.iptc.isAiDisclosed
										? 'AI Disclosed'
										: report.iptc.c2paPresent
											? 'C2PA Found'
											: report.iptc.xmpFound
												? 'XMP (No AI tag)'
												: 'Not found'}
								</span>
							</div>
							<p class="layer-body">
								{#if report.iptc.sourceTypeLabel}
									<b>{report.iptc.sourceTypeLabel}</b>
									{#if report.iptc.creatorTool}
										<br />Tool: {report.iptc.creatorTool}
									{/if}
								{:else}
									No IPTC <code>trainedAlgorithmicMedia</code> tag in XMP.
								{/if}
								{#if report.iptc.c2paPresent}
									<br />C2PA JUMBF container detected.
								{/if}
							</p>
						</div>

						<!-- Layer 2: Container metadata -->
						<div
							class="layer-card"
							class:hit={report.parsed.carrier === 'chunks' || report.parsed.carrier === 'both'}
						>
							<div class="layer-head">
								<span class="layer-title">2. Container Metadata</span>
								<span
									class="pill"
									class:pill-ok={report.parsed.carrier === 'chunks' || report.parsed.carrier === 'both'}
									class:pill-muted={report.parsed.carrier !== 'chunks' && report.parsed.carrier !== 'both'}
								>
									{report.parsed.carrier === 'chunks' || report.parsed.carrier === 'both'
										? 'Found'
										: 'Absent'}
								</span>
							</div>
							<p class="layer-body">
								{#if report.parsed.carrier === 'chunks' || report.parsed.carrier === 'both'}
									Embedded parameters present in file chunks/boxes.
								{:else if report.parsed.recoveredFromStealthOnly}
									Visible file chunks were stripped, but Stealth Alpha kept the recipe.
								{:else}
									No PNG text chunks, EXIF UserComment, or JXL/MP4 recipe found.
								{/if}
							</p>
						</div>

						<!-- Layer 3: Stealth Alpha -->
						<div class="layer-card" class:hit={report.stealth.found}>
							<div class="layer-head">
								<span class="layer-title">3. Stealth Alpha</span>
								<span
									class="pill"
									class:pill-ok={report.stealth.found}
									class:pill-muted={!report.stealth.found}
								>
									{report.parsed.recoveredFromStealthOnly
										? 'Recovered after strip'
										: report.stealth.found
											? 'Found'
											: 'Not found'}
								</span>
							</div>
							<p class="layer-body">
								{#if report.parsed.recoveredFromStealthOnly}
									<b>Recovered full recipe from alpha LSBs</b> after standard metadata chunks were stripped.
								{:else if report.stealth.found}
									Hidden recipe present in alpha-channel LSBs.
								{:else}
									No <code>stealth_pngcomp</code> alpha payload (expected for JPEG, JXL, or re-compressed files).
								{/if}
							</p>
						</div>

						<!-- Layer 4: TrustMark -->
						<div
							class="layer-card"
							class:hit={trustmarkResult?.status === 'mooshieui' ||
								trustmarkResult?.status === 'third_party'}
						>
							<div class="layer-head">
								<span class="layer-title">4. TrustMark Watermark</span>
								{#if trustmarkResult}
									<span
										class="pill"
										class:pill-ok={trustmarkResult.status === 'mooshieui'}
										class:pill-warn={trustmarkResult.status === 'third_party'}
										class:pill-muted={trustmarkResult.status === 'none'}
									>
										{trustmarkResult.status === 'mooshieui'
											? 'MooshieUI Mark'
											: trustmarkResult.status === 'third_party'
												? 'Third-party Mark'
												: 'Not found'}
									</span>
								{:else}
									<span class="pill pill-muted">
										{trustmarkScanning ? 'Scanning' : 'On demand'}
									</span>
								{/if}
							</div>
							<div class="layer-body">
								{#if trustmarkResult?.status === 'mooshieui'}
									Verified MooshieUI TrustMark P payload (ID
									<code>{trustmarkResult.mooshieIdHex}</code>). Survives screenshots and JPEG
									re-encoding.
								{:else if trustmarkResult?.status === 'third_party'}
									Readable TrustMark ({trustmarkResult.version}) watermark without MooshieUI tag.
								{:else if trustmarkResult?.status === 'none'}
									No readable TrustMark P watermark in the centre square.
								{:else if trustmarkScanning}
									{#if trustmarkProgress?.phase === 'downloading'}
										Downloading Adobe TrustMark decoder (~45 MB, cached locally): {progressPct}%
										<div class="progress-track">
											<div class="progress-fill" style="width:{progressPct}%"></div>
										</div>
									{:else if trustmarkProgress?.phase === 'verifying'}
										Verifying SHA-256 checksum...
									{:else if trustmarkProgress?.phase === 'loading'}
										Initializing ONNX Runtime Web...
									{:else}
										Scanning pixels...
									{/if}
								{:else if canRunTrustmark}
									<p style="margin:0 0 10px">
										Checks pixels for screenshot-resistant watermarks (downloads ~45 MB Adobe
										<code>decoder_P.onnx</code> once, SHA-256 verified).
									</p>
									<button class="btn btn-primary btn-sm" onclick={() => runTrustmark()}>
										Scan TrustMark pixels
									</button>
								{:else}
									TrustMark pixel scan supports PNG, WebP, JPEG, and AVIF images.
								{/if}
								{#if trustmarkError}
									<p class="err-text">{trustmarkError}</p>
								{/if}
							</div>
						</div>
					</div>

					{#if report.parsed.recipe}
						{@const r = report.parsed.recipe}
						<div class="recipe-card">
							<div class="recipe-head">
								<div>
									<h3>Extracted generation recipe</h3>
									<span class="recipe-sub">
										Source: <b>{r.tool}</b>
										{#if r.mooshieVersion}· v{r.mooshieVersion}{/if}
										{#if r.mooshieSource}· {r.mooshieSource}{/if}
										{#if report.parsed.recoveredFromStealthOnly}
											· <span class="recovered-tag">Recovered from Stealth Alpha</span>
										{/if}
									</span>
								</div>
							</div>

							{#if r.positivePrompt}
								<div class="prompt-block">
									<div class="prompt-label">
										<span>Positive prompt</span>
										<button
											class="copy-btn"
											onclick={() => copyText('pos', r.positivePrompt ?? '')}
										>
											<Icon name={copiedKey === 'pos' ? 'check' : 'copy'} size={14} />
											{copiedKey === 'pos' ? 'Copied' : 'Copy'}
										</button>
									</div>
									<pre class="prompt-text">{r.positivePrompt}</pre>
								</div>
							{/if}

							{#if r.negativePrompt}
								<div class="prompt-block">
									<div class="prompt-label">
										<span>Negative prompt</span>
										<button
											class="copy-btn"
											onclick={() => copyText('neg', r.negativePrompt ?? '')}
										>
											<Icon name={copiedKey === 'neg' ? 'check' : 'copy'} size={14} />
											{copiedKey === 'neg' ? 'Copied' : 'Copy'}
										</button>
									</div>
									<pre class="prompt-text">{r.negativePrompt}</pre>
								</div>
							{/if}

							<div class="kv-grid">
								{#if r.model}
									<div class="kv"><span>Model</span><b>{r.model}</b></div>
								{/if}
								{#if r.seed}
									<div class="kv"><span>Seed</span><b>{r.seed}</b></div>
								{/if}
								{#if r.steps}
									<div class="kv"><span>Steps</span><b>{r.steps}</b></div>
								{/if}
								{#if r.cfg}
									<div class="kv"><span>CFG</span><b>{r.cfg}</b></div>
								{/if}
								{#if r.sampler}
									<div class="kv"><span>Sampler</span><b>{r.sampler}</b></div>
								{/if}
								{#if r.scheduler}
									<div class="kv"><span>Scheduler</span><b>{r.scheduler}</b></div>
								{/if}
								{#if r.size}
									<div class="kv"><span>Size</span><b>{r.size}</b></div>
								{/if}
							</div>

							{#if r.loras.length > 0}
								<div class="loras-row">
									<span class="loras-label">LoRAs</span>
									<div class="lora-chips">
										{#each r.loras as lora}
											<span class="lora-chip">
												{lora.name}
												{#if lora.modelWeight !== undefined}
													<em>{lora.modelWeight}</em>
												{/if}
											</span>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/if}

					{#if Object.keys(report.container.textChunks).length > 0 || report.iptc.rawXmpPackets.length > 0 || report.stealth.rawText}
						<details class="raw-details">
							<summary>Raw chunks, XMP, and stealth payload</summary>
							<div class="raw-body">
								{#if report.iptc.rawXmpPackets.length > 0}
									<h4>XMP Packets ({report.iptc.rawXmpPackets.length})</h4>
									{#each report.iptc.rawXmpPackets as xmp}
										<pre class="raw-pre">{xmp}</pre>
									{/each}
								{/if}
								{#if report.stealth.rawText}
									<h4>Stealth Alpha Payload</h4>
									<pre class="raw-pre">{report.stealth.rawText}</pre>
								{/if}
								{#each Object.entries(report.container.textChunks) as [k, v]}
									<h4>Chunk: {k}</h4>
									<pre class="raw-pre">{v}</pre>
								{/each}
							</div>
						</details>
					{/if}
				{/if}
			</div>
		{/if}
	</div>
</section>

<GuideFooter />

<style>
	.head {
		padding-top: 48px;
		padding-bottom: 24px;
	}
	.head h1 {
		margin: 16px 0 0;
		font-size: clamp(30px, 4.4vw, 44px);
		font-weight: var(--weight-bold);
		letter-spacing: -0.03em;
		color: var(--text-strong);
		text-wrap: balance;
	}
	.head .lede {
		margin: 16px 0 0;
		max-width: 680px;
		font-size: var(--text-lg);
		line-height: var(--leading-snug);
		color: var(--text-muted);
	}
	.inline-code {
		font-family: var(--font-mono);
		font-size: 0.9em;
		background: var(--surface-800);
		border: 1px solid var(--border-700);
		border-radius: var(--radius-sm);
		padding: 1px 6px;
		color: var(--accent-300);
	}
	.privacy-pill {
		margin-top: 18px;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 6px 12px;
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--success) 10%, var(--surface-900));
		border: 1px solid color-mix(in srgb, var(--success) 30%, transparent);
		color: var(--success-text);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
	}
	.verify-section {
		padding: 8px 0 56px;
	}
	.dropzone {
		border: 2px dashed var(--border-700);
		background: var(--surface-900);
		border-radius: var(--radius-xl);
		padding: 56px 24px;
		text-align: center;
		cursor: pointer;
		transition: border-color var(--dur-fast), background var(--dur-fast);
	}
	.dropzone:hover,
	.dropzone.dragging,
	.workspace.dragging {
		border-color: var(--accent-500);
		background: color-mix(in srgb, var(--accent-500) 5%, var(--surface-900));
	}
	.drop-icon {
		width: 56px;
		height: 56px;
		margin: 0 auto 14px;
		border-radius: var(--radius-lg);
		background: var(--surface-800);
		border: 1px solid var(--border-700);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--accent-400);
	}
	.dropzone h2 {
		margin: 0 0 8px;
		font-size: var(--text-xl);
		color: var(--text-strong);
	}
	.dropzone p {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--text-muted);
	}
	.workspace {
		display: flex;
		flex-direction: column;
		gap: 16px;
		border-radius: var(--radius-xl);
	}
	.file-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14px;
		flex-wrap: wrap;
		padding: 14px 16px;
		background: var(--surface-900);
		border: 1px solid var(--border-700);
		border-radius: var(--radius-lg);
	}
	.file-meta {
		display: flex;
		align-items: center;
		gap: 12px;
		min-width: 0;
	}
	.thumb {
		width: 52px;
		height: 52px;
		object-fit: cover;
		border-radius: var(--radius-md);
		border: 1px solid var(--border-700);
		flex-shrink: 0;
	}
	.file-name {
		font-weight: var(--weight-semibold);
		color: var(--text-strong);
		word-break: break-all;
	}
	.file-sub {
		font-size: var(--text-xs);
		color: var(--text-muted);
		display: flex;
		gap: 6px;
		margin-top: 2px;
	}
	.file-actions {
		display: flex;
		gap: 8px;
	}
	.btn-sm {
		min-height: 36px;
		padding: 7px 14px;
		font-size: var(--text-sm);
	}
	.verdict {
		display: flex;
		gap: 12px;
		align-items: flex-start;
		padding: 16px 18px;
		border-radius: var(--radius-lg);
		border: 1px solid var(--border-700);
	}
	.verdict h3 {
		margin: 0 0 4px;
		font-size: var(--text-lg);
		color: var(--text-strong);
	}
	.verdict p {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--text-muted);
		line-height: var(--leading-snug);
	}
	.verdict-ai {
		background: color-mix(in srgb, var(--success) 10%, var(--surface-900));
		border-color: color-mix(in srgb, var(--success) 35%, transparent);
	}
	.verdict-ai :global(svg) {
		color: var(--success);
		flex-shrink: 0;
		margin-top: 2px;
	}
	.verdict-third_party {
		background: color-mix(in srgb, var(--warning) 10%, var(--surface-900));
		border-color: color-mix(in srgb, var(--warning) 35%, transparent);
	}
	.verdict-third_party :global(svg) {
		color: var(--warning-text);
		flex-shrink: 0;
		margin-top: 2px;
	}
	.verdict-none {
		background: var(--surface-900);
	}
	.verdict-none :global(svg) {
		color: var(--text-muted);
		flex-shrink: 0;
		margin-top: 2px;
	}
	.layers-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 12px;
	}
	@media (max-width: 680px) {
		.layers-grid {
			grid-template-columns: 1fr;
		}
	}
	.layer-card {
		background: var(--surface-900);
		border: 1px solid var(--border-700);
		border-radius: var(--radius-lg);
		padding: 16px;
	}
	.layer-card.hit {
		border-color: color-mix(in srgb, var(--success) 35%, var(--border-700));
	}
	.layer-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin-bottom: 8px;
	}
	.layer-title {
		font-weight: var(--weight-semibold);
		color: var(--text-strong);
		font-size: var(--text-base);
	}
	.pill {
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		padding: 3px 9px;
		border-radius: 999px;
		white-space: nowrap;
	}
	.pill-ok {
		background: color-mix(in srgb, var(--success) 16%, transparent);
		color: var(--success-text);
	}
	.pill-warn {
		background: color-mix(in srgb, var(--warning) 16%, transparent);
		color: var(--warning-text);
	}
	.pill-muted {
		background: var(--surface-800);
		color: var(--text-muted);
	}
	.layer-body {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--text-muted);
		line-height: var(--leading-snug);
	}
	.layer-body code {
		font-family: var(--font-mono);
		font-size: 0.9em;
		color: var(--accent-300);
	}
	.progress-track {
		margin-top: 8px;
		height: 6px;
		border-radius: 999px;
		background: var(--surface-800);
		overflow: hidden;
	}
	.progress-fill {
		height: 100%;
		background: var(--accent-500);
		transition: width 120ms linear;
	}
	.err-text {
		margin: 8px 0 0;
		color: var(--danger-text);
		font-size: var(--text-xs);
	}
	.recipe-card {
		background: var(--surface-900);
		border: 1px solid var(--border-700);
		border-radius: var(--radius-lg);
		padding: 18px;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}
	.recipe-head h3 {
		margin: 0 0 4px;
		font-size: var(--text-lg);
		color: var(--text-strong);
	}
	.recipe-sub {
		font-size: var(--text-sm);
		color: var(--text-muted);
	}
	.recovered-tag {
		color: var(--success-text);
		font-weight: var(--weight-semibold);
	}
	.prompt-block {
		background: var(--surface-800);
		border: 1px solid var(--border-700);
		border-radius: var(--radius-md);
		padding: 12px;
	}
	.prompt-label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		margin-bottom: 6px;
	}
	.copy-btn {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		background: var(--surface-900);
		border: 1px solid var(--border-700);
		color: var(--text);
		border-radius: var(--radius-sm);
		padding: 3px 8px;
		font-size: var(--text-xs);
		cursor: pointer;
	}
	.copy-btn:hover {
		border-color: var(--accent-500);
		color: var(--accent-400);
	}
	.prompt-text {
		margin: 0;
		white-space: pre-wrap;
		word-break: break-word;
		font-family: var(--font-sans);
		font-size: var(--text-sm);
		color: var(--text);
		line-height: 1.55;
	}
	.kv-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 10px;
	}
	.kv {
		background: var(--surface-800);
		border: 1px solid var(--border-700);
		border-radius: var(--radius-md);
		padding: 9px 11px;
	}
	.kv span {
		display: block;
		font-size: var(--text-xs);
		color: var(--text-muted);
	}
	.kv b {
		display: block;
		margin-top: 2px;
		font-size: var(--text-sm);
		color: var(--text-strong);
		word-break: break-word;
	}
	.loras-row {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.loras-label {
		font-size: var(--text-xs);
		font-weight: var(--weight-semibold);
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.lora-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.lora-chip {
		font-size: var(--text-xs);
		padding: 4px 10px;
		border-radius: var(--radius-sm);
		background: var(--surface-800);
		border: 1px solid var(--border-700);
		color: var(--text);
	}
	.lora-chip em {
		font-style: normal;
		color: var(--accent-400);
		margin-left: 5px;
	}
	.raw-details {
		background: var(--surface-900);
		border: 1px solid var(--border-700);
		border-radius: var(--radius-lg);
		padding: 12px 16px;
	}
	.raw-details summary {
		cursor: pointer;
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		color: var(--text-muted);
	}
	.raw-body {
		margin-top: 12px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.raw-body h4 {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--accent-400);
		text-transform: uppercase;
	}
	.raw-pre {
		margin: 0;
		padding: 10px;
		border-radius: var(--radius-md);
		background: var(--surface-800);
		border: 1px solid var(--border-700);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		color: var(--text);
		white-space: pre-wrap;
		word-break: break-all;
		max-height: 260px;
		overflow: auto;
	}
</style>
