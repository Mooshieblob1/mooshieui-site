import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const DEFAULTS = {
	theme: 'charcoal',
	accent: 'honey',
	background: 'flat',
	corners: 'soft',
	font: 'grotesk'
};

const STORAGE_KEY = 'mooshieui-tweaks';

function load() {
	if (!browser) return { ...DEFAULTS };
	try {
		const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
		return { ...DEFAULTS, ...saved };
	} catch {
		return { ...DEFAULTS };
	}
}

export const tweaks = writable(load());

export function setTweak(key, value) {
	tweaks.update((t) => {
		const next = { ...t, [key]: value };
		if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
		return next;
	});
}

export function bodyClass(t) {
	return [
		'theme-' + t.theme,
		'accent-' + t.accent,
		'bg-' + t.background,
		'round-' + t.corners,
		'font-' + t.font
	].join(' ');
}
