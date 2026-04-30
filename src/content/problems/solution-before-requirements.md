---
title: >-
  Solution Before Requirements
status: seed
category: agent-workflow
topics:
  - "requirements"
  - "architecture"
  - "review"
summary: >-
  Implementation begins before constraints, non-goals, and success checks are clear.
relatedPatterns:
  - "state-requirements-before-solutions"
  - "repo-local-instructions-win"
  - "avoid-premature-agent-architecture"
relatedConcepts:
  - "boundary-trust"
  - "cognitive-burden"
---

## Impact

The implementation silently chooses defaults about architecture, compatibility, and verification.
Those choices may be more expensive to unwind than the original change.

## Signals

- A generic architecture appears before the local requirement is clear.
- The patch optimizes for a guessed future use case.
- Reviewers ask what problem the solution is solving.

## Diagnostic Questions

- What must remain compatible?
- What is explicitly out of scope?
- What check proves the requested behavior, not just the chosen solution?

## Approach

- Write constraints and non-goals first.
- Prefer the smallest local shape that satisfies the stated requirement.
- Delay architecture choices until repeated pressure appears.
