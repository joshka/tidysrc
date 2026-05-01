---
title: >-
  Digging Past Evidence
status: seed
category: change-risk
topics:
  - "debugging"
  - "review"
  - "agent-workflow"
summary: >-
  More patches are added after the evidence already shows the current explanation is wrong.
relatedPatterns:
  - "stop-and-reframe"
  - "debug-from-evidence"
  - "smallest-trustworthy-verification"
relatedConcepts:
  - "cognitive-burden"
  - "review-batch-size"
---

## Description

The diff grows into a pile of guesses. Even if it eventually passes, reviewers cannot tell which
change mattered or whether the underlying model is now correct.

Digging past evidence happens when a failure disproves the current explanation, but the work keeps
adding patches as if the explanation is still viable. The code becomes a record of persistence
rather than understanding.

## Why It Matters

Every extra guess widens the review surface and weakens confidence in the final fix. A passing
check does not mean much if nobody can explain which assumption was wrong.

## Code Impact

The final diff often includes unrelated cleanup, defensive branches, broadened tests, and workaround
state. Those additions make future debugging harder because the real cause is buried under edits
that were only attempts.

## Signals

- Each fix produces a different failure.
- The patch changes areas not proven to affect the failure.
- The original requirement disappears behind cleanup and workaround code.

## Diagnostic Questions

- What evidence contradicts the current approach?
- What is the smallest check that separates the competing explanations?
- Should this stop for a new plan or maintainer input?

## Approach

- Stop after repeated contradictory failures.
- Summarize evidence and current assumptions.
- Reframe the plan before editing another area.

## Examples

### Problem: each failure adds another workaround

The parser keeps accepting more shapes after each test failure, but none of the edits names the
format that should be supported.

```typescript title="src/import/parse-row.ts"
export function parseRow(row: Record<string, string>): ImportRow {
  const id = row.id || row.ID || row.user_id || row.userId;
  const email = row.email || row.Email || row.mail || row.contact;
  return { id, email };
}
```

### Better: stop and name the supported input

The parser handles the documented shape and leaves unknown formats as evidence for a new decision.

```typescript title="src/import/parse-row.ts"
export function parseRow(row: Record<string, string>): ImportRow {
  if (!row.id || !row.email) {
    throw new ImportFormatError("expected id and email columns");
  }

  return { id: row.id, email: row.email };
}
```
