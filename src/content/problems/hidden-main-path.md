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
  - chunk-statements
  - explaining-variable
relatedConcepts:
  - reader-locality
  - cognitive-burden
---

## Impact

Readers spend their attention reconstructing execution order instead of judging whether the behavior
is correct. That makes small reviews feel larger than they are and encourages agents to rewrite more
code than the change requires.

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

- Make the main path visible. Use guard clauses for boring preconditions and keep the valid behavior
  unindented.
- Chunk nearby statements into logic paragraphs so phase changes are visible before a reader studies
  each line.
- Name intermediate decisions when the name carries domain meaning or removes repeated expression
  parsing.
- Stop before extracting broad architecture; a clearer local shape often solves the problem.

## Examples

These examples show the problem shape, not the finished refactor. In each case, the ordinary work is
present, but the reader has to dig through validation, branching, or dense expressions before they
can see it.

### Problem: C cleanup checks hide the socket read

The behavior is to read a frame, but the real path is buried under resource checks and manual
cleanup concerns.

```c title="src/session.c"
int read_session_frame(struct session *session, struct frame *out) {
    if (session != NULL) {
        if (session->socket >= 0) {
            if (out != NULL) {
                int bytes = socket_read(session->socket, out->buffer, FRAME_SIZE);
                if (bytes > 0) {
                    out->length = bytes;
                    session_touch(session);
                    return 0;
                }
                return ERR_EMPTY_READ;
            }
            return ERR_MISSING_OUTPUT;
        }
        return ERR_CLOSED_SOCKET;
    }
    return ERR_MISSING_SESSION;
}
```

### Problem: C# request checks bury the handler result

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

### Problem: C++ setup branches obscure the export

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

### Problem: Defensive DOM checks own the function shape

The event binding is the normal work, but the function makes the reader enter the defensive branch
before they can see it.

```js title="src/search.js"
export function attachSearch(input, results) {
  if (input && results) {
    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      results.dataset.query = query;
      renderResults(results, query);
    });
  }
}
```

### Problem: Import validation hides the Python ingestion path

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

## Review Notes

This is the first file-backed problem page. Frontmatter carries the routing, maturity, summary, and
relationships. The Markdown sections are parsed into the structured fields used by the existing
problem layout.
