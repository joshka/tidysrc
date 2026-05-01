# Bulk Review Notes

Generated during the global search and coverage pass.

## Completed Automatically

- Added global search at `/search/`.
- Changed the home page search form to search problems, patterns, concepts, and references.
- Added `Search` to the primary navigation.
- Added the search page to the review queue.
- Regenerated the review queue and content coverage report.
- Added `pnpm check:languages` to generate `docs/language-coverage-report.md`.

## Language Coverage

The full nine-language example target is not currently met.

- Required languages: C, C++, C#, Go, Java, JavaScript, Python, Rust, TypeScript.
- Current complete entries: 1/106.
- Problems: 1/34 complete.
- Patterns: 0/56 complete.
- Concepts: 0/16 complete.

This should remain manual/editorial work. Adding placeholder examples or mechanical translations
would make the catalog look more complete while weakening the advice.

Priority launch entries still missing language examples:

- `problems/premature-architecture`: C, C++, Go, JavaScript.
- `patterns/test-observable-behavior`: C, C++, JavaScript.
- `patterns/reader-locality`: C, C++, Go, JavaScript.
- `patterns/follow-existing-conventions`: C, C++, Go, JavaScript.
- `patterns/separate-structure-from-behavior`: C, C++, Go, JavaScript.
- `patterns/smallest-trustworthy-verification`: C, C++, Go, TypeScript.
- `patterns/guard-clause`: C, C++, TypeScript.

## Other Generated Review Findings

The review queue has 22 non-language generated findings:

- Thirteen draft problem pages have an `Impact` section that may be too short.
- Nine seed problem pages have no code examples.

These are worth fixing during manual review, but they should not block the current queue workflow.
The generated queue keeps surfacing the exact finding for each item.

## Search Follow-Up

Global search is intentionally simple:

- It searches static data rendered into the page.
- It supports text query and type filtering.
- It updates the URL for shareable search state.

Possible future improvements:

- Add highlighted match snippets.
- Add a type count summary.
- Rank exact title matches above body-text matches.
- Add keyboard focus behavior from the home search into the first result.
