---
title: >-
  Boolean flag maze
status: draft
category: state
topics:
  - api-design
  - readability
  - control-flow
summary: >-
  Booleans carry domain choices across function boundaries until call sites no longer explain
  themselves.
relatedPatterns:
  - replace-boolean-flag-with-choice
  - make-state-transitions-explicit
  - make-invalid-states-hard-to-express
relatedConcepts:
  - state-space
  - reader-locality
---

## Impact

The reader has to remember what true and false mean in each position. As more flags appear,
impossible combinations become representable and behavior changes hide inside argument order.

## Signals

- Call sites pass true, false, false without local names.
- Two or more booleans combine into a lifecycle or mode.
- A third state appears as null, comments, or another flag.
- Tests name the boolean arrangement instead of the behavior selected by that arrangement.

## Diagnostic Questions

- What domain choice does this flag represent?
- Would an enum, union, named options object, or constructor make the call readable?
- Are these states mutually exclusive?
- Can invalid combinations be made harder to express?

## Approach

- Replace boundary booleans with named choices when the flag selects behavior.
- Keep local boolean facts when the name is visible beside the branch.
- Move lifecycle choices into transition functions if the flag represents state movement.
- Update tests to assert the behavior selected by the named choice.

## Examples

### Problem: C# boolean arguments hide the selected behavior

The call site tells the reader nothing about what the two flags mean.

```csharp title="Reports/ReportExporter.cs"
public ExportedReport Export(Report report)
{
    return renderer.Render(report, true, false);
}
```

### Better: C# named options expose the choice

The options object names the selected behavior at the call site.

```csharp title="Reports/ReportExporter.cs"
public ExportedReport Export(Report report)
{
    return renderer.Render(report, new RenderOptions(
        IncludeDrafts: true,
        RedactPrivateNotes: false));
}
```

### Problem: Java booleans turn mode into argument order

The reader has to inspect `render` to know what `true, false` selects.

```java title="src/main/java/example/ReportExporter.java"
ExportedReport export(Report report) {
    return renderer.render(report, true, false);
}
```

### Better: Java enum values name the mode

The call names the domain choices instead of relying on boolean position.

```java title="src/main/java/example/ReportExporter.java"
ExportedReport export(Report report) {
    return renderer.render(
        report,
        DraftVisibility.INCLUDE_DRAFTS,
        PrivacyMode.REDACT_PRIVATE_NOTES
    );
}
```

### Problem: Python flags hide behavior in positional calls

The positional booleans make the call compact but opaque.

```python title="reports/export.py"
def export_report(report):
    return render_report(report, True, False)
```

### Better: Python keyword arguments name the choice

Keyword arguments keep the lightweight API while making the behavior visible.

```python title="reports/export.py"
def export_report(report):
    return render_report(
        report,
        include_drafts=True,
        redact_private_notes=False,
    )
```

### Problem: Rust booleans hide the export mode

The signature may be typed, but the call site still makes the reader remember what each boolean
means.

```rust title="src/reports/export.rs"
pub fn export_report(report: &Report) -> ExportedReport {
    render_report(report, true, false)
}
```

### Better: Rust options carry named choices

The struct makes future modes possible without adding more positional flags.

```rust title="src/reports/export.rs"
pub fn export_report(report: &Report) -> ExportedReport {
    render_report(
        report,
        RenderOptions {
            include_drafts: true,
            redact_private_notes: false,
        },
    )
}
```

### Problem: TypeScript boolean arguments hide the selected behavior

The call site tells the reader nothing about what the two flags mean.

```ts title="src/reports/exportReport.ts"
export function exportReport(report: Report) {
  return renderReport(report, true, false);
}
```

### Better: TypeScript named options expose the choice

The call site can be reviewed without jumping into `renderReport`.

```ts title="src/reports/exportReport.ts"
export function exportReport(report: Report) {
  return renderReport(report, {
    includeDrafts: true,
    redactPrivateNotes: false,
  });
}
```
