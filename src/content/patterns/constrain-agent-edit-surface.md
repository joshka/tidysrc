---
title: >-
  Constrain the Agent Edit Surface
summary: >-
  Tell a coding agent which files, modules, and behaviors are in scope before it starts editing.
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
  - "ts"
problems:
  - "A small request turns into broad edits across unrelated files."
concepts:
  - "agent-guidance"
  - "change-radius"
  - "review-batch-size"
related:
  - "cap-change-radius"
  - "follow-existing-conventions"
  - "choose-change-batch-size"
---

## Core Idea

Coding agents tend to follow nearby affordances. If the task names a goal but not an edit surface,
the agent may touch tests, helpers, generated files, styles, and docs in one pass. A constrained
edit surface gives the work a reviewable boundary.

This pattern also helps human contributors. A narrow file set makes it easier to notice when the
work escapes the original change and needs a separate plan.

The constraint should match the risk. A one-line bug fix can name one module. A feature slice can
name a package, but should still call out public contracts, generated files, and unrelated cleanup
as out of scope.

## Use When

- The task is being delegated to an agent or another contributor.
- The codebase has many adjacent files that look relevant but are not part of the change.
- The requested behavior should be solved without refactoring neighboring systems.

## Guidance

- Name the files, directories, or APIs the agent may edit.
- Name out-of-scope cleanup explicitly when it is tempting.
- Ask the agent to report any needed scope expansion before applying it.

## Tradeoffs

- A narrow scope can hide the real fix if the bug crosses a boundary.
- Scope constraints should not block necessary test updates.
- Exploratory work may need a discovery phase before the edit surface is known.

## Agent Instruction

Only edit the named files or modules. If the fix requires a wider surface, stop and report the
reason before changing unrelated code.

## Examples

### Bound the task in the handoff

The handoff separates allowed edits from nearby cleanup so review can focus on the intended change.

```md title="handoff.md"
Goal: make pattern cards filter by category.

Allowed edits:
- src/pages/patterns/index.astro
- src/components/PatternList.astro

Out of scope:
- content rewrites
- theme token changes
- generated output
```

### Encode scope in task metadata

A task runner or agent harness can carry the same boundary in structured form.

```ts title="src/agentTask.ts"
const task = {
  goal: 'filter problem cards by category',
  editSurface: ['src/pages/problems/index.astro'],
  outOfScope: ['content migration', 'palette changes'],
};
```

## References

- AI Blindspots: Requirements, not Solutions
- Agent guidance: local project guidance overrides general defaults.
