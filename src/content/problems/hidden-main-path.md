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

### Validation wraps the publish path

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

### The normal approval is hidden behind preconditions

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

### Defensive DOM checks own the function shape

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

### Option handling hides the command execution

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

### Dense filtering hides the rule being applied

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
