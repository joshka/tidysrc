---
title: >-
  Make Parameters Explicit
summary: >-
  Pass the values a function depends on instead of reading hidden ambient state.
status: seed
tags:
  - "api-design"
  - "side-effects"
  - "testing"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "A function depends on global config, current user, clock, or process state without showing it."
concepts:
  - "side-effect-visibility"
  - "boundary-trust"
related:
  - "inject-time-and-randomness"
  - "centralize-configuration-policy"
---

## Core Idea

Explicit parameters show what a function needs to do its work. Hidden reads from globals, context
objects, or process state make tests and review depend on invisible setup.

Use this when the dependency is part of the decision being reviewed. Passing a narrow value is
usually clearer than passing a broad context bag.

The tradeoff is parameter noise. If the list grows, the code may need a named policy object or
boundary type rather than another argument.

## Use When

- A function reads ambient state that affects behavior.
- Tests need global setup to call a small function.
- A broad context object hides one or two real dependencies.

## Guidance

- Pass the narrow value the function needs.
- Group parameters only when the group has a real concept.
- Keep framework context at the edge when possible.

## Tradeoffs

- Too many parameters can hide a missing concept.
- Framework callbacks may provide context by convention.
- Security-sensitive state may need controlled access.

## Agent Instruction

Make behavior-affecting dependencies visible as parameters or narrow policy objects. Do not hide
them in globals or broad context bags.

## Examples

### Pass the policy instead of reading global config

The renderer depends on the configured preview mode, so the dependency is visible.

```ts title="src/example.ts"
export function renderPattern(pattern: Pattern, policy: RenderPolicy) {
  return policy.preview ? renderPreview(pattern) : renderFull(pattern);
}
```

## References

- [Tidy First?: Explicit Parameters](https://www.oreilly.com/library/view/tidy-first/9781098151232/ch10.html)
