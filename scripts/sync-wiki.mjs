// Copies the MooshieUI GitHub wiki into ./wiki, and the repository docs listed in
// src/lib/wiki/repo-docs.js into ./wiki/repo (plus the release tag list), so
// the site can render them.
// Run with `npm run wiki:sync`. The Sync wiki workflow runs it every 6 hours and
// commits any change, which redeploys the site.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync, copyFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { REPO, REPO_DOCS } from '../src/lib/wiki/repo-docs.js';

const WIKI_GIT = `https://github.com/${REPO}.wiki.git`;
const REPO_GIT = `https://github.com/${REPO}.git`;
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dest = join(root, 'wiki');
const repoDest = join(dest, 'repo');
const wikiTmp = mkdtempSync(join(tmpdir(), 'mooshieui-wiki-'));
const repoTmp = mkdtempSync(join(tmpdir(), 'mooshieui-repo-'));

const run = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();

try {
	// Wiki pages
	run('clone', '--quiet', '--depth', '1', WIKI_GIT, wikiTmp);
	const commit = run('-C', wikiTmp, 'rev-parse', 'HEAD');
	const date = run('-C', wikiTmp, 'log', '-1', '--format=%cI');
	const pages = readdirSync(wikiTmp).filter((f) => f.endsWith('.md'));
	if (!pages.includes('Home.md') || !pages.includes('_Sidebar.md')) {
		throw new Error('Wiki clone is missing Home.md or _Sidebar.md; leaving ./wiki untouched.');
	}

	// Repository docs, from main (only the listed files are downloaded)
	run('clone', '--quiet', '--depth', '1', '--filter=blob:none', '--no-checkout', REPO_GIT, repoTmp);
	run('-C', repoTmp, 'sparse-checkout', 'set', '--no-cone', ...REPO_DOCS.map((d) => `/${d.path}`));
	run('-C', repoTmp, 'checkout', '--quiet');
	const repoCommit = run('-C', repoTmp, 'rev-parse', 'HEAD');
	const repoDate = run('-C', repoTmp, 'log', '-1', '--format=%cI');
	// Release tags, so version numbers in the docs can link to their release notes
	const tags = run('ls-remote', '--tags', '--refs', REPO_GIT)
		.split('\n')
		.map((l) => l.split('refs/tags/')[1])
		.filter((t) => t && /^v\d+\.\d+\.\d+$/.test(t))
		.sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
	const missing = REPO_DOCS.filter((d) => !existsSync(join(repoTmp, d.path)));
	for (const d of missing) console.warn(`Repository doc not found, skipped: ${d.path}`);

	mkdirSync(repoDest, { recursive: true });
	for (const f of readdirSync(dest)) if (f.endsWith('.md')) rmSync(join(dest, f));
	for (const f of readdirSync(repoDest)) if (f.endsWith('.md')) rmSync(join(repoDest, f));
	for (const f of pages) copyFileSync(join(wikiTmp, f), join(dest, f));
	for (const d of REPO_DOCS) {
		if (!missing.includes(d)) copyFileSync(join(repoTmp, d.path), join(repoDest, `${d.slug}.md`));
	}

	const source = { repo: WIKI_GIT, commit, date, docsRepo: REPO_GIT, docsCommit: repoCommit, docsDate: repoDate };
	writeFileSync(join(dest, 'releases.json'), JSON.stringify(tags) + '\n');
	writeFileSync(join(dest, 'source.json'), JSON.stringify(source, null, '\t') + '\n');
	console.log(`Synced ${pages.length} wiki pages at ${commit.slice(0, 7)} (${date}).`);
	console.log(`Synced ${REPO_DOCS.length - missing.length} repository docs at ${repoCommit.slice(0, 7)} (${repoDate}), ${tags.length} release tags.`);
} finally {
	rmSync(wikiTmp, { recursive: true, force: true });
	rmSync(repoTmp, { recursive: true, force: true });
}
