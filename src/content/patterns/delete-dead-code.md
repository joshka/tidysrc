---
title: >-
  Delete Dead Code
summary: >-
  Remove unused branches, helpers, flags, and comments once the code no longer needs them.
status: seed
tags:
  - "readability"
  - "maintenance"
  - "tidying"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "Old code paths make readers ask whether behavior is still supported."
concepts:
  - "cognitive-burden"
  - "change-radius"
related:
  - "smallest-trustworthy-verification"
  - "separate-structure-from-behavior"
---

## Core Idea

Dead
code
is
not
free
documentation.
It
adds
names,
branches,
tests,
and
possibilities
the
reader
must
rule
out
before
trusting
the
live
path.

Delete
it
when
the
project
has
enough
evidence
that
the
path
is
unused.
Keep
the
deletion
reviewable
and
separate
when
removal
could
alter
observable
behavior.

The
tradeoff
is
recovery.
Source
control
already
remembers
old
code,
but
public
compatibility,
migrations,
and
feature
flags
may
need
a
deliberate
retirement
path.

## Use When

- A helper, branch, flag, or mode is no longer reachable.
- A compatibility path has passed its removal date.
- Comments describe code that no longer exists.

## Guidance

- Prove the path is unused through search, tests, telemetry, or release policy.
- Delete the dead path in a structure-only change when possible.
- Remove tests and docs that only preserve the dead behavior.

## Tradeoffs

- Do not delete compatibility behavior without checking downstream users.
- Generated code or framework hooks can look unused locally.
- Feature flags may need staged cleanup after rollout.

## Agent Instruction

When you find unused code, verify why it is unused and remove it in a focused change. Do not
preserve old behavior as comments.

## Examples

### Remove the unreachable branch

The archived status is no longer emitted, so the branch only adds a false possibility.

```ts title="src/example.ts"
if (pattern.status === 'archived') {
  return null;
}

return renderPattern(pattern);
```

## References

- Tidy First? chapter themes: use as inspiration, not a direct content source.
