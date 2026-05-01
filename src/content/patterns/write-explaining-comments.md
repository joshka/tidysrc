---
title: >-
  Write Explaining Comments
summary: >-
  Use comments for non-obvious intent, constraints, or history that the code cannot express
  locally.
status: seed
tags:
  - "comments"
  - "readability"
  - "review"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "A constraint matters to the change, but the code alone cannot explain why it exists."
concepts:
  - "cognitive-burden"
  - "boundary-trust"
related:
  - "delete-redundant-comments"
  - "explaining-variable"
---

## Core Idea

A useful comment explains why the code takes a surprising shape. It can record a compatibility
constraint, domain rule, benchmark result, or external contract that is not visible locally.

Prefer better names and structure first. Add a comment when the missing fact lives outside the code
or would require a worse design to encode directly.

The tradeoff is decay. Comments need the same review as code when the constraint changes.

## Use When

- The code is shaped by a compatibility rule, incident, benchmark, or external contract.
- A reader would reasonably simplify the code and break something.
- A comment explains why, not what.

## Guidance

- Write the constraint the next reader needs.
- Keep comments close to the code they explain.
- Update or delete comments when the constraint changes.

## Tradeoffs

- Comments can become stale.
- A name or type may express the idea better.
- Do not use comments to excuse confusing code that can be simplified.

## Agent Instruction

Add comments for non-obvious constraints and intent. Prefer names and structure for facts the code
can express directly.

## Examples

### Explain the compatibility constraint

The comment explains why a strange empty string behavior is preserved.

```ts title="src/example.ts"
// Legacy clients treat an empty summary as explicitly blank, not missing.
const summary = input.summary ?? '';
```

## References

- [Tidy First?: Explaining Comments](https://www.oreilly.com/library/view/tidy-first/9781098151232/ch14.html)
