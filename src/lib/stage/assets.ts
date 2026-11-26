import { base } from '$app/paths';

/**
 * Optional CORS-enabled 5s H.264 camera-move MP4 URL (first frame = heroPlate,
 * last frame = section2Plate). Leave empty to use the built-in crossfade fallback;
 * dropping a valid MP4 URL here enables WebCodecs frame-cache scrubbing automatically.
 */
export const CAMERA_VIDEO_URL = '';

export const STAGE_ASSETS = {
	heroPlate: `${base}/assets/stage/hero-plate.webp`,
	section2Plate: `${base}/assets/stage/section2-plate.webp`,
	mounds: `${base}/assets/stage/mounds.webp`,
	cardsSheet: `${base}/assets/stage/cards-sheet.webp`,
	appScreenshot: `${base}/assets/app-screenshot.avif`,
	cameraVideoUrl: CAMERA_VIDEO_URL
} as const;
