---
title: >-
  Preserve Human Changes
summary: >-
  Treat unowned working-copy edits as user work unless the user explicitly asks to replace them.
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
  - "An agent overwrites unrelated local work while trying to make its own patch clean."
concepts:
  - "agent-guidance"
  - "change-radius"
related:
  - "follow-existing-conventions"
  - "constrain-agent-edit-surface"
  - "keep-structure-reversible"
---

## Core Idea

Agents share a working tree with the user. Files can change between the agent's first read and its
next edit. Those changes are not noise; they are potentially the user's current work.

Preserving human changes keeps the agent from turning source control hygiene into data loss. The
agent should work around unrelated edits, reread files it will touch, and ask before replacing state
it did not create.

This pattern matters for humans too. Reviewers should be suspicious when a diff "cleans up" nearby
work that was not part of the request.

## Use When

- The working copy already has changes before the task starts.
- The user edits files while the agent is working.
- The fix touches files that contain unrelated modifications.

## Guidance

- Check working-copy state before broad edits.
- Reread a file before patching if time has passed or another actor may have changed it.
- Do not revert unrelated edits unless the user explicitly asks for that operation.

## Tradeoffs

- Preserving unrelated changes can make a patch less tidy.
- Some generated files can be regenerated safely, but the rule should be explicit.
- Merge conflicts may require asking for intent instead of guessing.

## Agent Instruction

Do not overwrite or revert changes you did not make. If another change blocks the task, report the
conflict and ask how to proceed.

## Examples

### Handoff calls out unowned edits

The note protects unrelated work while still letting the agent complete its change.

```md title="agent-notes.md"
Working-copy note:
- docs/site-plan.md has pre-existing edits. Do not modify it.
- src/pages/problems/index.astro is owned by this task.
```

## References

- Agent guidance: local project guidance overrides general defaults.
