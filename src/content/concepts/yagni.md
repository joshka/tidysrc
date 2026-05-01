---
title: >-
  YAGNI
summary: >-
  "You aren't gonna need it": avoid adding structure for futures that are not yet real enough to
  justify the cost.
status: seed
tags:
  - "architecture"
  - "change-economics"
  - "review"
relatedPatterns:
  - "keep-structure-reversible"
  - "preparatory-refactor"
  - "choose-change-batch-size"
---

## Why it matters

YAGNI asks whether a structure change is paying for a future that the code has not actually shown.
In source-change review, this often means questioning a provider, registry, strategy, interface, or
configuration layer that exists because it might help later.

The rule is not "never abstract." It is "wait until the repeated pressure is real enough to name."
When the future change becomes concrete, the abstraction can be reviewed against evidence instead of
anxiety.

## How to apply it

Ask what current change this structure makes simpler. If the answer is mostly hypothetical, keep the
local code direct and make the next extraction cheaper with reversible structure.

## Examples

### Premature structure: registry for one implementation

The registry exists for imagined future exporters, not for the current change.

```ts title="src/export/registry.ts"
const exporters = new Map<string, Exporter>();

export function exportReport(kind: string, report: Report) {
  return exporters.get(kind)!.export(report);
}
```

### Better: direct code until variation is real

The current behavior remains visible and cheap to change.

```ts title="src/export/report.ts"
export function exportReport(report: Report) {
  return renderCsv(report);
}
```
