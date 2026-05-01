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

## Impact

A passing command matters only when it exercises the risk. Without a clear done signal, teams either
over-test everything or accept shallow verification that misses the bug the change could
realistically introduce.

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
