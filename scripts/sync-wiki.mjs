// Copies the MooshieUI GitHub wiki into ./wiki so the site can render it.
// Run with `npm run wiki:sync`. The Sync wiki workflow runs it daily and
// commits any change, which redeploys the site.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync, copyFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const WIKI_GIT = 'https://github.com/Mooshieblob1/MooshieUI.wiki.git';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dest = join(root, 'wiki');
const tmp = mkdtempSync(join(tmpdir(), 'mooshieui-wiki-'));

try {
	execFileSync('git', ['clone', '--quiet', '--depth', '1', WIKI_GIT, tmp], { stdio: 'inherit' });
	const git = (...args) => execFileSync('git', ['-C', tmp, ...args], { encoding: 'utf8' }).trim();
	const commit = git('rev-parse', 'HEAD');
	const date = git('log', '-1', '--format=%cI');
	const pages = readdirSync(tmp).filter((f) => f.endsWith('.md'));
	if (!pages.includes('Home.md') || !pages.includes('_Sidebar.md')) {
		throw new Error('Wiki clone is missing Home.md or _Sidebar.md; leaving ./wiki untouched.');
	}

	mkdirSync(dest, { recursive: true });
	for (const f of readdirSync(dest)) if (f.endsWith('.md')) rmSync(join(dest, f));
	for (const f of pages) copyFileSync(join(tmp, f), join(dest, f));
	writeFileSync(join(dest, 'source.json'), JSON.stringify({ repo: WIKI_GIT, commit, date }, null, '\t') + '\n');
	console.log(`Synced ${pages.length} wiki pages at ${commit.slice(0, 7)} (${date}).`);
} finally {
	rmSync(tmp, { recursive: true, force: true });
}
