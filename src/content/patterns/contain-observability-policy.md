---
title: >-
  Contain Observability Policy
summary: >-
  Put logging, metrics, and tracing decisions at boundaries where the signal has a clear owner.
status: seed
tags:
  - "observability"
  - "boundaries"
  - "side-effects"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "Logs, metrics, and traces are scattered without a clear signal or owner."
concepts:
  - "side-effect-visibility"
  - "observable-behavior"
related:
  - "make-side-effects-visible"
  - "make-failures-observable"
---

## Core Idea

Observability
is
a
side
effect
with
policy.
Scattered
logs
and
metrics
can
make
code
noisy
without
helping
maintainers
answer
what
happened.

Contain
the
policy
where
the
boundary
owns
the
signal:
request
handling,
job
execution,
external
calls,
or
state
transitions.

The
tradeoff
is
detail.
Too
little
signal
hides
failures;
too
much
signal
makes
every
change
harder
to
read
and
operate.

## Use When

- Several callers log the same event differently.
- Metrics are added without naming the question they answer.
- Tracing code obscures the business path.

## Guidance

- Name the operational question the signal answers.
- Emit signals at boundaries that own the event.
- Keep diagnostic detail out of core domain code when possible.

## Tradeoffs

- Some low-level libraries need local diagnostics.
- Too much centralization can hide useful context.
- Logs can become observable contracts for operators.

## Agent Instruction

Add observability at the boundary that owns the event and name the question the signal answers.

## Examples

### Log once at the boundary

The job runner owns the operational signal instead of every helper logging partial context.

```ts title="src/example.ts"
logger.info('pattern_import_completed', {
  imported: result.importedCount,
  rejected: result.rejectedCount,
});
```

## References

- Tidy First? chapter themes: use as inspiration, not a direct content source.
