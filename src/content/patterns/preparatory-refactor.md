---
title: >-
  Preparatory Refactor
summary: >-
  Make the smallest behavior-preserving structure change that gives the real behavior change a
  clear place to land.
status: draft
tags:
  - "workflow"
  - "refactoring"
  - "review"
  - "change-risk"
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
  - "A behavior change is hard to review because the surrounding code is not shaped for the new rule."
concepts:
  - "structure-vs-behavior"
  - "change-economics"
  - "review-batch-size"
related:
  - "separate-structure-from-behavior"
  - "untangle-before-changing"
  - "characterize-before-changing"
  - "keep-structure-reversible"
---

## Core Idea

A preparatory refactor changes structure so the next behavior change can be small and obvious. It
does not smuggle the behavior change into the refactor. The reviewer should be able to check the
preparation as behavior-preserving, then review the actual rule change with less noise.

Use this pattern when the current shape makes the intended change hard to express: a condition has
no local name, a policy is mixed with formatting, a test cannot point at the behavior, or the new
rule would otherwise land inside a dense block.

The tradeoff is speculative cleanup. Prepare only the part of the code that blocks the current
change. If the preparation creates a framework, public contract, or broad extension point, it may be
premature architecture rather than preparation.

## Use When

- A small structure change would make the intended behavior change much easier to review.
- The behavior change currently has no clear owner or local landing place.
- A test or characterization step can show the preparation preserved existing behavior.

## Guidance

- Keep the preparatory refactor behavior-preserving and reviewable on its own.
- Move, rename, extract, or group only enough code to expose the next behavior change.
- Follow the preparation with a separate behavior change so reviewers can see what actually changed.
- Match the review unit to the project. Some teams prefer a separate commit in one PR; others
  prefer a separate PR when the refactor can land independently or would distract from the behavior
  discussion.

## Tradeoffs

- Do not tidy unrelated code because a change is nearby.
- Separate PRs reduce review noise but can add coordination cost, especially when the behavior
  change depends on the preparation landing first.
- Avoid creating new extension points unless repeated variation already proves the need.
- Legacy code may need characterization before preparation is credible as behavior-preserving.

## Agent Instruction

If the requested behavior change needs preparation, first make the smallest behavior-preserving
refactor that gives the change a clear landing place. Verify that preparation independently, then
make the behavior change separately.

## Examples

Each set shows current code, then a behavior-preserving preparatory refactor, then the behavior
change that becomes smaller because the preparation landed first.

### Problem: Protocol-version validation would land inside dispatch

Upcoming change: version 2 frames may use a larger maximum size. In the current shape, that rule
would be edited inside dispatch, session checks, and frame validation at once.

```c title="src/session.c"
int dispatch_session_frame(struct session *session, const struct frame *frame) {
    if (session == NULL || frame == NULL) {
        return ERR_BAD_INPUT;
    }
    if (session->state != SESSION_READY) {
        return ERR_SESSION_NOT_READY;
    }
    if (frame->length == 0 || frame->length > MAX_FRAME_SIZE) {
        return ERR_BAD_FRAME;
    }

    return dispatch_frame(session, frame);
}
```

### Better: Extract validation before changing the rule

This preparation names the existing validation without changing it. The later version-specific
frame-size rule can alter `validate_frame` in a separate behavior change.

```c title="src/session.c"
static int validate_frame(const struct frame *frame) {
    if (frame == NULL) {
        return ERR_BAD_INPUT;
    }
    if (frame->length == 0 || frame->length > MAX_FRAME_SIZE) {
        return ERR_BAD_FRAME;
    }

    return 0;
}

int dispatch_session_frame(struct session *session, const struct frame *frame) {
    if (session == NULL) {
        return ERR_BAD_INPUT;
    }
    if (session->state != SESSION_READY) {
        return ERR_SESSION_NOT_READY;
    }

    int error = validate_frame(frame);
    if (error != 0) {
        return error;
    }

    return dispatch_frame(session, frame);
}
```

### After: Add the version-specific rule

The behavior change is now isolated to validation. The dispatch path is not part of the behavioral
diff.

```c title="src/session.c"
static size_t max_frame_size_for(unsigned version) {
    return version == 2 ? MAX_V2_FRAME_SIZE : MAX_FRAME_SIZE;
}

static int validate_frame(const struct frame *frame) {
    if (frame == NULL) {
        return ERR_BAD_INPUT;
    }
    if (frame->length == 0 || frame->length > max_frame_size_for(frame->version)) {
        return ERR_BAD_FRAME;
    }

    return 0;
}
```

### Problem: Archive policy would land inside rendering

Upcoming change: archived reports should hide export links unless the user is an auditor. In the
current shape, that policy would be edited inside string rendering.

```cpp title="src/report_view.cpp"
std::string render_report_link(const Report& report, const User& user) {
    if (report.ready() && user.can_export(report.project_id())) {
        return "<a href=\"/exports/" + report.id() + "\">Export</a>";
    }

    return "";
}
```

### Better: Name the export policy before changing it

This preparation creates one policy function without changing behavior. The archive/auditor rule can
land there next.

