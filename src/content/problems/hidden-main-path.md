---
title: Hidden Main Path
status: reviewed
category: readability
topics:
  - control-flow
  - cognitive-burden
  - review
summary: The normal path is buried under validation, branching, dense expressions, or incidental
  sequencing.
relatedPatterns:
  - guard-clause
  - return-structured-errors
  - chunk-statements
  - explaining-variable
relatedConcepts:
  - reader-locality
  - cognitive-burden
---

## Description

A hidden main path happens when the ordinary successful behavior is present but not visually
dominant. The reader has to pass through validation, setup, branching, cleanup, or dense expression
logic before they can see the operation the function exists to perform. That weakens [reader
locality](/concepts/reader-locality/) because the important path is no longer where the reader
expects to find it.

This is not only about indentation. A flat expression can hide the main path too when it combines
filtering, naming, sorting, mutation, and fallback behavior in one block. The common smell is that a
small change still requires the reader to reconstruct the whole function before they can tell where
the important path begins.

## Why It Matters

Maintainers need to find the ordinary path before they can judge whether a change preserves it. When
the main path is hidden, reviews spend attention on control-flow reconstruction instead of behavior.
That creates unnecessary [cognitive burden](/concepts/cognitive-burden/) and makes small edits feel
larger than they are.

## Code Impact

The real behavior becomes hard to change because every edit has to preserve a stack of incidental
conditions. People patch the branch they can see, miss the main path they meant to protect, or add
another nested exception instead of simplifying the function.

## Signals

- The function starts with the important work hidden several indentation levels deep.
- A reviewer has to keep several conditions in memory while reading the main behavior.
- A technically short function still feels like a wall because setup, decisions, mutation, and return
  assembly are visually blended.
- Dense expressions combine naming, calculation, branching, and side effects in one place.

## Diagnostic Questions

- What is the one path a maintainer should understand first?
- Which branches are preconditions, empty cases, or unsupported modes?
- Where does the function change from setup to decision to mutation to result assembly?
- Would naming one intermediate value remove a mental calculation from the reader?

## Approach

- Make the main path visible. Use [guard clauses](/patterns/guard-clause/) for boring preconditions
  and keep the valid behavior unindented.
- [Chunk nearby statements](/patterns/chunk-statements/) into logic paragraphs so phase changes are
  visible before a reader studies each line.
- Use an [explaining variable](/patterns/explaining-variable/) when a name carries domain meaning or
  removes repeated expression parsing.
- When early exits represent recoverable failures, keep them in a
  [structured error or result](/patterns/return-structured-errors/) shape instead of burying them in
  control flow.
- Stop before extracting broad architecture; a clearer local shape often solves the problem.

## Examples

These examples show the problem shape, not the finished refactor. In each case, the ordinary work is
present, but the reader has to dig through validation, branching, or dense expressions before they
can see it.

### Problem: Protocol checks hide the frame dispatch

The behavior is to dispatch a valid frame, but null checks, status checks, and frame validation own
the visual shape of the function.

```c title="src/session.c"
int dispatch_session_frame(struct session *session, const struct frame *frame) {
    if (session != NULL) {
        if (session->state == SESSION_READY) {
            if (frame != NULL) {
                if (frame->length > 0 && frame->length <= MAX_FRAME_SIZE) {
                    session_touch(session);
                    return dispatch_frame(session, frame);
                }
                return ERR_BAD_FRAME;
            }
            return ERR_MISSING_FRAME;
        }
        return ERR_SESSION_NOT_READY;
    }
    return ERR_MISSING_SESSION;
}
```

### Better: Reject invalid cases before dispatch

[Guard clauses](/patterns/guard-clause/) leave the frame dispatch left-aligned after the
preconditions.

```c title="src/session.c"
int dispatch_session_frame(struct session *session, const struct frame *frame) {
    if (session == NULL) {
        return ERR_MISSING_SESSION;
    }
    if (session->state != SESSION_READY) {
        return ERR_SESSION_NOT_READY;
    }
    if (frame == NULL) {
        return ERR_MISSING_FRAME;
    }
    if (frame->length == 0 || frame->length > MAX_FRAME_SIZE) {
        return ERR_BAD_FRAME;
    }

    session_touch(session);
    return dispatch_frame(session, frame);
}
```

### Problem: Request checks bury the handler result

The handler should clearly publish the invoice command, but the success path sits inside request,
customer, and authorization checks.

```csharp title="Billing/InvoiceHandler.cs"
public async Task<Result> PublishInvoice(Request request, User user)
{
    if (request is not null)
    {
        if (request.CustomerId is not null)
        {
            if (user.CanPublishInvoices)
            {
                var command = new PublishInvoiceCommand(request.CustomerId.Value);
                await bus.Send(command);
                return Result.Accepted(command.Id);
            }
            return Result.Denied("missing invoice permission");
        }
        return Result.Denied("missing customer id");
    }
    return Result.Denied("missing request");
}
```

### Better: Make the publish path visible

[Guard clauses](/patterns/guard-clause/) name each rejection before building and sending the
command. The `Result` return keeps those failures in a [structured
shape](/patterns/return-structured-errors/) instead of making callers infer them from strings or
nested branches.

