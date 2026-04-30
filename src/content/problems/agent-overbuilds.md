---
title: >-
  Agent overbuilds
status: draft
category: agent-workflow
topics:
  - agents
  - architecture
  - review
summary: >-
  Agent-written code adds broad architecture, generic frameworks, or non-local conventions for a
  narrow request.
relatedPatterns:
  - repo-local-instructions-win
  - avoid-premature-agent-architecture
  - smallest-trustworthy-verification
relatedConcepts:
  - agent-guidance
  - reader-locality
  - cognitive-burden
---

## Impact

The output may look polished while increasing maintenance cost. Extra files, providers, registries,
and abstractions make human changes slower and can conflict with the repo’s existing design
language.

## Signals

- A small feature introduces a new architecture vocabulary.
- The implementation is organized around generic patterns instead of local code shape.
- The agent ignores nearby examples or repo-specific instructions.
- Verification proves the happy path but not the actual risk introduced by the abstraction.

## Diagnostic Questions

- What is the smallest local change that satisfies the request?
- Which existing repo pattern should the implementation imitate?
- Does the abstraction reduce concepts for the reader or add them?
- What instruction would prevent the agent from widening scope again?

## Approach

- Read repo-local instructions and nearby code before applying generic guidance.
- Constrain the agent to the narrow behavior and explicit non-goals.
- Reject architecture whose main benefit is hypothetical future reuse.
- Ask for verification tied to the risk of the change, not only a broad test run.
