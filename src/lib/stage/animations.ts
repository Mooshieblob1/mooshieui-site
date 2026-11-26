export const QOUT = 'cubic-bezier(.25,1,.5,1)';
export const COUT = 'cubic-bezier(.33,1,.68,1)';
export const CIN = 'cubic-bezier(.32,0,.67,0)';

/**
 * Generates the exact 55-keyframe smooth-scroll glide-then-settle curve
 * (1800 ms total; steady linear glide for t < 0.47s, exponential settle with
 * tau = 0.232s afterwards, exact 0 on final keyframe).
 */
export function buildGlideSettleKeyframes(
	viewportH: number,
	reverse = false
): Keyframe[] {
	const frames: Keyframe[] = [];
	for (let k = 0; k < 55; k++) {
		const offset = k / 54;
		const t = offset * 1.8;
		const raw =
			k === 54
				? 0
				: t < 0.47
					? 1 - 1.506 * t
					: 0.293 * Math.exp(-(t - 0.47) / 0.232);
		const f = reverse ? 1 - raw : raw;
		frames.push({
			offset,
			transform: `translateY(${(f * viewportH).toFixed(2)}px)`,
			opacity: 1
		});
	}
	return frames;
}

/**
 * Commits in-flight animation styles cleanly before cancelling so chained
 * reversals start from the element's exact current visual pose.
 */
export function commitAndCancel(anims: Animation[]): void {
	for (const anim of anims) {
		try {
			anim.commitStyles();
		} catch {
			// Element may be unrendered or not participating in layout.
		}
		try {
			anim.cancel();
		} catch {
			// Ignore already-cancelled animations.
		}
	}
	anims.length = 0;
}
