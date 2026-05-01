---
title: >-
  Boolean Argument Hides a Choice
status: reviewed
category: state
topics:
  - api-design
  - readability
  - control-flow
  - parameters
summary: >-
  A boolean argument carries a hidden choice across a function boundary until the call site no
  longer explains itself.
relatedPatterns:
  - replace-boolean-flag-with-choice
  - split-flag-into-named-operations
  - make-parameters-explicit
  - make-state-transitions-explicit
  - make-invalid-states-hard-to-express
relatedConcepts:
  - cognitive-burden
  - reader-locality
  - state-space
---

## Description

A boolean argument hides a choice when a call passes `true` or `false` to select behavior. The
callee may have a meaningful parameter name, but the caller only shows a truth value.

A local boolean fact beside the branch that uses it is usually fine. The problem starts when the
boolean crosses an API boundary, when the flag controls a meaningful action, or when more states
start appearing as `null`, comments, strings, or additional booleans.

## Why It Matters

Boolean arguments make the reader carry the meaning of the truth value in memory. That raises
[cognitive burden](/concepts/cognitive-burden/) and lowers [reader
locality](/concepts/reader-locality/) because the explanation lives in the callee instead of at the
call site.

## Code Impact

One boolean can hide a real domain choice. Additional flags expand the [state
space](/concepts/state-space/), invalid combinations become representable, and tests start naming
boolean values instead of the behavior those values select.

## Signals

- Call sites pass `true` or `false` and the meaning is not obvious from the function name.
- A boolean parameter controls a lifecycle, mode, permission, rendering choice, or side effect.
- More states appear as `null`, comments, stringly typed values, or another flag.
- Tests describe the boolean value instead of the behavior selected by that value.
- The same flag means different things in nearby functions.

## Diagnostic Questions

- What domain choice does this boolean represent?
- Is the boolean a local fact, or does it cross a function, module, or API boundary?
- Does the avoided or selected thing have a good noun name?
- Is the important name the action being taken by the function?
- Would an enum, union, named options object, custom type, or separate named method make the call
  readable?
- Are these states mutually exclusive?
- Can invalid combinations be made harder to express?

## Approach

- Use [Replace Boolean Flag With Choice](/patterns/replace-boolean-flag-with-choice/) when a flag
  selects a noun-like domain choice across a boundary.
- Use [Split Flag Into Named Operations](/patterns/split-flag-into-named-operations/) when the flag
  selects a different verb and the action name can carry the distinction.
- Use [Make Parameters Explicit](/patterns/make-parameters-explicit/) or a named options object when
  several values travel together.
- Keep local boolean facts when the name is visible beside the branch.
- Move lifecycle choices into
  [Make State Transitions Explicit](/patterns/make-state-transitions-explicit/) if the flag
  represents state movement.
- Use [Make Invalid States Hard To Express](/patterns/make-invalid-states-hard-to-express/) when
  independent flags allow impossible combinations.
- Update tests to assert the behavior selected by the named choice.

## Examples

### Problem: a truth value hides the choice

The caller has to know what `true` means before reviewing the behavior.

```c title="src/report_export.c"
ExportedReport export_report(const Report *report) {
    return render_report(report, true);
}
```

### Better: a small options struct names the choice

The custom type names the selected behavior at the point of use.

```c title="src/report_export.c"
typedef struct {
    bool include_drafts;
} RenderOptions;

ExportedReport export_report(const Report *report) {
    RenderOptions options = {
        .include_drafts = true,
    };
    return render_report(report, options);
}
```

### Problem: a typed call still hides the choice

The function call is typed, but the selected behavior still reads as a truth value.

```cpp title="src/report_export.cpp"
ExportedReport export_report(const Report& report) {
    return render_report(report, true);
}
```

### Better: a scoped enum names the mode

The call site names the mutually exclusive choice directly.

