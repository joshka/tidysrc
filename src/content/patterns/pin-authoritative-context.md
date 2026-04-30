---
title: >-
  Pin Authoritative Context
summary: >-
  Give agents the local docs, current APIs, and source files that should outrank generic memory.
status: seed
tags:
  - "agent-guidance"
  - "workflow"
  - "tooling"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "md"
  - "ts"
problems:
  - "The implementation follows stale general knowledge instead of the repo's actual contracts."
concepts:
  - "agent-guidance"
  - "boundary-trust"
related:
  - "repo-local-instructions-win"
  - "prepare-the-workspace"
  - "preserve-the-spec"
---

## Core Idea

Agents can sound confident while using stale API knowledge, generic framework patterns, or memory
from another project. Authoritative context tells the agent which facts should win.

Pinning context is most useful for current libraries, local generated types, public contracts, and
project conventions. The agent should read those sources before inventing a shape.

The tradeoff is context size. Too many links become another undifferentiated pile. Pin the few
sources that decide the change.

## Use When

- The task depends on a current library, API, schema, or generated type.
- The codebase has local docs that override generic advice.
- The agent may know an older version of the tool or framework.

## Guidance

- Name the authoritative files, docs, or commands.
- Treat generated types and schemas as contracts, not suggestions.
- Avoid dumping broad documentation when one page or type definition decides the issue.

## Tradeoffs

- External docs can be stale or mismatched to the installed version.
- Local source wins over memory when the two disagree.
- Too much context makes the agent less likely to use the important parts.

## Agent Instruction

Use the pinned sources as authority. If they conflict with your prior knowledge, follow the pinned
source and report the conflict.

## Examples

### Pin local and external context

The task names the exact sources that should decide implementation choices.

```md title="agent-task.md"
Authoritative context:
- AGENTS.md
- docs/writing-guidelines.md
- src/content.config.ts
- Astro content collections docs for the installed Astro version
```

### Keep context small enough to use

The structured task names only the contracts needed for the edit.

```ts title="src/taskContext.ts"
const context = {
  localContracts: ['src/content.config.ts', 'src/lib/catalog.ts'],
  externalDocs: ['Astro content collections'],
};
```

## References

- AI Blindspots: Read the Docs
- AI Blindspots: Respect the Spec
