# Contributing

MooshieUI welcomes contributions. The repository's [CONTRIBUTING.md](https://github.com/Mooshieblob1/MooshieUI/blob/main/.github/CONTRIBUTING.md) is the
authoritative guide; this page summarizes it.

## Setup

Install Node.js 22.12+ or 24+, stable Rust and your platform's Tauri v2 prerequisites.
Run `npm install`, then `npm run tauri dev` for full desktop development or
`npm run dev` for the frontend alone.

## Before opening a PR

Run `npm run check`. It builds the frontend, checks i18n parity, checks that
every full-screen overlay is portaled, and runs svelte-check. Do not add new type errors or a11y warnings in the files you change.

Rust changes need both the default desktop build and the headless server check
(`--no-default-features --features server`), plus relevant tests, formatting and
linting. A Tauri reference in shared code must be gated for the desktop feature.
Documentation-only changes need behavior and link checks, not a native build.

## The three core guidelines

- i18n: every user-facing string uses `locale.t('key')`, and every key plus its
  `{placeholder}` names exist in all files under `src/lib/locales/`. CI blocks on
  parity gaps.
- a11y: interactive elements are keyboard- and screen-reader-accessible. CI posts
  a non-blocking a11y summary for the files you change.
- Scope: changes stay within the project charter. See [[Project Scope]].

Full detail, including the "what CI checks and how to fix each" table, is in
[CONTRIBUTING.md](https://github.com/Mooshieblob1/MooshieUI/blob/main/.github/CONTRIBUTING.md) in the repository.