```csharp title="Billing/InvoiceHandler.cs"
public async Task<Result> PublishInvoice(Request request, User user)
{
    if (request is null)
        return Result.Denied("missing request");
    if (request.CustomerId is null)
        return Result.Denied("missing customer id");
    if (!user.CanPublishInvoices)
        return Result.Denied("missing invoice permission");

    var command = new PublishInvoiceCommand(request.CustomerId.Value);
    await bus.Send(command);
    return Result.Accepted(command.Id);
}
```

### Problem: Setup branches obscure the export

The export operation is the only domain action, but option checks and repository lookup take over
the function's visual shape.

```cpp title="src/export_report.cpp"
ExportResult export_report(const Request& request, Repository& repository) {
    if (request.report_id.has_value()) {
        auto report = repository.find_report(*request.report_id);
        if (report.has_value()) {
            if (report->is_ready()) {
                auto file = render_report(*report, request.format);
                repository.record_export(report->id(), file.path());
                return ExportResult::ok(file.path());
            }
            return ExportResult::failed("report is not ready");
        }
        return ExportResult::failed("report not found");
    }
    return ExportResult::failed("missing report id");
}
```

### Better: Keep export as the final path

[Guard clauses](/patterns/guard-clause/) return from missing and not-ready cases before rendering
and recording the export. `ExportResult` keeps the failure cases explicit as a [structured
result](/patterns/return-structured-errors/).

```cpp title="src/export_report.cpp"
ExportResult export_report(const Request& request, Repository& repository) {
    if (!request.report_id.has_value()) {
        return ExportResult::failed("missing report id");
    }

    auto report = repository.find_report(*request.report_id);
    if (!report.has_value()) {
        return ExportResult::failed("report not found");
    }
    if (!report->is_ready()) {
        return ExportResult::failed("report is not ready");
    }

    auto file = render_report(*report, request.format);
    repository.record_export(report->id(), file.path());
    return ExportResult::ok(file.path());
}
```

### Problem: Validation wraps the publish path

The report publish path is the behavior worth reviewing, but every precondition controls another
level of indentation before the reader reaches it.

```go title="internal/report/publish.go"
func PublishReport(ctx context.Context, report *Report, user User) error {
    if report != nil {
        if report.Ready {
            if user.CanPublish(report.ProjectID) {
                audit.Log(ctx, "report.publish", report.ID)
                return queue.Publish(ctx, report)
            }
            return ErrPermissionDenied
        }
        return ErrReportNotReady
    }
    return ErrMissingReport
}
```

### Better: Leave publish at the bottom

[Guard clauses](/patterns/guard-clause/) exit each invalid case before the audit and queue publish
path.

```go title="internal/report/publish.go"
func PublishReport(ctx context.Context, report *Report, user User) error {
    if report == nil {
        return ErrMissingReport
    }
    if !report.Ready {
        return ErrReportNotReady
    }
    if !user.CanPublish(report.ProjectID) {
        return ErrPermissionDenied
    }

    audit.Log(ctx, "report.publish", report.ID)
    return queue.Publish(ctx, report)
}
```

### Problem: The normal approval is hidden behind preconditions

The successful approval is one line, but it is visually less important than the checks around it.

```java title="src/main/java/com/example/ApprovalService.java"
final class ApprovalService {
    ApprovalResult approve(Request request, User user) {
        if (request != null) {
            if (request.isComplete()) {
                if (user.hasRole("approver")) {
                    return ApprovalResult.approved(request.id());
                }
                return ApprovalResult.denied("missing approver role");
            }
            return ApprovalResult.denied("request is incomplete");
        }
        return ApprovalResult.denied("missing request");
    }
}
```

### Better: Make approval the visible result

[Guard clauses](/patterns/guard-clause/) keep the approval path out of the precondition checks. In
this version, `ApprovalResult` is the [structured result](/patterns/return-structured-errors/) for
the failure cases. Java code that throws checked exceptions often uses early `throw` statements for
the same shape before the ordinary result.

```java title="src/main/java/com/example/ApprovalService.java"
final class ApprovalService {
    ApprovalResult approve(Request request, User user) {
        if (request == null) {
            return ApprovalResult.denied("missing request");
        }
        if (!request.isComplete()) {
            return ApprovalResult.denied("request is incomplete");
        }
        if (!user.hasRole("approver")) {
            return ApprovalResult.denied("missing approver role");
        }

        return ApprovalResult.approved(request.id());
    }
}
```

### Problem: UI state checks hide the render path

The component's normal job is to render the current panel, but loading, permission, and empty-state
branches take control before the reader reaches the ordinary UI.

```js title="src/DashboardPanel.jsx"
export function DashboardPanel({ session, widgets }) {
  if (session) {
    if (session.user.canViewDashboard) {
      if (widgets.length > 0) {
        return (
          <section>
            <h2>{session.projectName}</h2>
            <WidgetGrid widgets={widgets} />
          </section>
        );
      }
      return <EmptyPanel message="No widgets configured" />;
    }
    return <AccessDenied />;
  }
  return <LoadingPanel />;
}
```