```cpp title="src/report_view.cpp"
bool can_show_export_link(const Report& report, const User& user) {
    return report.ready() && user.can_export(report.project_id());
}

std::string render_report_link(const Report& report, const User& user) {
    if (!can_show_export_link(report, user)) {
        return "";
    }

    return "<a href=\"/exports/" + report.id() + "\">Export</a>";
}
```

### After: Add the archive exception

The behavior change is one policy edit. Rendering remains unchanged.

```cpp title="src/report_view.cpp"
bool can_show_export_link(const Report& report, const User& user) {
    if (report.archived() && !user.is_auditor()) {
        return false;
    }

    return report.ready() && user.can_export(report.project_id());
}
```

### Problem: Delegated approval would land inside formatting

Upcoming change: delegated approvers can approve complete requests. In the current shape, that
policy would be edited in summary rendering.

```csharp title="Approvals/ApprovalSummary.cs"
public string RenderSummary(Request request, User user)
{
    var badge = request.IsComplete && user.HasRole("approver")
        ? "Ready"
        : "Blocked";

    return $"<span>{badge}</span>";
}
```

### Better: Extract the existing decision before changing it

This preparation names the current approval decision without changing it. The delegation rule can
land in `CanApprove` next.

```csharp title="Approvals/ApprovalSummary.cs"
public string RenderSummary(Request request, User user)
{
    var badge = CanApprove(request, user) ? "Ready" : "Blocked";
    return $"<span>{badge}</span>";
}

private static bool CanApprove(Request request, User user)
{
    return request.IsComplete && user.HasRole("approver");
}
```

### After: Add delegated approval

The behavior change is now a policy change. The summary markup does not move.

```csharp title="Approvals/ApprovalSummary.cs"
private static bool CanApprove(Request request, User user)
{
    return request.IsComplete
        && (user.HasRole("approver") || user.CanApproveFor(request.OwnerId));
}
```

### Problem: SMS delivery would land inside email formatting

Upcoming change: users with phone numbers should also receive SMS notifications. In the current
shape, delivery choice and message creation are one edit target.

```go title="internal/notify/orders.go"
func NotifyOrder(ctx context.Context, order Order, user User) error {
    message := fmt.Sprintf("Order %s is ready", order.ID)
    if user.Email != "" {
        return email.Send(ctx, user.Email, message)
    }

    return nil
}
```

### Better: Separate message creation from delivery

This preparation keeps email behavior the same while separating the reusable message. The SMS
delivery change can then focus on delivery choice.

```go title="internal/notify/orders.go"
func orderReadyMessage(order Order) string {
    return fmt.Sprintf("Order %s is ready", order.ID)
}

func NotifyOrder(ctx context.Context, order Order, user User) error {
    if user.Email == "" {
        return nil
    }

    return email.Send(ctx, user.Email, orderReadyMessage(order))
}
```

### After: Add the second delivery path

The behavior change can focus on delivery. Message formatting stays in one place.

```go title="internal/notify/orders.go"
func NotifyOrder(ctx context.Context, order Order, user User) error {
    message := orderReadyMessage(order)
    if user.Email != "" {
        if err := email.Send(ctx, user.Email, message); err != nil {
            return err
        }
    }
    if user.Phone != "" {
        return sms.Send(ctx, user.Phone, message)
    }

    return nil
}
```

### Problem: Legacy fallback would land inside lookup

Upcoming change: old slugs should fall back to a legacy index. In the current shape, the fallback
would be mixed into lookup and not-found behavior.

```java title="CatalogService.java"
Pattern loadPattern(String slug) {
    return repository.findBySlug(slug)
        .orElseThrow(() -> new NotFoundException(slug));
}
```

### Better: Extract the lookup before adding fallback

This preparation names the existing lookup without changing behavior. The legacy fallback can be
added after this step is reviewed.

```java title="CatalogService.java"
Optional<Pattern> findCurrentPattern(String slug) {
    return repository.findBySlug(slug);
}

Pattern loadPattern(String slug) {
    return findCurrentPattern(slug)
        .orElseThrow(() -> new NotFoundException(slug));
}
```

### After: Add legacy fallback

The behavior change adds fallback without rewriting the not-found handling.

```java title="CatalogService.java"
Pattern loadPattern(String slug) {
    return findCurrentPattern(slug)
        .or(() -> legacyIndex.findBySlug(slug))
        .orElseThrow(() -> new NotFoundException(slug));
}
```

### Problem: Permission state would land inside the render expression

Upcoming change: users without dashboard access should see an access-denied panel. In the current
shape, that state would be added to the same expression that renders empty and successful panels.

```js title="src/dashboardPanel.js"
export function dashboardPanel(session, widgets) {
  return widgets.length === 0
    ? EmptyPanel({ message: 'No widgets configured' })
    : WidgetGrid({ title: session.projectName, widgets });
}
```

### Better: Name the current state before adding another one

This preparation names the current empty-state decision. The permission rule can land next to it in
a separate behavior change.

