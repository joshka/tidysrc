---
title: >-
  Let Tools Handle Mechanics
summary: >-
  Use formatters, typecheckers, linters, and static tools for mechanical guarantees before
  hand-editing around them.
status: seed
tags:
  - "tooling"
  - "workflow"
  - "testing"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "ts"
problems:
  - "Mechanical style, type, or formatting work is done manually and inconsistently."
concepts:
  - "review-batch-size"
  - "observable-behavior"
related:
  - "smallest-trustworthy-verification"
  - "separate-structure-from-behavior"
---

## Core Idea

Mechanical work should be delegated to tools when a tool can state the rule better than a human
edit. Formatting, import order, type checks, and lint fixes are often review noise when done
manually.

Humans and agents both waste attention hand-tuning mechanics. Tool-backed changes are easier to
review because the rule is external and repeatable.

The tradeoff is tool authority. Tools can be wrong, too broad, or misconfigured; apply them in
batches that match the review risk.

## Use When

- A change includes formatting, imports, generated types, or lintable style.
- Reviewers are discussing mechanics instead of behavior.
- A formatter or typechecker can prove the rule repeatably.

## Guidance

- Run the project formatter for mechanical formatting.
- Use type and lint checks to catch shape errors before hand-editing around them.
- Keep tool-only churn separate from behavior changes when it is broad.

## Tradeoffs

- Formatter churn can hide semantic edits.
- Static types do not prove runtime behavior.
- Tool configuration should be local and explicit.

## Agent Instruction

Use repo-local tools for mechanical formatting, linting, and type checks. Keep broad mechanical
churn separate from behavior changes.

## Examples

### Run the formatter instead of hand-aligning code

The command makes the mechanical rule repeatable.

```ts title="src/example.ts"
const verification = ['pnpm format', 'pnpm check'];
```

## References

- AI Blindspots: Use Automatic Code Formatting
- AI Blindspots: Use Static Types