```cpp title="src/report_export.cpp"
enum class DraftVisibility { ExcludeDrafts, IncludeDrafts };

ExportedReport export_report(const Report& report) {
    return render_report(report, DraftVisibility::IncludeDrafts);
}
```

### Problem: a renderer call hides selected behavior

The call site tells the reader nothing about what the flag means.

```csharp title="Reports/ReportExporter.cs"
public ExportedReport Export(Report report)
{
    return renderer.Render(report, true);
}
```

### Better: named operations expose the action

The public methods name what the caller intends to do.

```csharp title="Reports/ReportExporter.cs"
public ExportedReport ExportDraft(Report report) =>
    ExportWithMode(report, ExportMode.Draft);

public ExportedReport ExportFinal(Report report) =>
    ExportWithMode(report, ExportMode.Final);
```

### Problem: an exported helper hides the choice

The reader has to inspect `renderReport` to know what `true` selects.

```go title="reports/export.go"
func ExportReport(report Report) ExportedReport {
    return renderReport(report, true)
}
```

### Better: exported functions expose the action

The exported functions carry the choice in their names.

```go title="reports/export.go"
func ExportDraftReport(report Report) ExportedReport {
    return exportReportWithMode(report, exportDraft)
}

func ExportFinalReport(report Report) ExportedReport {
    return exportReportWithMode(report, exportFinal)
}
```

### Problem: a mode turns into a boolean

The reader has to inspect `render` to know what `true` selects.

```java title="src/main/java/example/ReportExporter.java"
ExportedReport export(Report report) {
    return renderer.render(report, true);
}
```

### Better: an enum constant names the mode

The call names the domain choice instead of relying on a boolean.

```java title="src/main/java/example/ReportExporter.java"
ExportedReport export(Report report) {
    return renderer.render(report, DraftVisibility.INCLUDE_DRAFTS);
}
```

### Problem: a UI export call hides the choice

The boolean makes the JavaScript call compact but opaque.

```js title="src/reports/exportReport.js"
export function exportReport(report) {
  return renderReport(report, true);
}
```

### Better: named functions expose the action

The exported function names carry the behavior.

```js title="src/reports/exportReport.js"
export function exportDraftReport(report) {
  return renderReportWithMode(report, 'draft');
}

export function exportFinalReport(report) {
  return renderReportWithMode(report, 'final');
}
```

### Problem: a positional flag hides behavior

The positional boolean makes the call compact but opaque.

```python title="reports/export.py"
def export_report(report):
    return render_report(report, True)
```

### Better: a keyword argument names behavior

Keyword arguments keep the lightweight API while making the behavior visible.

```python title="reports/export.py"
def export_report(report):
    return render_report(
        report,
        include_drafts=True,
    )
```

### Problem: a typed signature still hides mode

The signature may be typed, but the call site still makes the reader remember what the boolean
means.

```rust title="src/reports/export.rs"
pub fn export_report(report: &Report) -> ExportedReport {
    render_report(report, true)
}
```

### Better: a custom type carries the named choice

The custom type gives the choice a name at the boundary.

```rust title="src/reports/export.rs"
pub fn export_report(report: &Report) -> ExportedReport {
    render_report(report, DraftVisibility::IncludeDrafts)
}
```

### Problem: a typed call still hides selected behavior

The call site tells the reader nothing about what the flag means.

```ts title="src/reports/exportReport.ts"
export function exportReport(report: Report) {
  return renderReport(report, true);
}
```

### Better: named functions expose selected behavior

The function names carry the distinction that was hidden in the boolean.

```ts title="src/reports/exportReport.ts"
export function exportDraftReport(report: Report): ExportedReport {
  return renderReportWithMode(report, 'draft');
}

export function exportFinalReport(report: Report): ExportedReport {
  return renderReportWithMode(report, 'final');
}
```

## References

- [Rust API Guidelines: Custom types provide type safety
  (C-CUSTOM-TYPE)](https://rust-lang.github.io/api-guidelines/type-safety.html#c-custom-type)
