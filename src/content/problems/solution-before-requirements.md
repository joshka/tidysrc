---
title: >-
  Solution Before Requirements
status: seed
category: agent-workflow
topics:
  - "requirements"
  - "architecture"
  - "review"
summary: >-
  Implementation begins before constraints, non-goals, and success checks are clear.
relatedPatterns:
  - "state-requirements-before-solutions"
  - "follow-existing-conventions"
  - "avoid-premature-agent-architecture"
relatedConcepts:
  - "boundary-trust"
  - "cognitive-burden"
---

## Description

The implementation silently chooses defaults about architecture, compatibility, and verification.
Those choices may be more expensive to unwind than the original change.

Solution before requirements appears when code starts with a framework, abstraction, or integration
shape before the problem boundaries are known. The implementation fills in missing requirements
with whatever the chosen solution makes convenient.

## Why It Matters

Early implementation choices can become accidental requirements. Reviewers then have to debate the
shape of the solution and the missing product or maintenance constraints at the same time.

## Code Impact

The code often gains generic extension points, new dependencies, broad interfaces, or persistence
shapes before there is evidence that the change needs them. Tests prove the scaffold runs rather
than proving the requested behavior.

## Signals

- A generic architecture appears before the local requirement is clear.
- The patch optimizes for a guessed future use case.
- Reviewers ask what problem the solution is solving.

## Diagnostic Questions

- What must remain compatible?
- What is explicitly out of scope?
- What check proves the requested behavior, not just the chosen solution?

## Approach

- Write constraints and non-goals first.
- Prefer the smallest local shape that satisfies the stated requirement.
- Delay architecture choices until repeated pressure appears.

## Examples

### Problem: abstraction appears before the rule is known

The implementation starts with a plugin registry even though there is one current export rule.

```typescript title="src/export/registry.ts"
export const exporters = new Map<string, Exporter>();

export function registerExporter(name: string, exporter: Exporter) {
  exporters.set(name, exporter);
}
```

### Better: the requirement stays local until it repeats

The code names the current behavior without committing to a broader architecture.

```typescript title="src/export/report.ts"
export function exportReport(report: Report): CsvFile {
  return renderReportCsv(report);
}
```
