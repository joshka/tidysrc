---
title: >-
  Cross-cutting policy scattered
status: draft
category: architecture
topics:
  - policy
  - change-radius
  - duplication
summary: >-
  Authorization, retries, rate limits, logging, validation, or formatting rules are copied across
  unrelated paths.
relatedPatterns:
  - cap-change-radius
  - reader-locality
  - avoid-premature-agent-architecture
relatedConcepts:
  - change-radius
  - reader-locality
  - observable-behavior
---

## Impact

Each copy can drift. Reviewers must inspect every path to know whether the policy still applies
consistently, and a small policy change turns into a wide edit.

## Signals

- Several handlers repeat the same permission check or retry condition.
- A policy change requires edits in many feature files.
- Tests cover the policy in one path but not the copies.
- A helper exists but has a weak name or lives far from the boundary that owns the policy.

## Diagnostic Questions

- Which boundary should own this policy?
- Is the repeated code a real shared concept or just similar mechanics?
- What context must remain visible at each call site?
- Would centralizing the policy reduce future change radius without hiding behavior?

## Approach

- Move real policies to the boundary that owns the decision.
- Keep call sites explicit about the domain action being protected.
- Avoid generic policy frameworks when one or two local helpers would explain the rule.
- Test the policy through observable behavior on representative paths.
