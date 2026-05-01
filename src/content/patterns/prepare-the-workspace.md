---
title: >-
  Prepare the Workspace
summary: >-
  Set up commands, docs, tools, and state before asking for a risky source change.
status: seed
tags:
  - "workflow"
  - "tooling"
  - "agent-guidance"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "Work starts before the environment, commands, and local rules are ready."
concepts:
  - "context-hygiene"
  - "review-batch-size"
related:
  - "follow-existing-conventions"
  - "smallest-trustworthy-verification"
  - "make-parameters-explicit"
---

## Core Idea

Workspace preparation reduces avoidable failures. A clean working copy, known commands, local docs,
and tool access give humans and agents the same starting facts.

The problem is not only AI tooling. Human reviews also suffer when setup, generated files, and
verification commands are discovered halfway through a change.

The tradeoff is setup cost. Prepare enough to make the next change safe; do not build a workflow
platform for one edit.

## Use When

- The task depends on repo-local commands or generated content.
- An agent or teammate will execute work without knowing project conventions.
- Tool state or working directory assumptions have caused previous mistakes.

## Guidance

- Record the commands needed to verify the changed surface.
- Expose project-specific tools instead of relying on generic shell guesses.
- Keep setup steps close to the task handoff.

## Tradeoffs

- Preparation can become procrastination.
- Some work is exploratory and should not require a full harness.
- Tooling should reduce context, not create more of it.

## Agent Instruction

Before starting risky work, identify the local docs, commands, tool state, and verification path
needed to complete it safely.

## Examples

### Name the verification command before editing

The task handoff includes the command that proves the changed content still renders.

```ts title="src/example.ts"
const handoff = {
  verify: 'pnpm check:site',
  docs: ['docs/writing-guidelines.md', 'docs/site-plan.md'],
};
```

## References

- AI Blindspots: Mise en Place
- AI Blindspots: Stateless Tools
- AI Blindspots: Use MCP Servers