### Better: The UI handles states before rendering the panel

[Guard clauses](/patterns/guard-clause/) make the ordinary dashboard the final render path.

```js title="src/DashboardPanel.jsx"
export function DashboardPanel({ session, widgets }) {
  if (!session) {
    return <LoadingPanel />;
  }
  if (!session.user.canViewDashboard) {
    return <AccessDenied />;
  }
  if (widgets.length === 0) {
    return <EmptyPanel message="No widgets configured" />;
  }

  return (
    <section>
      <h2>{session.projectName}</h2>
      <WidgetGrid widgets={widgets} />
    </section>
  );
}
```

### Problem: Import validation hides the ingestion path

The ingestion step is ordinary work, but file validation, schema lookup, and permission checks make
the reader trace the failure tree before seeing the job creation.

```python title="jobs/import_customers.py"
def import_customers(upload, user, schemas):
    if upload is not None:
        if upload.filename.endswith(".csv"):
            schema = schemas.get("customers")
            if schema is not None:
                if user.can_import_customers:
                    rows = parse_csv(upload.stream, schema)
                    job = enqueue_customer_import(rows, user.id)
                    return ImportResult.accepted(job.id)
                return ImportResult.rejected("missing import permission")
            return ImportResult.rejected("missing customer schema")
        return ImportResult.rejected("unsupported file type")
    return ImportResult.rejected("missing upload")
```

### Better: Show ingestion after the checks

[Guard clauses](/patterns/guard-clause/) make the job creation path visible after file, schema, and
permission checks. `ImportResult` keeps each rejection in a [structured
result](/patterns/return-structured-errors/) for callers.

```python title="jobs/import_customers.py"
def import_customers(upload, user, schemas):
    if upload is None:
        return ImportResult.rejected("missing upload")
    if not upload.filename.endswith(".csv"):
        return ImportResult.rejected("unsupported file type")

    schema = schemas.get("customers")
    if schema is None:
        return ImportResult.rejected("missing customer schema")
    if not user.can_import_customers:
        return ImportResult.rejected("missing import permission")

    rows = parse_csv(upload.stream, schema)
    job = enqueue_customer_import(rows, user.id)
    return ImportResult.accepted(job.id)
```

### Problem: Option handling hides the command execution

The command dispatch is the main path, but the missing-command and authorization cases make the
reader carry context through nested branches first.

```rust title="src/commands.rs"
pub fn run_command(user: &User, command: Option<Command>) -> Result<Output, Error> {
    if let Some(command) = command {
        if user.can_run(&command) {
            let output = command.execute()?;
            Ok(output.with_audit(user.id))
        } else {
            Err(Error::PermissionDenied)
        }
    } else {
        Err(Error::MissingCommand)
    }
}
```

### Better: Unwrap preconditions before execution

Rust's `?` operator uses the normal `Result` failure channel for the missing-command case, while a
local [guard clause](/patterns/guard-clause/) handles the permission check before command execution.
The `Error` variants are the [structured errors](/patterns/return-structured-errors/); `?` just
keeps that path out of the main path.

```rust title="src/commands.rs"
pub fn run_command(user: &User, command: Option<Command>) -> Result<Output, Error> {
    let command = command.ok_or(Error::MissingCommand)?;

    if !user.can_run(&command) {
        return Err(Error::PermissionDenied);
    }

    let output = command.execute()?;
    Ok(output.with_audit(user.id))
}
```

### Problem: Dense filtering hides the rule being applied

The intended rule is "show reviewed public entries first", but the expression mixes visibility,
maturity, sorting, mapping, and fallback behavior in one visual block.

```ts title="src/catalog.ts"
export function visibleEntries(entries: Entry[], viewer: Viewer): Card[] {
  return entries
    .filter((entry) => (viewer.staff || entry.public) && entry.status !== 'seed')
    .sort((left, right) =>
      Number(right.status === 'reviewed') - Number(left.status === 'reviewed') ||
      left.title.localeCompare(right.title),
    )
    .map((entry) => ({
      title: entry.title,
      badge: entry.status === 'reviewed' ? 'Reviewed' : 'Draft',
      href: `/entries/${entry.slug}`,
    }));
}
```

### Better: Name the rule before mapping

[Explaining variables](/patterns/explaining-variable/) name the filtering and ranking rules before
the final card mapping.

```ts title="src/catalog.ts"
export function visibleEntries(entries: Entry[], viewer: Viewer): Card[] {
  const visibleEntries = entries.filter((entry) => {
    const canSeeEntry = viewer.staff || entry.public;
    return canSeeEntry && entry.status !== 'seed';
  });

  const reviewedFirst = (left: Entry, right: Entry) =>
    Number(right.status === 'reviewed') - Number(left.status === 'reviewed') ||
    left.title.localeCompare(right.title);

  return visibleEntries.sort(reviewedFirst).map((entry) => ({
    title: entry.title,
    badge: entry.status === 'reviewed' ? 'Reviewed' : 'Draft',
    href: `/entries/${entry.slug}`,
  }));
}
```
