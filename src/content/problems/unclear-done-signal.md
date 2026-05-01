---
title: >-
  Unclear Done Signal
status: seed
category: testing
topics:
  - verification
  - review
  - workflow
summary: >-
  The change is considered complete without evidence that the relevant behavior still works.
relatedPatterns:
  - smallest-trustworthy-verification
  - test-observable-behavior
relatedConcepts:
  - observable-behavior
  - agent-guidance
---

## Description

A passing command matters only when it exercises the risk. Without a clear done signal, teams either
over-test everything or accept shallow verification that misses the bug the change could
realistically introduce.

An unclear done signal appears when nobody can say which evidence proves the change is complete.
The final handoff may list commands, but the commands are not tied to the behavior or integration
point that could break.

## Why It Matters

Verification is part of the change contract. When the done signal is vague, reviewers cannot tell
whether the important risk was checked or whether the change merely passed an unrelated command.

## Code Impact

The code may ship with untested edge cases, or the review may stall under broad test demands. Both
outcomes come from the same missing link between the changed surface and the evidence that protects
it.

## Signals

- The final note says tests passed but does not say what behavior they protect.
- A broad suite is run because nobody knows the smallest relevant check.
- Manual inspection substitutes for an executable signal even when a targeted test is available.
- The verification step ignores the highest-risk branch or integration point.

## Diagnostic Questions

- What could this change realistically break?
- Which command, test, screenshot, or manual check would catch that break?
- Is a narrower check trustworthy enough, or does the change touch shared behavior?
- What evidence should a reviewer see in the final handoff?

## Approach

- Choose the smallest verification that genuinely exercises the risk.
- Broaden verification when the change touches shared behavior, contracts, rendering, or integration
  points.
- State what was checked and what was not checked in the handoff.
- When no trustworthy check exists, say so directly and prefer adding characterization before larger
  edits.

## Examples

### Problem: verification is detached from the changed behavior

The handoff says a broad command passed, but it does not identify the behavior that was at risk.

```text title="review/handoff.txt"
Tests passed: pnpm test
```

### Better: verification names the protected behavior

The handoff connects the command to the behavior a reviewer should care about.

```text title="review/handoff.txt"
Verified the report export keeps draft reports hidden:
pnpm test -- report-export
```
