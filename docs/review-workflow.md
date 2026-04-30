# Fast Manual Review Workflow

This workflow is designed around one constraint: reviewer attention is the bottleneck. Expensive
analysis happens up front. The foreground loop should only show the next item and capture notes.

## Prepare the Queue

Run this before a review session:

```sh
pnpm review:prepare
```

The command reads content files, computes coverage, assigns priority, and writes generated review
state under `.review/`.

If `.review/current.json` already points at an item, `review:prepare` preserves that cursor so a
mid-session refresh does not restart the queue. Use this only when you want to start over:

```sh
pnpm review:prepare -- --reset
```

Generated files:

- `.review/queue.json`: ordered review items.
- `.review/current.json`: current cursor.
- `.review/briefs/*.md`: one review brief per item.
- `.review/manifest.json`: generation metadata and required languages.
- `docs/content-coverage-report.md`: durable coverage summary.
- `docs/correction-queue.md`: place to capture reviewer notes that need implementation.

The required launch example languages are:

```text
C / C++ / C# / Go / Java / JavaScript / Python / Rust / TypeScript
```

Missing language coverage is reported in briefs and in `docs/content-coverage-report.md`.

## Start the Browser Server

In another terminal, run:

```sh
pnpm dev
```

The generated queue assumes `http://localhost:4321` unless `TIDYSRC_REVIEW_BASE_URL` is set before
running `pnpm review:prepare`.

## Review Loop

Run:

```sh
pnpm review:next
```

This opens the next item in Firefox and prints the review packet:

- queue position
- priority
- source file
- URL
- brief path
- review focus
- generated findings

Use these options when needed:

```sh
pnpm review:next -- --again
pnpm review:next -- --previous
pnpm review:next -- --no-open
pnpm review:status
```

## Capturing Notes

The fastest loop is:

1. Run `pnpm review:next`.
2. Read the page in Firefox.
3. Tell Codex the notes.
4. Ask for `next`.

Codex should append notes to `docs/correction-queue.md` without applying corrections unless asked.
That keeps review moving while implementation can happen later or in a separate background pass.

Suggested note shape:

```md
## problems/hidden-main-path

Priority: P0
Reviewer notes:
- Title is good.
- Impact needs a sharper consequence.
- Python needs a dict-shaped example.
- Add TypeScript coverage.

Correction status: queued
```

## Correction Pass

After a review batch, ask Codex to apply queued corrections. Corrections should be worked in scoped
batches so background edits do not step on unrelated manual review.

Recommended batch boundaries:

- one content type at a time
- one page at a time when language examples are involved
- main thread owns final writes when multiple agents are used

## Priority Rules

- `P0`: page surfaces and reviewed/stable content.
- `P1`: draft content and core concepts that need editorial review.
- `P2`: seed content and future expansion.

Within each priority, the queue favors site surfaces, then problems, patterns, and concepts.
