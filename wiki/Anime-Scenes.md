# Anime Scenes

In v2.3.20 and later, the **Scenes** page turns a character into a short voiced, lip-synced anime clip. It is optional and runs on cloud providers with your own API keys: ElevenLabs for the voice, fal.ai (Seedance 2.5) for the video, and optionally NovelAI for shot keyframes. Each provider bills your own account. Nothing on this page runs on ComfyUI.

Every step that costs money opens a confirmation first. It lists what will be billed, what is already cached and free, your remaining balance where the provider reports one, and the date the price was checked. Prices are estimates; your provider balance is authoritative.

## Keys

Add keys in Settings under **Cloud voice and video**. There is one field per provider (ElevenLabs and fal.ai). Builds up to v2.3.41 also show a Segmind field, but nothing uses that key. A saved key is never shown again; **Clear** removes it. On a server, each account uses only its own keys, which are stored encrypted, and the owner's keys are never sent to any client. See [[Settings and Accessibility]].

You need an ElevenLabs key to start. Video needs a fal.ai key, and keyframes need a NovelAI key.

## Character

Give the character a name. **This character is a minor** turns on stricter safety rules: if a provider refuses something for this character, that refusal is final and is not retried, and the flag cannot be turned off afterwards to get around it. **New scene** clears the page.

Provider refusals are always shown as they are. MooshieUI never rewords a prompt to get past a provider's safety filter.

## Voice

Pick one of your ElevenLabs voices, or **Design a new voice**: describe it with the brief fields (language and accent, gender, age, voice quality and so on), and ElevenLabs returns three previews to choose from. The voice is saved to your ElevenLabs account. The panel shows your remaining credits and voice slots, and **Delete** removes a voice from your ElevenLabs account permanently.

Then write the scene's lines and record them as takes. Takes are cached per account, so the same take is never paid for twice; a fresh take of a line is only made when you ask for one. Pick the take you want for each line.

## Keyframes (optional)

With a NovelAI key, each shot can get a NovelAI V4.5 keyframe made from the character image with Precise Reference. It keeps the character on model and the shot framed as described, lands in the gallery, and becomes that shot's reference image.

Enter the **Character tags** (English, `1girl` first) or use **Copy from the character image**, then **Keyframe tags** per shot, and press **Make keyframe**. Precise Reference costs 5 Anlas per image even on Opus, and the button shows the estimate. For a minor, body-shape and revealing tags are removed and `nsfw` always goes in Undesired Content.

## Video

- **Reference images**: **Add from gallery**, then mark what each image controls: the **Character**, the **Location**, or one shot's framing. Images are sent without their embedded prompts and settings.
- **Shots**: shots play in order. Each can speak one line (or be a silent shot) with a pause before it, and its timing comes from the length of the chosen take. Add the framing and action for each shot.
- **Scene details**: traits that must stay the same, starting and ending state, ambient sound, spoken language, silence after the last line, and **One continuous take, no cuts**.
- **Resolution** (480p, 720p, 1080p), **Aspect ratio** (16:9, 9:16, 4:3, 3:4, 1:1, 21:9) and **Seed**. A clip can be up to 30 seconds.
- **Draft (480p, cheaper)** renders at 480p and is billed as 480p. A draft can be completed at 1080p later (see below).
- **Mouth map**: **Measure mouth timing** measures each take with ElevenLabs alignment so the prompt says exactly when the mouth moves. It costs a little ElevenLabs speech-to-text time, once per take.

**Preview prompt and price** builds the prompt and estimate for free. The prompt can be edited before rendering; **Reset to the built prompt** undoes your edits. **Generate video** opens the confirmation and starts the render. Progress shows in the queue, and the clip lands in the gallery with a poster and the full scene recipe in its metadata, even in manual save mode. If you close the app mid-render, reopening the Scenes page picks the job back up instead of paying for it again.

Cancelling stops MooshieUI from waiting, but a render fal.ai has already started usually finishes and is billed anyway.

## Finished scenes

Clips made on the page are listed under **Finished scenes**. They are already in the gallery; this list holds what you can still do with them. A clip deleted or renamed in the gallery drops out of the list.

- **Complete at 1080p** renders a draft again at 1080p and is billed as a new 1080p clip. fal.ai keeps drafts for seven days, and it only works with the fal.ai key that made the draft.
- **Use my exact voice** makes a free copy with your recorded voice track in place of the model's speech. The model does not follow the track's timing exactly, so the lips may drift.
- **Remove from list** forgets the entry without touching the gallery.
