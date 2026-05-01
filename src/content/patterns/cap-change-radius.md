---
title: >-
  Cap the Change Radius
summary: >-
  Keep a change inside the smallest coherent set of files, calls, and concepts that can carry it.
status: reviewed
exampleStyle: narrative
tags:
  - "workflow"
  - "architecture"
  - "review"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages: []
problems:
  - "A small behavior change requires touching many distant files that do not own the behavior."
concepts:
  - "change-radius"
  - "reader-locality"
related:
  - "reader-locality"
  - "separate-structure-from-behavior"
  - "parse-dont-validate"
---

## Core Idea

A change radius grows when a small rule forces edits across files, tests, builders, configs, and
docs that do not own the behavior. Some radius is real coupling. Some is accidental shape. Before
broadening a patch, ask which boundary should own the rule and which edits only exist because the
current shape leaks it.

The main tradeoff is that large radii can be legitimate for public API changes; make that
compatibility cost explicit instead of hiding it as cleanup.

## Use When

- One rule change touches several layers because the rule is represented as loose data or repeated
  conditionals.
- A review has many mechanical edits that hide the file where the behavior actually lives.
- A caller needs to know too many downstream implementation details before it can make a small
  change safely.

## Guidance

- Find the boundary that owns the rule and move the rule there before copying updates through
  callers.
- Separate mechanical call-site changes from the behavior change when the radius cannot be avoided.
- Use a precise type, policy object, or named helper only when it reduces the number of future edit
  sites.

## Tradeoffs

- Large radii can be legitimate for public API changes; make that compatibility cost explicit
  instead of hiding it as cleanup.
- Do not create a central dumping ground just to reduce touched files; the new boundary must own the
  concept.
- Rust often exposes radius through type changes, while dynamic languages can hide radius until
  runtime or tests execute the path.

## Agent Instruction

Before editing many files for one rule, identify the boundary that should own the rule. Keep the
patch radius small or explain why the wider radius is a real contract change.

## Examples

- First patch: move the repeated rule to the owning boundary and add targeted tests for that rule.
- Second patch: update callers to ask that boundary instead of rebuilding the rule.
- Third patch, only if needed: remove dead helpers, stale constants, or compatibility shims after
  behavior is verified.

## References

- None yet.
