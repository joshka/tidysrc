---
title: >-
  Context Drift
status: seed
category: tooling
topics:
  - "context"
  - "agent-workflow"
  - "review"
summary: >-
  The work continues from stale assumptions, forgotten constraints, or tool state that no longer
  matches the task.
relatedPatterns:
  - "prepare-the-workspace"
  - "repo-local-instructions-win"
  - "state-requirements-before-solutions"
relatedConcepts:
  - "context-hygiene"
  - "review-batch-size"
---

## Impact

A human or agent can keep acting on an old plan after files, requirements, or verification results
changed. The longer the session, the harder it is to notice the drift.

## Signals

- The change ignores newer user instructions.
- Commands run from the wrong directory or stale generated output.
- A summary omits constraints that later edits should preserve.

## Diagnostic Questions

- What facts changed since the plan was made?
- Which local instructions and commands are current?
- Is the working copy still the right place for this task?

## Approach

- Refresh the task constraints before continuing.
- Record current commands and assumptions.
- Start a new change or handoff when the old context is no longer reliable.
