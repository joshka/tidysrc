---
title: >-
  Observable Behavior
summary: >-
  Treat outputs, errors, persisted state, and visible side effects as the behavior tests should
  protect.
status: draft
tags:
  - "testing"
  - "legacy-code"
relatedPatterns:
  - "observable-behavior-tests"
  - "characterize-before-changing"
---
## Why it matters

Refactors should be able to change private shape without breaking tests. Behavior tests should fail
when callers would see a different result, error, event, or side effect.

In legacy code, characterization tests document what happens today. Follow-up changes can decide
which quirks to preserve or intentionally change.

## What counts

Observable surfaces include return values, errors, logs at boundaries, events, files, network calls,
persisted records, generated HTML, and public API behavior.

Private helper calls are observable only when the helper is itself a contract or integration seam.
