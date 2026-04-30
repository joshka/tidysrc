---
title: >-
  State Requirements Before Solutions
summary: >-
  Write the constraints and success conditions before choosing an implementation shape.
status: seed
tags:
  - "workflow"
  - "agent-guidance"
  - "review"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "A solution appears before the requirement is clear."
concepts:
  - "boundary-trust"
  - "cognitive-burden"
related:
  - "repo-local-instructions-win"
  - "make-parameters-explicit"
  - "smallest-trustworthy-verification"
---

## Core Idea

A
solution
fills
missing
requirements
with
defaults.
That
can
look
productive
while
silently
choosing
architecture,
compatibility,
and
verification
constraints.

Humans
do
this
when
they
jump
to
a
favorite
abstraction.
Agents
do
it
when
prompts
omit
non-goals,
local
conventions,
or
success
checks.

The
tradeoff
is
overhead.
Small
obvious
fixes
do
not
need
a
ceremony,
but
ambiguous
work
needs
explicit
constraints
before
implementation.

## Use When

- The requested change has unclear success criteria.
- Several implementation shapes would satisfy different unstated goals.
- The work involves public contracts, architecture, or agent delegation.

## Guidance

- State requirements, non-goals, and verification before coding.
- Prefer constraints over prescribing implementation unless the implementation is the point.
- Record assumptions when moving without more input.

## Tradeoffs

- Over-specification can block local judgment.
- Some exploratory work discovers requirements.
- A short constraint list is usually enough.

## Agent Instruction

Before implementing ambiguous work, state the requirements, non-goals, and verification target. Do
not let the solution invent the spec.

## Examples

### Write constraints before choosing architecture

The constraints keep the change local and prevent a generic provider layer.

```ts title="src/example.ts"
const requirements = {
  preserveRouteShape: true,
  useExistingCatalogLoader: true,
  avoidNewProviderLayer: true,
};
```

## References

- AI Blindspots: Requirements, not Solutions
