---
title: >-
  Preserve the Spec
summary: >-
  Do not satisfy local pressure by weakening tests, contracts, public fields, or documented
  behavior.
status: seed
tags:
  - "review"
  - "testing"
  - "agent-guidance"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "The implementation changes the contract to make the patch pass."
concepts:
  - "observable-behavior"
  - "boundary-trust"
related:
  - "observable-behavior-tests"
  - "characterize-before-changing"
  - "separate-structure-from-behavior"
---

## Core Idea

A
spec
is
the
boundary
the
change
must
respect.
It
can
be
a
test,
public
API,
documented
behavior,
file
format,
CLI
output,
or
maintainer
instruction.

Humans
and
agents
both
weaken
specs
when
they
are
stuck:
deleting
a
failing
assertion,
renaming
a
public
field,
changing
a
route
shape,
or
adjusting
expected
output
to
match
a
bug.

The
tradeoff
is
that
specs
can
be
wrong.
When
the
spec
is
wrong,
change
it
deliberately
and
make
that
behavior
change
visible.

## Use When

- A change edits tests or expected output before explaining the behavior change.
- A public contract changes to make an implementation easier.
- The code passes by narrowing the problem rather than meeting the requirement.

## Guidance

- Treat tests and documented contracts as evidence, not obstacles.
- Change the spec only as an explicit behavior change.
- Preserve public shape unless the review is about changing that shape.

## Tradeoffs

- Bad tests can overfit private shape.
- Legacy specs may preserve bugs until deliberately changed.
- External API compatibility may require adapters rather than direct fixes.

## Agent Instruction

Do not weaken tests, contracts, or public shape to make a change pass. If the spec is wrong, make
the spec change explicit.

## Examples

### Keep the expected API shape stable

The implementation adapts to the documented field name instead of renaming the field to fit
internals.

```ts title="src/example.ts"
return {
  display_name: pattern.title,
  short_summary: pattern.summary,
};
```

## References

- AI Blindspots: Respect the Spec
- AI Blindspots: Black Box Testing
