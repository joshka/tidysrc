---
title: >-
  Change Radius
summary: >-
  The set of files, concepts, call sites, tests, and contracts that must move for one source
  change.
status: draft
tags:
  - "workflow"
  - "architecture"
  - "review"
relatedPatterns:
  - "cap-change-radius"
  - "separate-structure-from-behavior"
  - "reader-locality"
---
## What expands it

A change radius grows when one rule is copied across callers, when raw data leaks through
boundaries, or when tests assert private shape. Some radius is real compatibility cost; some is
accidental structure.

Large radius is not automatically wrong. It becomes a problem when many touched files do not own the
behavior being changed.

## How to reason about it

Find the boundary that should own the rule. If the radius is still large after that, split
mechanical movement from behavior so review can isolate the risk.

In Rust, type changes often reveal the radius at compile time. In TypeScript, JavaScript, Go, and
Java, tests and call-site search often reveal it later.
