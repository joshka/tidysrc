---
title: >-
  Wide Change Radius
status: reviewed
category: change-risk
topics:
  - change-radius
  - review
  - ownership
summary: >-
  A small rule change spreads across files, tests, and callers that do not own the rule.
relatedPatterns:
  - name-coupling
  - cap-change-radius
  - separate-structure-from-behavior
  - smallest-trustworthy-verification
relatedConcepts:
  - change-radius
  - structure-vs-behavior
---

## Description

A small rule change spreads across files, tests, and callers that do not own the rule.

The problem is not the existence of the mechanism itself. It is that the ownership, boundary, or
contract is implicit enough that each caller can interpret it differently.

## Why It Matters

The review becomes larger than the behavior. More files mean more merge risk, more verification
work, and more chances for a reviewer to miss the one path that still uses the old rule.

Reviewers care because the risk is not visible at one call site. They have to reconstruct the
intended behavior from scattered branches, tests, and boundaries before they can tell whether the
change is safe.

## Code Impact

Related checks, state changes, defaults, errors, or side effects spread across files. A future edit
can update one path while leaving another path with the old rule. Tests then tend to protect one
example rather than the contract that all callers rely on.

## Signals

- One condition is copied across views, handlers, tests, and helpers.
- A small wording or policy change touches many unrelated files.
- Reviewers cannot find the one file that owns the behavior.
- A type or config change creates mechanical edits mixed with behavior edits.

## Diagnostic Questions

- Which boundary should own this rule?
- Which touched files are mechanical fallout?
- Can structural changes be stacked before the behavior change?
- Would a precise type or policy object reduce future edit sites?

## Approach

- Move the rule to the boundary that owns it before updating every caller. Use
  [Cap Change Radius](/patterns/cap-change-radius/) when one behavior change is creating
  unrelated edits.
- Separate mechanical radius from behavior radius when both are needed. Use
  [Separate Structure From Behavior](/patterns/separate-structure-from-behavior/) when the
  extraction or type change should be reviewed apart from the rule change.
- Use [Smallest Trustworthy Verification](/patterns/smallest-trustworthy-verification/) after
  each unit of the change.
- Avoid centralizing unrelated rules only to reduce file count.

## Examples

### Problem: C# rule is copied across callers

Changing the approval threshold now touches the API and the background job.

```csharp title="Approvals/Api.cs"
void ApproveFromApi(User user, Request request) {
    if (request.Total < 5000 || user.IsManager) Approve(request);
}

void SendReminder(Request request) {
    if (request.Total < 5000 || request.Owner.IsManager) SendAutoApprovalNotice(request);
}
```

### Better: C# rule has one owner

Callers ask the owning boundary instead of copying the condition.

```csharp title="Approvals/Api.cs"
void ApproveFromApi(User user, Request request) {
    if (approvalPolicy.CanApprove(user, request)) Approve(request);
}

void SendReminder(Request request) {
    if (approvalPolicy.CanApprove(request.Owner, request)) SendAutoApprovalNotice(request);
}
```

### Problem: Java rule change spreads through handlers

Each handler owns a copy of the same threshold and manager exception.

```java title="src/main/java/example/Approvals.java"
void approveFromApi(User user, Request request) {
    if (request.total().compareTo(LIMIT) < 0 || user.isManager()) {
        approve(request);
    }
}

void sendReminder(Request request) {
    if (request.total().compareTo(LIMIT) < 0 || request.owner().isManager()) {
        sendAutoApprovalNotice(request);
    }
}
```

### Better: Java boundary owns the rule

The change radius collapses to the owning rule and its tests.

```java title="src/main/java/example/Approvals.java"
void approveFromApi(User user, Request request) {
    if (approvalPolicy.canApprove(user, request)) {
        approve(request);
    }
}

void sendReminder(Request request) {
    if (approvalPolicy.canApprove(request.owner(), request)) {
        sendAutoApprovalNotice(request);
    }
}
```

### Problem: Python condition is copied into views and jobs

One business rule creates several edit sites.

```python title="approvals/views.py"
def approve_from_view(user, request):
    if request.total < 5000 or user.is_manager:
        approve(request)

def send_reminder(request):
    if request.total < 5000 or request.owner.is_manager:
        send_auto_approval_notice(request)
```

### Better: Python rule moves to the owning boundary

Callers share the rule without hiding the action.

```python title="approvals/views.py"
def approve_from_view(user, request):
    if approval_policy.can_approve(user, request):
        approve(request)

def send_reminder(request):
    if approval_policy.can_approve(request.owner, request):
        send_auto_approval_notice(request)
```

### Problem: Rust rule is duplicated across commands

The same threshold appears in multiple workflows.

```rust title="src/approvals.rs"
pub fn approve_from_command(user: &User, request: &Request) -> Result<()> {
    if request.total < MONEY_LIMIT || user.is_manager() {
        approve(request)?;
    }

    Ok(())
}

pub fn send_reminder(request: &Request) -> Result<()> {
    if request.total < MONEY_LIMIT || request.owner.is_manager() {
        send_auto_approval_notice(request)?;
    }

    Ok(())
}
```

