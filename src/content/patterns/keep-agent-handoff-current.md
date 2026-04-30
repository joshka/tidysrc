---
title: >-
  Keep Agent Handoff Current
summary: >-
  Update the task summary when facts, blockers, checks, or ownership change during the work.
status: seed
tags:
  - "agent-guidance"
  - "workflow"
  - "review"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "md"
problems:
  - "The next reader follows stale assumptions from an earlier task summary."
concepts:
  - "context-hygiene"
  - "agent-guidance"
related:
  - "separate-exploration-from-editing"
  - "report-verification-honestly"
  - "stop-and-reframe"
---

## Core Idea

Agent work often spans enough time for the task facts to change. A command fails, the edit surface
moves, the user changes priority, or a once-open question gets answered. If the handoff stays stale,
the next reader inherits an obsolete plan.

A current handoff is short and operational. It names what changed, what remains, what checks ran,
and what assumptions are still live.

The risk is turning the handoff into a diary. Keep only facts that affect the next decision.

## Use When

- Work crosses a context boundary, pause, resume, or agent handoff.
- The plan changed after exploration.
- A check failed or a blocker was discovered.

## Guidance

- Replace stale assumptions instead of appending around them.
- Keep open questions visible and delete resolved ones.
- Record ownership of touched files when multiple actors may edit.

## Tradeoffs

- Overly detailed handoffs waste the next reader's attention.
- A handoff can lag during fast local work; update it at boundaries.
- Some uncertainty belongs in an open question, not in softened prose.

## Agent Instruction

When task facts change, update the handoff with current files, checks, blockers, and open questions.
Do not leave stale instructions as if they still apply.

## Examples

### Current handoff after a scope change

The updated note replaces the old assumption that only one page needed editing.

```md title="handoff.md"
Current scope:
- src/pages/problems/index.astro
- src/pages/concepts/index.astro

Changed after exploration:
- Concepts needed grouped navigation too; the original plan only mentioned problems.

Checks:
- pnpm check passed
```

## References

- AI Blindspots: Memento
- AI Blindspots: The tail wagging the dog
