# Review Automation Pass

This note records the bulk checklist pass over outstanding review items. It separates mechanical
fixes that were safe to apply from review work that still needs human judgment.

## Completed

- Regenerated the review queue and reports after folding `stable` into `reviewed`.
- Removed reviewed content from the review queue.
- Removed `search/index` from page review items because it has already been reviewed.
- Demoted `Unclear Cache Invalidation` to `seed`.
- Renamed `Concurrency assumptions hidden` to `Hidden Concurrency Assumptions`.
- Rewrote `Hidden Concurrency Assumptions` to the current problem-page shape.
- Replaced the Rust concurrency example with a Rust-specific lock-scope issue instead of an example
  the borrow checker would normally prevent.
- Added all launch-language examples for `Hidden Concurrency Assumptions`.
- Converted draft problem pages from the old `Impact` section to the current problem sections:
  `Description`, `Why It Matters`, and `Code Impact`.
- Title-cased draft problem titles.
- Removed language names from `Problem:` and `Better:` example headings where the language tab
  already provides that context.
- Made duplicate example headings unique enough for markdownlint.
- Wrapped and normalized markdown across content files.
- Adjusted review tooling so `seed` entries no longer emit missing-launch-language findings. Seeds
  still report missing structure and missing examples where useful.
- Added every launch-language example that the review queue identified as missing for draft
  problems, draft patterns, and draft concepts.
- Updated pattern frontmatter language lists when new language examples were added.
- Normalized the remaining seed problem entries to the current problem-page shape:
  `Description`, `Why It Matters`, `Code Impact`, `Signals`, `Diagnostic Questions`, `Approach`,
  and `Examples`.
- Added compact before/better example anchors to the remaining seed problem entries so the review
  queue no longer reports seed structure gaps.
- Normalized seed concept entries from the lighter `Mental model` / `Review heuristic` shape to
  the current concept shape with `Why it matters`, `How to apply it`, and `Examples`.
- Confirmed seed pattern entries already have the required pattern article sections:
  `Core Idea`, `Use When`, `Guidance`, `Tradeoffs`, `Agent Instruction`, `Examples`, and
  `References`.

## Validation

The following checks passed after the pass:

- `pnpm exec markdownlint-cli2 "src/content/**/*.md"`
- `node scripts/check-content.mjs`
- `node scripts/check-language-coverage.mjs`
- `pnpm review:prepare`
- `pnpm check`

Current queue state after regeneration:

- Total review items: 126
- P0: 6
- P1: 65
- P2: 55

## Remaining Generated Findings

No draft entries currently have missing launch-language findings.

No seed entries currently have generated structure findings.

## Manual Review Notes

- The generated `Description`, `Why It Matters`, and `Code Impact` sections for draft problems are
  mechanically shaped and lint-clean, but they still need an editorial pass. Treat them as scaffolds.
- The newly added language examples satisfy coverage and validation, but they still need editorial
  review. Several are intentionally compact and may need replacement with more topic-specific
  examples before launch.
- The seed problem examples are deliberately small anchors, not launch-ready examples. Use them to
  judge whether the page has a viable shape before deciding whether to expand or keep the item seed.
- The seed concept examples are also deliberately small. They make the page structure concrete, but
  they should not be treated as final language coverage or launch-quality examples.
- Concept example policy is still unresolved. The current pass added broad language examples, but
  the right launch shape may be fewer, stronger examples instead of full coverage.
- Review tooling now suppresses missing-language findings for seed entries. That keeps the queue
  focused on launch-path items while preserving structure findings for seed problems.