### Better: Rust owns the change point

The caller still names the action under review.

```rust title="src/approvals.rs"
pub fn approve_from_command(user: &User, request: &Request) -> Result<()> {
    if approval_policy.can_approve(user, request) {
        approve(request)?;
    }

    Ok(())
}

pub fn send_reminder(request: &Request) -> Result<()> {
    if approval_policy.can_approve(request.owner(), request) {
        send_auto_approval_notice(request)?;
    }

    Ok(())
}
```

### Problem: TypeScript rule leaks into UI and API

A threshold change becomes a broad diff.

```ts title="src/approvals/actions.ts"
export function approveFromAction(user: User, request: Request) {
  if (request.total < 5000 || user.isManager) {
    approve(request);
  }
}

export function showReminderBanner(request: Request) {
  if (request.total < 5000 || request.owner.isManager) {
    showAutoApprovalBanner(request);
  }
}
```

### Better: TypeScript narrows the radius

The named boundary owns the rule and callers keep the workflow visible.

```ts title="src/approvals/actions.ts"
export function approveFromAction(user: User, request: Request) {
  if (approvalPolicy.canApprove(user, request)) {
    approve(request);
  }
}

export function showReminderBanner(request: Request) {
  if (approvalPolicy.canApprove(request.owner, request)) {
    showAutoApprovalBanner(request);
  }
}
```

### Problem: C caller repeats the rule in two paths

The request handler and batch path each rebuild the approval condition.

```c title="src/example.c"
void approve_from_api(struct user *user, struct request *request) {
    if (request_total(request) < 5000 || user_is_manager(user)) {
        approve_request(request);
    }
}

void send_reminder(struct request *request) {
    if (request_total(request) < 5000 || user_is_manager(request_owner(request))) {
        send_auto_approval_notice(request);
    }
}
```

### Better: C boundary owns the rule

The caller asks the owning boundary instead of repeating the condition.

```c title="src/example.c"
void approve_from_api(struct approval_policy *policy, struct user *user, struct request *request) {
    if (approval_policy_can_approve(policy, user, request)) {
        approve_request(request);
    }
}

void send_reminder(struct approval_policy *policy, struct request *request) {
    if (approval_policy_can_approve(policy, request_owner(request), request)) {
        send_auto_approval_notice(request);
    }
}
```

### Problem: C++ object path repeats the rule

Two object workflows carry the same threshold and manager exception.

```cpp title="src/example.cpp"
void approve_from_controller(const User& user, const Request& request) {
    if (request.total() < Money::from_cents(500000) || user.is_manager()) {
        approvals.approve(request);
    }
}

void add_report_row(const Request& request) {
    if (request.total() < Money::from_cents(500000) || request.owner().is_manager()) {
        report.add_auto_approval(request);
    }
}
```

### Better: C++ boundary owns the rule

The named boundary narrows the future change radius.

```cpp title="src/example.cpp"
void approve_from_controller(const User& user, const Request& request) {
    if (approval_policy.can_approve(user, request)) {
        approvals.approve(request);
    }
}

void add_report_row(const Request& request) {
    if (approval_policy.can_approve(request.owner(), request)) {
        report.add_auto_approval(request);
    }
}
```

### Problem: Go service path repeats the rule

The service and notifier each own the same approval condition.

```go title="internal/example/service.go"
func ApproveFromService(user User, request Request) {
    if request.Total < 5000 || user.IsManager {
        approvals.Approve(request)
    }
}

func SendReminder(request Request) {
    if request.Total < 5000 || request.Owner.IsManager {
        approvals.SendAutoApprovalNotice(request)
    }
}
```

### Better: Go boundary owns the rule

The caller uses the owning boundary.

```go title="internal/example/service.go"
func ApproveFromService(user User, request Request) {
    if approvalPolicy.CanApprove(user, request) {
        approvals.Approve(request)
    }
}

func SendReminder(request Request) {
    if approvalPolicy.CanApprove(request.Owner, request) {
        approvals.SendAutoApprovalNotice(request)
    }
}
```

### Problem: JavaScript client repeats the rule

The action and banner both encode the approval threshold.

```js title="src/example.js"
export function approveFromAction(user, request) {
  if (request.total < 5000 || user.role === 'manager') {
    approve(request);
  }
}

export function showReminderBanner(request) {
  if (request.total < 5000 || request.owner.role === 'manager') {
    showAutoApprovalBanner(request);
  }
}
```

### Better: JavaScript client asks the boundary

The caller asks the owning boundary instead of rebuilding the condition.

```js title="src/example.js"
export function approveFromAction(user, request) {
  if (approvalPolicy.canApprove(user, request)) {
    approve(request);
  }
}

export function showReminderBanner(request) {
  if (approvalPolicy.canApprove(request.owner, request)) {
    showAutoApprovalBanner(request);
  }
}
```
