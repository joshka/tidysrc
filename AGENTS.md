# Agent Guidance

Use this file as the repo-local map. Keep the reviewed shared rule pack in
`docs/development/` so every rule is available without making this file a long manual.

## Local Rules

- Follow local code, tests, docs, and existing conventions before general preferences.
- Preserve unowned human or agent work.
- Keep changes small, atomic, and reviewable.
- Report validation evidence in handoffs instead of confidence language.
- This repo is an Astro site using pnpm and mise. Use the versions in `.mise.toml` and the
  package manager declared in `package.json`.
- The main content areas are `/patterns/`, `/concepts/`, `/agents/`, `/configs/`, `/references/`,
  and `/llms.txt`.
- Use `pnpm dev` for local development, `pnpm check` for Astro diagnostics, `pnpm build` for the
  full build, and `pnpm check:site` for content checks plus build and site checks.
- Use `pnpm check:languages` when editing language coverage data or language-specific content.
- Use `markdownlint-cli2 "**/*.md"` for Markdown validation. This repo configures Markdown line
  length at 100 columns and allows long tables.
- Prefer jujutsu (`jj`) for source-control workflows. This checkout has a `.jj/` directory, so use
  `jj --no-pager` commands for local history, working-copy, bookmark, and status operations.
- Start separable work in a fresh working copy with `jj new`, and set a clear description early
  with `jj desc --no-pager --message "..."`.
- Use Git only for transport-level operations that jj does not cover in the current workflow, and
  keep jj as the source of truth for publication boundaries.

## Shared Development Preferences

This repo carries a local copy of shared development guidance in `docs/development/`. Use this
repo's local rules first. When local guidance is silent, use the shared guidance as a fallback.

Entry points:

- `docs/development/snippets/agents/rules.md`: compact reviewed rule pack.
- `docs/development/rules/README.md`: rule domains for targeted loading.
- `docs/development/bootstrap-downstream.md`: how to refresh and merge the guidance.
- [Software Practices](https://www.joshka.net/practice/): rendered reference with deeper guide,
  rule, pattern, principle, mechanism, and tag context.

If a shared rule causes friction or seems wrong for most Rust or agent work, capture that feedback
for the upstream development-preferences/practice repo instead of only patching around it locally.

## Validation

Run the smallest useful validation for the change. For documentation-only changes, run Markdown
lint when available.

Common checks:

```bash
pnpm check
pnpm build
pnpm check:site
pnpm check:languages
markdownlint-cli2 "**/*.md"
```

## Deeper Guidance

- `docs/development/README.md`: local map for development guidance.
- `docs/development/snippets/agents/rules.md`: generated single-file reviewed rule pack.
- `docs/development/rules/README.md`: generated index for reviewed rule domains.
- `docs/development/bootstrap-downstream.md`: instructions for refreshing and merging this guidance
  into a downstream repo.
