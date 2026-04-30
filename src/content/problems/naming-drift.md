---
title: >-
  Naming drift
status: draft
category: readability
topics:
  - naming
  - domain-language
  - review
summary: >-
  Names keep their old words after behavior, ownership, or domain meaning changes.
relatedPatterns:
  - explaining-variable
  - separate-structure-from-behavior
  - reader-locality
relatedConcepts:
  - reader-locality
  - structure-vs-behavior
  - cognitive-burden
---

## Impact

Stale names mislead readers and agents. The code compiles, but every review requires reconciling
what the name claims with what the implementation actually does.

## Signals

- A helper name describes an old implementation instead of its current domain role.
- Two names refer to the same concept with slightly different wording.
- A variable called active, valid, enabled, or ready carries a narrower rule than its name suggests.
- Tests repeat stale vocabulary and hide the new behavior.

## Diagnostic Questions

- What domain fact should this name communicate now?
- Does the name describe mechanics or meaning?
- Are there nearby names for the same concept?
- Would renaming be a structure-only change or part of a behavior change?

## Approach

- Rename to the current domain fact before changing behavior when the rename is behavior-preserving.
- Use explaining variables for local decisions instead of generic condition names.
- Keep terminology consistent across tests, examples, and user-facing errors when they describe the
  same contract.
- Avoid broad vocabulary rewrites while a behavior change is in progress.
