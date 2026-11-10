# Music Generation

Open **Music**, then use **Create** to compose a song or **Library** to browse your saved tracks and playlists. Music uses YuE2 through ComfyUI and is available in the desktop, browser and mobile layouts.

## Models and setup

Connect to ComfyUI, open **Generation settings**, then **Models and setup**. Choose **Download INT8 · 4.0 GB** or **Download BF16 · 7.8 GB**, then **Refresh** and select the **YuE2 checkpoint**. Downloads follow the account's model-download permissions. The official Comfy-Org checkpoints belong in `ComfyUI/models/checkpoints` and include the generator, text encoder and audio VAE.

If native YuE2 support is missing, a managed installation offers **Update and restart ComfyUI**. It moves the install to the ComfyUI release MooshieUI pins (v0.43.0 as of v2.3.41). YuE2 is native from ComfyUI v0.36.0, and earlier releases do not contain the required music nodes. For a remote ComfyUI server, its operator must update and restart that server. Refresh Music after it reconnects.

The official BF16 baseline is an NVIDIA GPU with 24 GB VRAM. INT8 generation has been tested on an RTX 5070 with 12 GB, including a 47.6-second song; this does not establish support for every GPU or longer arrangement. Apple Silicon music generation remains unqualified. The checkpoint weights use **CC BY-NC 4.0**, a non-commercial license. See the [official models and license](https://huggingface.co/Comfy-Org/YuE2).

## Compose a song

1. Enter an optional **Song title**.
2. In **Style**, describe the genre, lyric language, mood, vocal delivery, instruments, groove, tempo and production sound.
3. In **Lyrics**, put each sung phrase on its own line. Separate sections with labels such as `[verse]`, `[chorus]` and `[bridge]`. **Add verse** and **Add chorus** insert section labels. Keep musical instructions in Style.
4. Set **Max length** from 1 to 360 seconds. This is a cutoff, so leave time for breaths, instrumental transitions and the ending. A song may finish before the limit, or be cut off when it reaches it.
5. Open **Generation settings** to choose the checkpoint, steps, seed and **Score planning**. **Melody and chords** plans the full score; **Melody only** plans melody; **Off** skips score planning. An optional **ABC score** can replace automatic planning. Clear the score to use Off.
6. Choose **Generate song**. The progress panel follows model loading, score writing, composition, rendering, decoding and FLAC saving. The first run can take longer while the model loads.

Completed songs retain their generation settings. When a score is available, **Use this score and settings** loads it back into the composer. Review or clear an existing score when changing lyrics, since the new words may not fit it.

## Generate lyrics or enhance a style

Set up a model or API provider in **Settings > Prompt Assistant** first. Music uses that same configuration, with writing and score-editing guidance adapted from the upstream yue2-music skill. When an external provider is selected, the supplied writing context is sent to it.

- **Enhance style**, above Style, expands the musical direction with compatible details about vocals, instruments, rhythm, tempo, production and arrangement. Current lyrics can guide this rewrite.
- **Generate lyrics**, above Lyrics, opens a popup asking **What should the lyrics be about?** Describe the topic, story, mood, perspective or language, then submit. The current style and Max length guide a compact draft.
- **Use existing lyrics as context** starts unchecked. Check it when you want the instructions to revise the current draft. Leave it unchecked for fresh lyrics; the existing lyrics are then excluded from that request. Earlier song lyrics are not added as writing history.
- **Undo style enhancement** and **Undo generated lyrics** restore the previous field. Cancelling or editing the draft while a request is running prevents a late result from overwriting your work.

The assistant uses a conservative text budget that includes repeated choruses and reserves time for instruments and breathing. This helps fit the requested length but cannot guarantee the timing of sung audio. Short clips need a brief hook rather than a full verse, chorus and bridge.

## Reference styles, imports and arrangement tools

The following tools are available in v2.3.6 and later.

- **Auto style from audio** analyzes an uploaded reference or the current cover source with the selected audio-capable provider. The panel names the destination before sending audio. Google sign-in, audio-input OpenRouter models and compatible Custom endpoints are supported. Choose an excerpt when only part of a recording should guide the style, then review the editable draft and uncertainties. Existing Styles text is preserved; with Styles empty, generation can analyze the selected reference and apply its style automatically.
- **Saved style profiles** stores style text and analysis estimates on this device for this account, without retaining the source audio. Adapt a saved style to the current duration and vocal/instrumental choice, preview it, then apply it. Up to 100 profiles can be saved.
- **Use a reference song** looks up a title and artist in the Apple Music catalog, with optional Wikipedia song context. Choose the matching recording and **Find style**, review the sources and estimates, then **Apply to Styles**. This uses catalog information and the assistant's knowledge; it does not listen to the recording.
- **Or paste a song link** accepts a single YouTube, YouTube Music, Spotify, Deezer, Dailymotion or Tidal song up to six minutes. Spotify, Deezer and Tidal links find a matching YouTube recording, so listen and check the version before transcription. **Import song** creates temporary audio, discarded when the source is replaced or the panel closes. Required tools are prepared automatically in the background; **Retry setup** retries a failed setup.
- **Arrangement planner · Prototype** suggests and reorders sections, fits their durations to Max length, and previews timing guidance for Styles. It does not rewrite an existing ABC score, and its timing is approximate.

Leave Lyrics empty for an instrumental song, score draft or cover. Audio analysis and writing requests use the configured provider; they do not transfer the original singer's voice. A/B comparisons offer optional loudness matching, per-account comparison notes and export of selected versions or the full project. Stale edit results cannot overwrite a draft changed during a request.

See the [music guide](https://github.com/Mooshieblob1/MooshieUI/blob/main/docs/MUSIC.md) for the detailed controls, privacy behavior and validation limits.

## Cover a song

Choose **Cover a song** in Create. Import an ABC score, try the included original melody, or expand **Transcribe a source recording**.

For native transcription, select **ComfyUI SheetSage2**. An administrator or moderator can use **Download SheetSage2 (1.39 GB)**, then refresh and select its **Audio encoder**. The file is `sheetsage2_bf16.safetensors` under the host's `models/audio_encoders`. A remote worker needs the encoder on that worker, not just on the desktop computer. The separate Python environment route is also available; see the [setup guide](https://github.com/Mooshieblob1/MooshieUI/blob/main/docs/research/yue2-integration.md#source-recording-transcription).

Import a source recording up to 64 MiB and six minutes, then transcribe it. Import sets **Maximum length** from the recording's duration, rounded up to a whole second. You can extend it afterward or choose **Use source length** to restore the default. If the browser cannot read the duration, enter it manually.

Transcription creates a separate draft. Review the melody, meter, section order and lyric fit before applying it to the score editor. A completed job does not overwrite the editor automatically.

- **Keep melody, adapt harmony** uses melody planning and removes chord symbols so the accompaniment can adapt to the requested style.
- **Keep melody and harmony** uses the supplied chords with full planning.
- Part selection can retain the vocal melody, instrumental melody, or both. Removing a part replaces its notes with rests; Undo or the transcription draft can restore it.

Enter the lyrics and target style, review the current score, check the review box, then choose **Generate cover**. The cover is a new performance. It does not clone the original singer, preserve its waveform or force words to their original sung timestamps. The source-length ceiling can cut off a performance that runs long.

Uploaded source recordings are not saved in library projects. Active native transcription jobs can be recovered after reload while the host retains their ownership and ComfyUI retains their history.

## Plan, preview and export a score

Use **Generate score first** to create ABC without rendering audio. Saved score drafts retain style, lyrics and seed. Review the draft, then choose **Use this score, style and lyrics** to apply them together. Undo restores the previous unchanged draft.

The score tools check the native YuE2 format, including bars, ties, supported chords, key and meter. The duration is a score estimate, not a guarantee of audio length.

- **Preview score** displays a piano roll and plays selected melodies with an optional basic chord accompaniment. This is a small synthesizer, not the generated singer.
- **Apply tempo** changes the quarter-note tempo while checking that notes and their timing in beats stay intact.
- **Export MIDI** saves selected melody parts and optional reference chords.
- **Export printable SVG** saves the displayed page, up to 32 bars. Longer scores have page controls; ABC and MIDI exports include the complete score.

## Edit a composition

Open **Edit composition** for the current draft or from a saved song. Choose a starting request for reharmonization, tempo, transposition, structure or lyric translation, then describe the change. Select which melodies, note timing, tempo, exact lyrics and section structure to preserve.

The configured Prompt Assistant proposes complete ABC, style and lyrics. MooshieUI checks the selected constraints before showing the proposal. Review it and choose **Apply to draft**, then generate a new version. Editing a saved recording keeps its original audio. Closing the dialog, changing accounts or editing the draft prevents a late reply from overwriting your work.

These checks compare the symbolic score and text. They do not establish that the rendered singing follows every note or that the new arrangement sounds better.

## Candidates and sampling

Choose **Candidates** of 1, 2, 4 or 8. Attempts run sequentially with different seeds and retain their individual settings and results. A failed attempt is recorded and the batch continues; Cancel stops the current job and pending attempts.

After a reload, the app observes submitted work rather than submitting it again. **Resume pending candidates** continues unsubmitted attempts. If the backend restarted or a submission response was lost, check ComfyUI's queue before starting another batch.

**Advanced sampling** exposes temperature, top-p, top-k, repetition penalty, the ABC token budget and semantic guidance. Reset restores defaults. Acoustic sampling CFG stays at 1. Automatic semantic guidance uses 1 with a score and 1.01 without.

Current adapter nodes can report score-planning and semantic truncation separately. Older results keep an unknown status rather than inferring completion from recording length.

## Versions and project export

Use **Create version from this song** to copy a recording's score, settings and actual seed into the editor. The new result retains a parent relationship. Each version stays a separate library entry.

Open **Versions, compare and export**, select A and B, and play either recording. Starting one pauses the other. Keep the playback position when switching or loop an excerpt. Identical seconds may refer to different passages after tempo or structure edits. Symbolic melody, timing and tempo differences are shown separately from playback.

Export selected recordings or the versions in A's project as a ZIP containing original FLAC, ABC, lyrics, style, request settings, actual seeds, lineage and available receipts. Exports are limited to eight versions and 256 MiB at once. They do not contain uploaded source recordings, model weights, semantic tokens or acoustic latents. The ZIP is an export bundle, not a project import format.

## Review recognized lyrics and approximate timing

**Review lyric timing** can compare a source and generated recording with xAI speech-to-text, then ask the configured assistant to explain the measured evidence. Configure xAI access to its speech-to-text endpoint first. The action discloses which recordings it sends; it also sends the resulting evidence and musical context to the configured assistant.

Use the same-lyrics-and-tempo option only when both recordings share them. Results include recognized lyric coverage, approximate line evidence and playable timestamps. Repeated lines are excluded from timing comparisons, and an overall estimate needs at least three distinct matched lines spanning five seconds.

Reports and transcripts are saved with the song on this device. Source audio is session-only: reattach the exact recording to restore its saved playback links after reload. **Explain saved results** retries the explanation without transcribing again.

Speech recognition can mishear singing or return no words. Such a result is inconclusive, not proof of missing singing. The assistant explains text evidence; it does not listen to or grade the music. This action does not correct sung timing. The experimental retiming and voice conversion approaches were dropped after unsuccessful listening tests.

## Library, titles and playlists

**Library** shows **All songs** and your playlists. **Search songs** matches titles and musical styles. **Sort songs** offers Song title or Date added for the full library, and Song title or Playlist order inside a playlist.

Use **Create playlist** above the playlist list. Each song's **Edit song** menu lets you change its title and tick the playlists it belongs to. A selected playlist offers **Rename playlist** and Delete. Deleting a playlist keeps its songs in the library.

**Play all** plays the displayed list in order; **Shuffle** starts a shuffled queue. Click a song to play it. The list shows its title, style and length, with Date added on wider screens.

Songs, audio, titles, playlists and manual lyric timings are stored on this device for the current account. Saved tracks survive a page reload and do not depend on ComfyUI retaining its job history. The library is not shared between devices or browser profiles and does not scan older files in ComfyUI's output folder. Clearing site/app data can remove it. If a save fails, the app shows an error and marks the song as not saved; retry or download the audio.

## Playback and export

The bottom player stays available while you browse other pages. It shares playback with the main player in Create: play/pause, seek position, volume and repeat stay together. Previous and next follow the current queue. **Open main player** returns to Create; **Stop and close player** ends playback and hides the bar. A song finishing generation does not interrupt a track already playing.

**Download FLAC** saves the original lossless recording, using the song title in the filename. Desktop opens a Save dialog; browser mode starts a download. ComfyUI also writes generated files under `ComfyUI/output/audio`. Download files for backups or sharing, since the local library is device-specific.

## Sync lyrics manually

In the main player, choose **Sync manually**. Play the song and press **Mark next line** when each sung line starts. **Set to now** marks a specific line, or enter a start time in seconds directly.

Start times must increase and fall within the song's length. Leave unmarked lines blank. Each marked line stays active until the next marked line or the end of the song. **Save** keeps the timings, **Cancel** discards the draft, and **Clear timings** clears the draft marks before saving.

After saving, **Follow** scrolls with the active lyric. Click a timed line to jump to it. Scrolling the lyric pane manually turns Follow off. Playback lyric synchronization is manual; it does not load a speech recognition model. The separate Review lyric timing action uses the hosted xAI service.

## See also

- [[Prompt Assistant]] for model and endpoint setup
- [[Models and the Model Hub]] for download permissions and model management
- [[Server, LAN and Multi-User]] for hosted accounts
- [[AI Assistants and MCP]] for generating songs from an AI assistant
