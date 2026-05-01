---
title: >-
  Split Flag into Named Operations
summary: >-
  Replace a boolean argument with separate functions or methods when the flag selects a different
  action.
status: seed
tags:
  - "api-design"
  - "naming"
  - "readability"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "c"
  - "cpp"
  - "csharp"
  - "go"
  - "java"
  - "js"
  - "python"
  - "rust"
  - "ts"
problems:
  - "A boolean argument asks the caller to remember which action true or false selects."
concepts:
  - "reader-locality"
  - "cognitive-burden"
related:
  - "replace-boolean-flag-with-choice"
  - "make-parameters-explicit"
---

## Core Idea

A boolean flag often means one call name is doing two jobs. If the selected behavior has a good noun
name, replace the flag with a choice type. If the selected behavior is better captured as a verb,
split the API into named operations.

This pattern works best when callers already think in terms of actions: publish now, save as draft,
send silently, render preview, run dry. The method or function name carries the distinction, so the
argument list does not need to.

The tradeoff is API surface. Two narrow operations are clearer than one flag-driven operation when
they name real behavior, but noisy when the flag is only a local detail.

## Use When

- A boolean parameter selects between two actions with distinct verbs.
- The call would read naturally as two named functions or methods.
- The flag name describes how the callee behaves, not a domain value the caller owns.

## Guidance

- Name the operations around what the caller intends to do.
- Keep shared implementation private if both operations mostly share mechanics.
- Use a choice type instead when the caller is selecting a stable domain mode.
- Preserve one old flag-taking wrapper temporarily if public callers need a migration path.

## Tradeoffs

- More methods can make a small API feel larger.
- Shared implementation may need a private helper to avoid duplicating mechanics.
- If new cases are likely, a choice type may scale better than adding more methods.

## Agent Instruction

When a boolean argument selects a different action, split the function into named operations instead
of adding another flag. Keep any shared mechanics behind a private helper.

## Examples

### C functions name the export action

The public calls describe the action; the shared helper keeps the mechanics in one place.

```c title="src/report_export.c"
ExportedReport export_draft_report(const Report *report) {
    return export_report_with_mode(report, EXPORT_DRAFT);
}

ExportedReport export_final_report(const Report *report) {
    return export_report_with_mode(report, EXPORT_FINAL);
}
```

### C++ methods name the export action

The caller chooses an operation instead of passing a flag into a general method.

```cpp title="src/report_exporter.cpp"
ExportedReport ReportExporter::export_draft(const Report& report) {
    return export_with_mode(report, ExportMode::Draft);
}

ExportedReport ReportExporter::export_final(const Report& report) {
    return export_with_mode(report, ExportMode::Final);
}
```

### C# methods name the export action

The public methods carry the intent and delegate shared work to a private helper.

```csharp title="Reports/ReportExporter.cs"
public ExportedReport ExportDraft(Report report) =>
    ExportWithMode(report, ExportMode.Draft);

public ExportedReport ExportFinal(Report report) =>
    ExportWithMode(report, ExportMode.Final);
```

### Go functions name the export action

The package exposes two intent-revealing calls and keeps the mode detail internal.

```go title="reports/export.go"
func ExportDraftReport(report Report) ExportedReport {
    return exportReportWithMode(report, exportDraft)
}

func ExportFinalReport(report Report) ExportedReport {
    return exportReportWithMode(report, exportFinal)
}
```

### Java methods name the export action

The caller does not need to inspect a boolean parameter to know which report is produced.

```java title="src/main/java/example/ReportExporter.java"
ExportedReport exportDraft(Report report) {
    return exportWithMode(report, ExportMode.DRAFT);
}

ExportedReport exportFinal(Report report) {
    return exportWithMode(report, ExportMode.FINAL);
}
```

### JavaScript functions name the export action

The exported function names are enough to understand the behavior at the call site.

```js title="src/reports/exportReport.js"
export function exportDraftReport(report) {
  return exportReportWithMode(report, 'draft');
}

export function exportFinalReport(report) {
  return exportReportWithMode(report, 'final');
}
```

### Python functions name the export action

The lightweight wrapper functions keep the caller-facing API readable.

```python title="reports/export.py"
def export_draft_report(report):
    return _export_report_with_mode(report, ExportMode.DRAFT)

def export_final_report(report):
    return _export_report_with_mode(report, ExportMode.FINAL)
```

### Rust functions name the export action

The public functions carry the caller intent while a private helper handles shared mechanics.

```rust title="src/reports/export.rs"
pub fn export_draft_report(report: &Report) -> ExportedReport {
    export_report_with_mode(report, ExportMode::Draft)
}

pub fn export_final_report(report: &Report) -> ExportedReport {
    export_report_with_mode(report, ExportMode::Final)
}
```

### TypeScript functions name the export action

The function name carries the distinction that would otherwise be hidden in a boolean.

```ts title="src/reports/exportReport.ts"
export function exportDraftReport(report: Report): ExportedReport {
  return exportReportWithMode(report, 'draft');
}

export function exportFinalReport(report: Report): ExportedReport {
  return exportReportWithMode(report, 'final');
}
```

## References

- None yet.
