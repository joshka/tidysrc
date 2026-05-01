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
- P1: 74
- P2: 46

## Remaining Generated Findings

No draft entries currently have missing launch-language findings.

### Seed Problems Missing Structure

These seed problems still use an early shape and have no examples. They should stay seed until
their title, scope, and examples are worth reviewing.

- `problems/context-drift`
- `problems/digging-past-evidence`
- `problems/guess-driven-debugging`
- `problems/repeated-validation-rules`
- `problems/review-comment-lacks-pattern-name`
- `problems/solution-before-requirements`
- `problems/spec-bent-to-fit-implementation`
- `problems/tooling-contract-implicit`
- `problems/unclear-done-signal`

## Manual Review Notes

- The generated `Description`, `Why It Matters`, and `Code Impact` sections for draft problems are
  mechanically shaped and lint-clean, but they still need an editorial pass. Treat them as scaffolds.
- The newly added language examples satisfy coverage and validation, but they still need editorial
  review. Several are intentionally compact and may need replacement with more topic-specific
  examples before launch.
- Concept example policy is still unresolved. The current pass added broad language examples, but
  the right launch shape may be fewer, stronger examples instead of full coverage.
- Review tooling now suppresses missing-language findings for seed entries. That keeps the queue
  focused on launch-path items while preserving structure findings for seed problems.
