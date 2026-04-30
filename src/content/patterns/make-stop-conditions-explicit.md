---
title: >-
  Make Stop Conditions Explicit
summary: >-
  Define when an agent should pause, escalate, or ask for review instead of continuing.
status: seed
tags:
  - "agent-guidance"
  - "debugging"
  - "workflow"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "md"
problems:
  - "The agent keeps editing after the task has become a different problem."
concepts:
  - "agent-guidance"
  - "review-batch-size"
related:
  - "stop-and-reframe"
  - "debug-from-evidence"
  - "constrain-agent-edit-surface"
---

## Core Idea

Some failures mean "try the next obvious fix." Others mean the task has changed. Stop conditions
make that boundary explicit before the agent is already deep in a speculative patch.

Useful stop conditions name evidence: a public API must change, verification contradicts the plan,
the edit surface grows, or user-owned work blocks the task. They prevent the agent from treating
every obstacle as permission to widen scope.

The stop condition should not block ordinary debugging. It should catch moments where continuing
would make review harder or change the user's intent.

## Use When

- The task has known uncertainty or a high chance of scope expansion.
- The agent is working near public contracts, migrations, or user-owned edits.
- Previous attempts kept patching after the evidence changed.

## Guidance

- Name concrete events that require a pause.
- Tell the agent what to report at the pause.
- Pair the stop condition with the next expected evidence source.

## Tradeoffs

- Too many stop conditions can interrupt simple work.
- A stop condition should produce a decision, not just delay.
- Some urgent fixes need bounded persistence before escalation.

## Agent Instruction

Pause when a stop condition is hit. Report the evidence, the current diff shape, and the decision
needed before continuing.

## Examples

### Stop conditions in a task handoff

The agent can continue through normal failures, but must pause before widening the change.

```md title="handoff.md"
Stop and ask if:
- the public route shape must change
- the fix requires editing generated files
- tests pass only after weakening assertions
- the edit surface grows outside src/pages/problems/
```

## References

- AI Blindspots: Stop Digging
- AI Blindspots: Know Your Limits
