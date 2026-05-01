# Tidy First Mapping

This maps Tidy First ideas to TidySrc entries. The goal is to keep the useful source-change
pressure while preserving TidySrc's review-link shape.

## Current Strong Fits

| Tidy First idea | Current TidySrc fit | Notes |
| --- | --- | --- |
| Separate tidying from behavior | `separate-structure-from-behavior`, `untangle-before-changing` | Keep review intent visible. |
| Small tidying moves | `choose-change-batch-size`, `keep-structure-reversible` | Batch size and reversibility control review cost. |
| Guard clauses and readable flow | `guard-clause`, `hidden-main-path` | Keep the main path visible. |
| Explanatory variables | `explaining-variable` | Name decisions that carry domain meaning. |
| Cohesion | `strengthen-cohesion`, `cohesion` | Keep related behavior under one concept. |
| Coupling | `name-coupling`, `coupling` | Name what must change or be understood together. |
| Deleting dead code | `delete-dead-code` | Remove unused paths when behavior does not depend on them. |
| Symmetry | `normalize-symmetries` | Make repeated shapes line up when that lowers reader burden. |

## Seed Entries Added From This Source

- `delete-dead-code`
- `normalize-symmetries`
- `move-declaration-and-initialization-together`
- `make-parameters-explicit`
- `extract-helper-after-locality`
- `write-explaining-comments`
- `delete-redundant-comments`
- `choose-change-batch-size`
- `untangle-before-changing`
- `keep-structure-reversible`
- `name-coupling`
- `strengthen-cohesion`
- `keep-name-current`

These should stay `seed` until each page has examples that feel shaped by real maintenance
pressure.

## Concepts Added or Strengthened

- `coupling`
- `cohesion`
- `change-economics`
- `reversibility`
- `review-batch-size`

These concepts should carry the "why" behind small tidying moves so pattern pages can stay concise.

## Follow-Up Questions

- Which seed entries overlap too much with existing reviewed patterns?
- Which entries need examples before they can move from `seed` to `draft`?
- Should change economics become a stronger concept page before launch?
- Are any Tidy First chapter ideas better kept as references instead of TidySrc pages?
