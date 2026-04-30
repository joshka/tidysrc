---
title: >-
  Report Verification Honestly
summary: >-
  Distinguish checks that actually ran from checks that are recommended, skipped, or inferred.
status: seed
tags:
  - "agent-guidance"
  - "testing"
  - "review"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "md"
  - "ts"
problems:
  - "The handoff implies confidence that the agent did not actually earn."
concepts:
  - "observable-behavior"
  - "agent-guidance"
related:
  - "smallest-trustworthy-verification"
  - "observable-behavior-tests"
  - "debug-from-evidence"
---

## Core Idea

Verification claims are part of the change. When an agent says a change is done, the reviewer needs
to know which checks ran, which failed, which were skipped, and which risks remain untested.

The failure mode is subtle. "Should work" can read like evidence even when it only means the diff
looks plausible. Honest verification separates observed results from recommendations.

This pattern does not require exhaustive testing. It requires accurate reporting so the next person
does not mistake an inference for a passing check.

## Use When

- An agent or contributor is handing off a change after running commands.
- The verification path is partial because of time, environment, or missing dependencies.
- A reviewer needs to decide whether a manual check is still required.

## Guidance

- List commands that ran and their outcomes.
- Say "not run" for checks that were skipped.
- Tie verification to the changed behavior, not only to compilation.

## Tradeoffs

- Long verification logs can hide the useful signal.
- Some checks are redundant; report the smallest set that covers the risk.
- A failed check should include the relevant failure, not the full terminal transcript.

## Agent Instruction

Report only checks that actually ran. Mark skipped checks as not run, and name the remaining risk.

## Examples

### Handoff separates evidence from recommendation

The handoff does not imply that the browser check happened.

```md title="handoff.md"
Verification run:
- pnpm check
- pnpm check:site

Not run:
- manual mobile browser pass

Remaining risk:
- grouped cards may need visual spacing adjustment after design review.
```

### Structured verification status

The status object keeps a generated handoff from collapsing skipped work into a pass.

```ts title="src/verification.ts"
const verification = [
  { command: 'pnpm check', result: 'passed' },
  { command: 'pnpm check:site', result: 'passed' },
  { command: 'manual browser pass', result: 'not-run' },
];
```

## References

- AI Blindspots: Black Box Testing
- AI Blindspots: Scientific Debugging
