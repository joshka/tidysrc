---
title: >-
  Cross-cutting policy scattered
status: draft
category: architecture
topics:
  - policy
  - change-radius
  - duplication
summary: >-
  Authorization, retries, rate limits, logging, validation, or formatting rules are copied across
  unrelated paths.
relatedPatterns:
  - cap-change-radius
  - reader-locality
  - avoid-premature-agent-architecture
relatedConcepts:
  - change-radius
  - reader-locality
  - observable-behavior
---

## Impact

Each copy can drift. Reviewers must inspect every path to know whether the policy still applies
consistently, and a small policy change turns into a wide edit.

## Signals

- Several handlers repeat the same permission check or retry condition.
- A policy change requires edits in many feature files.
- Tests cover the policy in one path but not the copies.
- A helper exists but has a weak name or lives far from the boundary that owns the policy.

## Diagnostic Questions

- Which boundary should own this policy?
- Is the repeated code a real shared concept or just similar mechanics?
- What context must remain visible at each call site?
- Would centralizing the policy reduce future change radius without hiding behavior?

## Approach

- Move real policies to the boundary that owns the decision.
- Keep call sites explicit about the domain action being protected.
- Avoid generic policy frameworks when one or two local helpers would explain the rule.
- Test the policy through observable behavior on representative paths.

## Examples

### Problem: Handlers copy the same policy

Each route owns a slightly different version of the authorization rule.

```csharp title="Api/ReportsController.cs"
public IActionResult Publish(Guid reportId)
{
    if (!User.IsInRole("admin") && !User.HasClaim("reports", "publish"))
    {
        return Forbid();
    }

    reports.Publish(reportId);
    return Accepted();
}
```

### Problem: Java controllers copy authorization checks

Each handler can drift when the publishing policy changes.

```java title="src/main/java/example/ReportsController.java"
Response publish(User user, ReportId reportId) {
    if (!user.hasRole("admin") && !user.can("reports:publish")) {
        return Response.forbidden();
    }

    reports.publish(reportId);
    return Response.accepted();
}
```

### Better: Java boundary names the policy

The handler keeps the protected action visible while the rule has one owner.

```java title="src/main/java/example/ReportsController.java"
Response publish(User user, ReportId reportId) {
    if (!reportPolicy.canPublish(user, reportId)) {
        return Response.forbidden();
    }

    reports.publish(reportId);
    return Response.accepted();
}
```

### Problem: Python routes repeat the same permission rule

The rule is easy to copy and hard to update consistently.

```python title="reports/routes.py"
def publish_report(user, report_id):
    if not user.is_admin and "reports:publish" not in user.permissions:
        raise Forbidden()
    reports.publish(report_id)
```

### Better: Python route calls a named policy

The route still shows the decision point without owning the rule.

```python title="reports/routes.py"
def publish_report(user, report_id):
    if not report_policy.can_publish(user, report_id):
        raise Forbidden()
    reports.publish(report_id)
```

### Problem: Rust handlers repeat the same guard

The permission check becomes a scattered policy instead of a boundary decision.

```rust title="src/reports/routes.rs"
pub fn publish(user: &User, report_id: ReportId) -> Result<Response, Error> {
    if !user.is_admin() && !user.has_permission("reports:publish") {
        return Err(Error::Forbidden);
    }

    reports::publish(report_id)?;
    Ok(Response::accepted())
}
```

### Better: Rust handler names the policy

The policy boundary owns how permissions map to this action.

```rust title="src/reports/routes.rs"
pub fn publish(user: &User, report_id: ReportId) -> Result<Response, Error> {
    report_policy::require_publish(user, report_id)?;
    reports::publish(report_id)?;
    Ok(Response::accepted())
}
```

### Problem: TypeScript handlers copy authorization logic

Every endpoint has to remember the same role and permission combination.

```ts title="src/reports/routes.ts"
export async function publishReport(user: User, reportId: string) {
  if (!user.roles.includes('admin') && !user.permissions.includes('reports:publish')) {
    throw new ForbiddenError();
  }

  await reports.publish(reportId);
}
```

### Better: TypeScript handler calls the policy

The endpoint names the protected action and leaves the rule in one place.

```ts title="src/reports/routes.ts"
export async function publishReport(user: User, reportId: ReportId) {
  await reportPolicy.requirePublish(user, reportId);
  await reports.publish(reportId);
}
```

### Better: The boundary names the policy

The handler still shows what is protected, while the policy has one owner.

```csharp title="Api/ReportsController.cs"
public IActionResult Publish(Guid reportId)
{
    if (!reportPolicy.CanPublish(User, reportId))
    {
        return Forbid();
    }

    reports.Publish(reportId);
    return Accepted();
}
```