```js title="src/dashboardPanel.js"
function isEmptyDashboard(widgets) {
  return widgets.length === 0;
}

export function dashboardPanel(session, widgets) {
  if (isEmptyDashboard(widgets)) {
    return EmptyPanel({ message: 'No widgets configured' });
  }

  return WidgetGrid({ title: session.projectName, widgets });
}
```

### After: Add the permission state

The behavior change adds another state next to the existing state checks. The successful render path
stays readable.

```js title="src/dashboardPanel.js"
export function dashboardPanel(session, widgets) {
  if (!session.user.canViewDashboard) {
    return AccessDeniedPanel();
  }
  if (isEmptyDashboard(widgets)) {
    return EmptyPanel({ message: 'No widgets configured' });
  }

  return WidgetGrid({ title: session.projectName, widgets });
}
```

### Problem: Required-field validation would land inside file loading

Upcoming change: imported patterns must include a title. In the current shape, that validation would
be added to the same function that opens the file and performs the import.

```python title="import_patterns.py"
def import_patterns(path):
    with open(path) as file:
        rows = csv.DictReader(file)
        return import_rows(rows)
```

### Better: Separate loading before changing import policy

This preparation keeps file loading behavior separate from import policy. The required-field rule
can land after loading has one name.

```python title="import_patterns.py"
def load_pattern_rows(path):
    with open(path) as file:
        return list(csv.DictReader(file))

def import_patterns(path):
    rows = load_pattern_rows(path)
    return import_rows(rows)
```

### After: Add required-field validation

The behavior change can validate rows without changing file loading.

```python title="import_patterns.py"
def import_patterns(path):
    rows = load_pattern_rows(path)
    validate_required_fields(rows, required=["title"])
    return import_rows(rows)
```

### Problem: Required-title validation would land inside parsing

Upcoming change: imported records must reject missing titles. In the current shape, that validation
would be mixed into parsing, making it harder to prove whether parsing changed.

```rust title="src/import.rs"
pub fn import_line(line: &str) -> Result<Record, ImportError> {
    let fields: Vec<_> = line.split(',').collect();
    if fields.is_empty() {
        return Err(ImportError::Empty);
    }

    Ok(Record::new(fields))
}
```

### Better: Extract parsing before adding validation

This preparation keeps parsing behavior visible. The later required-title rule can be added after
this step is checked.

```rust title="src/import.rs"
pub fn import_line(line: &str) -> Result<Record, ImportError> {
    let fields = parse_fields(line)?;
    Ok(Record::new(fields))
}

fn parse_fields(line: &str) -> Result<Vec<&str>, ImportError> {
    let fields: Vec<_> = line.split(',').collect();
    if fields.is_empty() {
        return Err(ImportError::Empty);
    }

    Ok(fields)
}
```

### After: Add required-title validation

The behavior change validates the parsed record. The parser extraction remains reviewable as the
previous step.

```rust title="src/import.rs"
pub fn import_line(line: &str) -> Result<Record, ImportError> {
    let fields = parse_fields(line)?;
    let record = Record::new(fields);
    record.require_title()?;

    Ok(record)
}
```

### Problem: Reviewed-first visibility would land inside a dense pipeline

Upcoming change: reviewed public entries should appear before draft entries. In the current shape,
that rule would be edited in the same expression that filters, sorts, and maps cards.

```ts title="src/catalog.ts"
export function visibleCards(patterns: Pattern[]): Card[] {
  return patterns
    .filter((pattern) => pattern.status !== 'archived')
    .sort((left, right) => left.title.localeCompare(right.title))
    .map((pattern) => ({ title: pattern.title, href: pattern.href }));
}
```

### Better: Name the current rule before changing it

This preparation gives the current visibility rule a named predicate. The reviewed-first behavior
can then change the filtering or sorting rule separately.

```ts title="src/catalog.ts"
const isVisiblePattern = (pattern: Pattern) => pattern.status !== 'archived';

export function visibleCards(patterns: Pattern[]): Card[] {
  return patterns
    .filter(isVisiblePattern)
    .sort((left, right) => left.title.localeCompare(right.title))
    .map((pattern) => ({ title: pattern.title, href: pattern.href }));
}
```

### After: Add reviewed-first ordering

The behavior change can alter ranking while the filter name still carries the existing visibility
rule.

```ts title="src/catalog.ts"
const reviewedFirst = (left: Pattern, right: Pattern) =>
  Number(right.status === 'reviewed') - Number(left.status === 'reviewed') ||
  left.title.localeCompare(right.title);

export function visibleCards(patterns: Pattern[]): Card[] {
  return patterns
    .filter(isVisiblePattern)
    .sort(reviewedFirst)
    .map((pattern) => ({ title: pattern.title, href: pattern.href }));
}
```

## References

- [Ed Page: PR Style, “Split out refactors (C-SPLIT)”](https://epage.github.io/dev/pr-style/#c-split)
  describes splitting refactors from behavior changes so reviewers can follow the change.
- [Tidy First?: Separate Tidying](https://www.oreilly.com/library/view/tidy-first/9781098151232/ch16.html)
  frames tidying as separate from behavior change.
