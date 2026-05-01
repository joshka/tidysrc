---
title: >-
  Debug from Evidence
summary: >-
  Use observed failures to test one hypothesis at a time instead of guessing until green.
status: seed
tags:
  - "debugging"
  - "testing"
  - "review"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "A fix is based on a plausible guess rather than evidence about the failing path."
concepts:
  - "observable-behavior"
  - "cognitive-burden"
related:
  - "smallest-trustworthy-verification"
  - "characterize-before-changing"
  - "stop-and-reframe"
---

## Core Idea

Debugging is model correction. The failure tells you something about the system; the next step
should distinguish between competing explanations.

Guess-driven changes are tempting for humans and agents because each edit feels small. The result is
often a diff that passes one check while leaving the real cause unnamed.

The tradeoff is speed. A quick fix is fine when evidence is decisive; otherwise isolate the mismatch
before editing more code.

## Use When

- The same failure returns after several plausible fixes.
- The fix changes code that was not proven to be on the failing path.
- A test is adjusted without explaining why the old expectation was wrong.

## Guidance

- Name the hypothesis before changing code.
- Choose the smallest check that can disprove it.
- Keep instrumentation temporary unless it becomes useful observability.

## Tradeoffs

- Some failures require exploratory logging.
- Evidence can be misleading when tests are overfit.
- Do not build a diagnostic framework for one small bug.

## Agent Instruction

Debug by naming the current hypothesis and running the smallest check that can disprove it. Avoid
patching guesses into the code.

## Examples

### Capture the failing assumption

The assertion checks the suspected boundary before changing the parser.

```ts title="src/example.ts"
expect(parsePattern(raw).status).toBe('reviewed');
expect(renderPattern(raw)).toContain('Reviewed');
```

## References

- AI Blindspots: Scientific Debugging
