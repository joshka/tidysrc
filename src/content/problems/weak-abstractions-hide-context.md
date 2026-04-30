---
title: >-
  Weak abstractions hide context
status: draft
category: architecture
topics:
  - abstraction
  - reader-locality
  - agents
summary: >-
  A helper, provider, strategy, registry, or module boundary makes readers jump without carrying
  enough meaning.
relatedPatterns:
  - reader-locality
  - avoid-premature-agent-architecture
relatedConcepts:
  - reader-locality
  - agent-guidance
  - cognitive-burden
---

## Impact

The code looks more organized but is harder to understand locally. Each extra name and file adds a
live fact the reader must remember, and agents often multiply these abstractions when repo-local
guidance is absent.

## Signals

- A helper is used once and only makes sense beside its caller.
- The name describes mechanics, not a durable domain concept.
- A review requires opening several files to understand one small behavior.
- A proposed extraction reduces line count while increasing navigation and indirection.

## Diagnostic Questions

- Can the new name be understood from its signature and local module context?
- Does the abstraction remove a concept or add one?
- Is there a real second caller, or only a speculative one?
- Would keeping the code nearby make the workflow easier to verify?

## Approach

- Keep weak helpers near the caller that gives them meaning.
- Promote code only when the extracted concept has a clear contract beyond mechanical reuse.
- Prefer a small amount of repetition over a premature shared layer when the repetition is easier to
  read and test.
- For agent work, state the boundary explicitly: do not add framework-shaped architecture unless the
  current change needs it.
