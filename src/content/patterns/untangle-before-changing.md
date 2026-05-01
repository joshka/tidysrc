---
title: >-
  Untangle Before Changing
summary: >-
  Separate mixed concerns enough that the intended behavior change has a clear place to land.
status: seed
tags:
  - "workflow"
  - "refactoring"
  - "change-risk"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "A desired change is hard because unrelated concerns are braided together."
concepts:
  - "structure-vs-behavior"
  - "change-radius"
related:
  - "separate-structure-from-behavior"
  - "cap-change-radius"
---

## Core Idea

Untangling is preparatory structure work. It separates concerns just enough that the real behavior
change becomes local and reviewable.

Use this when a feature or fix would otherwise touch validation, formatting, persistence, side
effects, and domain policy all at once.

The tradeoff is speculative cleanup. Untangle only the knot that blocks the current change.

## Use When

- The desired behavior change has no clear owner.
- Several concerns must be edited together to change one rule.
- Tests cannot isolate the behavior because code is tangled.

## Guidance

- Identify the concern that should own the rule.
- Move only enough structure to create a landing place.
- Verify the untangling before changing behavior.

## Tradeoffs

- Broad cleanup can become its own risky project.
- Some tangles reveal missing domain concepts.
- Untangling may require characterization first.

## Agent Instruction

Before making a risky behavior change in tangled code, create the smallest structure that gives the
change a clear owner.

## Examples

### Move formatting away before changing policy

The policy can change after rendering is no longer mixed with the decision.

```ts title="src/example.ts"
const canPublish = publishPolicy(pattern);
const view = renderPublishState(canPublish);
```

## References

- [Tidy First?: Getting Untangled](https://www.oreilly.com/library/view/tidy-first/9781098151232/ch20.html)
