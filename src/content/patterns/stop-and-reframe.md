---
title: >-
  Stop and Reframe
summary: >-
  Pause when evidence says the current approach is wrong instead of piling patches onto a bad
  path.
status: seed
tags:
  - "debugging"
  - "review"
  - "agent-guidance"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "A change keeps patching symptoms after the evidence contradicts the approach."
concepts:
  - "cognitive-burden"
  - "review-batch-size"
related:
  - "debug-from-evidence"
  - "smallest-trustworthy-verification"
  - "choose-change-batch-size"
---

## Core Idea

Continuing
can
be
the
wrong
move.
When
each
patch
creates
another
failure,
the
useful
action
is
to
stop,
summarize
evidence,
and
choose
a
new
plan.

This
is
not
only
an
agent
problem.
Humans
also
keep
digging
when
they
have
sunk
cost
in
an
approach
or
when
the
failure
looks
one
edit
away.

The
tradeoff
is
interruption.
Stop
too
early
and
you
waste
momentum;
stop
too
late
and
the
diff
becomes
a
pile
of
guesses.

## Use When

- Each fix introduces another unrelated failure.
- The observed behavior contradicts the model behind the current patch.
- The change is expanding beyond the original risk without a new plan.

## Guidance

- Write down the evidence and current hypothesis.
- Re-check the requirement before adding another patch.
- Escalate or split the work when the failure mode has changed.

## Tradeoffs

- Some debugging requires persistence.
- Stopping should produce a better next step, not just hesitation.
- Time-boxing works best when the next evidence source is clear.

## Agent Instruction

When fixes keep expanding or contradict the evidence, stop and reframe before applying another
patch.

## Examples

### Stop after the third unrelated failure

The note captures evidence instead of adding another speculative branch.

```ts title="src/example.ts"
throw new Error(
  'stopping: parser fix now fails route rendering; re-check boundary assumptions before patching',
);
```

## References

- AI Blindspots: Stop Digging
- AI Blindspots: Know Your Limits
