---
title: >-
  Separate Exploration from Editing
summary: >-
  Let an agent read, search, and summarize before it starts changing files.
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
  - "The first patch reflects the agent's initial guess instead of the codebase's actual shape."
concepts:
  - "agent-guidance"
  - "context-hygiene"
related:
  - "debug-from-evidence"
  - "state-requirements-before-solutions"
  - "follow-existing-conventions"
---

## Core Idea

Exploration and editing use different standards. During exploration, the useful output is evidence:
which files matter, which conventions exist, and which assumptions are still weak. During editing,
the useful output is a coherent diff.

Agents often blur those phases because editing feels like progress. That creates patches based on
the first plausible shape the agent finds. A short exploration phase makes the first edit less
generic and gives the reviewer a record of the assumptions behind it.

The phase boundary should stay lightweight. The goal is not a research report; it is enough context
to avoid guessing at the repository's structure.

## Use When

- The task touches unfamiliar code.
- The user asks for a broad change but the concrete files are not obvious.
- Several local patterns could apply and the agent needs to discover which one the repo uses.

## Guidance

- Search and read before editing.
- Summarize the target files, local conventions, and unresolved assumptions.
- Start editing only after the likely implementation surface is named.

## Tradeoffs

- Tiny edits do not need a formal exploration phase.
- Exploration can become drift when it does not end in a concrete edit plan.
- The summary should name evidence, not narrate every file read.

## Agent Instruction

Before editing unfamiliar code, inspect the relevant files and state the edit surface. Do not patch
from the first plausible guess.

## Examples

### Exploration note before changes

The note gives the reviewer enough context to see why these files are the right target.

```md title="agent-notes.md"
Exploration:
- Pattern index filtering lives in src/pages/patterns/index.astro.
- Rows expose data attributes through src/components/PatternList.astro.
- Existing filters update the URL; new quick filters should reuse that path.

Edit surface:
- src/pages/patterns/index.astro
```

## References

- AI Blindspots: Read the Docs
- AI Blindspots: Scientific Debugging
