---
title: >-
  Reversibility
summary: >-
  How cheaply a structure decision can be undone if later evidence points another way.
status: seed
tags:
  - "workflow"
  - "change-risk"
  - "design"
relatedPatterns:
  - "keep-structure-reversible"
  - "choose-change-batch-size"
  - "avoid-premature-agent-architecture"
---

## Why it matters

Reversible changes keep learning cheap. Renaming a local helper, moving a private function, or
grouping statements can usually be undone. Public APIs, migrations, and data format changes are
harder to reverse.

When the design is still uncertain, reversible structure keeps the code moving without pretending
the final architecture is known.

## How to apply it

Ask what would be required to back out the tidy if the next change disproves it. If rollback needs
migrations, compatibility layers, or downstream coordination, the change needs stronger
justification.

## Examples

### Hard to reverse: public shape changes to test an idea

The public response field changes before the team knows whether the new shape is necessary.

```ts title="src/api/report.ts"
export function renderReport(report: Report) {
  return { reportStatus: report.status };
}
```

### Better: keep uncertainty private

The helper can be changed again without forcing callers to migrate.

```ts title="src/api/report.ts"
function reportStatus(report: Report) {
  return report.status;
}
```
