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
  - "follow-existing-conventions"
  - "state-requirements-before-solutions"
relatedConcepts:
  - "context-hygiene"
  - "review-batch-size"
---

## Description

A human or agent can keep acting on an old plan after files, requirements, or verification results
changed. The longer the session, the harder it is to notice the drift.

Context drift is especially easy to miss in long review or agent sessions because the work still
looks purposeful. The code changes may be locally reasonable while following instructions, file
state, or assumptions that stopped being true earlier in the task.

## Why It Matters

Stale context makes review unreliable. The reviewer has to check both the code and the invisible
question of whether the code is still solving the current problem.

## Code Impact

The diff tends to preserve outdated names, call the wrong helper, run the wrong verification
command, or keep edits in a working copy that no longer matches the requested change. Later fixes
then pile on top of an obsolete plan instead of correcting the underlying task model.

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

## Examples

### Problem: stale assumptions choose the wrong config key

The task changed from a legacy flag to the new policy object, but the edit keeps using the old
environment variable.

```typescript title="src/runtime/config.ts"
export function loadRetryPolicy(env: Env): RetryPolicy {
  return {
    attempts: Number(env.LEGACY_RETRY_COUNT ?? 3),
  };
}
```

### Better: refresh context at the boundary

The loader follows the current contract and leaves the legacy spelling out of new call sites.

```typescript title="src/runtime/config.ts"
export function loadRetryPolicy(env: Env): RetryPolicy {
  return RetryPolicy.fromConfig(env.RETRY_POLICY_JSON);
}
```
