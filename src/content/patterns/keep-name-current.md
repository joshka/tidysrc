---
title: >-
  Keep Names Current
summary: >-
  Rename code when responsibility changes so old names do not mislead future readers.
status: seed
tags:
  - "naming"
  - "readability"
  - "maintenance"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "A name describes what code used to do rather than what it does now."
concepts:
  - "reader-locality"
  - "cognitive-burden"
related:
  - "explaining-variable"
  - "normalize-symmetries"
---

## Core Idea

Names are local documentation. When responsibility changes and names do not, the reader has to
choose between trusting the word or reading the implementation.

Rename as part of the structure change that reveals the new responsibility. Keep the rename separate
from behavior when it would otherwise hide the real change.

The tradeoff is churn. Public names and widely used APIs need migration care.

## Use When

- A helper, type, or module has outgrown its name.
- A name uses old domain language after policy changed.
- Reviewers keep asking what a name means.

## Guidance

- Name the current responsibility.
- Avoid generic names when the concept is specific.
- Separate broad renames from behavior changes.

## Tradeoffs

- Public API renames can be compatibility breaks.
- Too-frequent renaming creates review noise.
- A new name should be better, not merely different.

## Agent Instruction

When code changes responsibility, update the name so future readers do not rely on stale vocabulary.

## Examples

### Rename after responsibility changes

The function now returns visible patterns, not only active records.

```ts title="src/example.ts"
const visiblePatterns = patterns.filter(canShowInCatalog);
```

## References

- None yet.
