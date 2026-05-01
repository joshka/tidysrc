---
title: >-
  Context Hygiene
summary: >-
  Keeping task facts, tool state, and handoff notes current enough that work does not follow stale
  assumptions.
status: seed
tags:
  - "agent-guidance"
  - "workflow"
  - "review"
relatedPatterns:
  - "prepare-the-workspace"
  - "state-requirements-before-solutions"
  - "follow-existing-conventions"
---

## Why it matters

Context is part of the working system. A task can fail because the code is wrong, but it can also
fail because the human or agent is acting on stale constraints, stale tool output, or an old plan.

This is not only an agent concern. Long human debugging sessions also drift when evidence
accumulates faster than the notes, tests, and plan are updated.

## How to apply it

Ask what facts the next worker would need to resume safely. If the answer lives only in chat
history, terminal scrollback, or memory, capture the current constraints before making another
change.

## Examples

### Stale handoff: the next edit follows an old assumption

The note names a command but not the changed constraint that made the old command insufficient.

```text title="handoff.txt"
Run pnpm test after updating the parser.
```

### Better: current constraint travels with the handoff

The next worker sees the active requirement and the verification path together.

```text title="handoff.txt"
Parser changes must preserve legacy CSV headers.
Verify with: pnpm test -- csv-import
```
