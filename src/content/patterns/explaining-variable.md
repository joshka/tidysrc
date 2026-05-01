---
title: >-
  Use an Explaining Variable
summary: >-
  Name an intermediate value when it lowers the reader’s burden more than another inline
  expression would.
status: draft
tags:
  - "readability"
  - "naming"
  - "refactoring"
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
  - "The important call is hidden inside nested expressions or repeated conditions."
concepts:
  - "cognitive-burden"
related:
  - "chunk-statements"
  - "reader-locality"
  - "parse-dont-validate"
---

## Core Idea

An explaining variable turns an operation into a domain fact. It helps when the reader needs to know
why a value matters before they care how it is computed. Spend a local name when that name makes the
following branch, call, or return read in domain terms.

Reach for this pattern when a boolean condition combines several domain facts and the reader needs a
name for the decision before evaluating the mechanics.

The main tradeoff is that do not introduce a name that repeats the expression; the variable should
add intent, grouping, or a review handle.

## Use When

- A boolean condition combines several domain facts and the reader needs a name for the decision
  before evaluating the mechanics.
- A nested expression makes the important call hard to scan because setup, transformation, and
  decision logic are all inline.
- The name can express intent better than the operations alone, especially when the operations are
  generic but the result has domain meaning.

## Guidance

- Name the domain fact, not the implementation detail, so the following line reads in terms of the
  behavior being decided.
- Prefer a local variable over a helper when the value belongs only to this caller and extraction
  would create a weak distant abstraction.
- Keep the named value close to its use so the reader does not have to remember the definition
  across unrelated work.

## Tradeoffs

- Do not introduce a name that repeats the expression; the variable should add intent, grouping, or
  a review handle.
- If the same concept appears in many places, promote it to a real API instead of copying local
  names with subtly different meanings.
- Avoid stale names when the expression changes, because an inaccurate explaining variable is worse
  than an inline expression.

## Agent Instruction

Introduce an explaining variable when a local name makes the following line easier to read. Do not
extract a helper unless the concept has meaning beyond this local use.

## Examples

### Name the local condition

The branch depends on two separate domain facts, so naming them lets the final condition read like a
retry decision.

```rust title="src/retry.rs"
let retryable_error = error.is_timeout() || error.is_rate_limited();
let retry_budget_available = attempts < policy.max_attempts;

if retryable_error && retry_budget_available {
    schedule_retry(request, attempts + 1);
}
```

### Make the branch read like a decision

The session checks are mechanical, but the branch is about whether the stored session can be reused
for this request.

```js title="src/auth.js"
const canUseStoredSession =
  session &&
  session.expiresAt > Date.now() &&
  session.userId === request.userId;

if (canUseStoredSession) {
  return session;
}
```

### Give a Java stream result a role

The stream pipeline is still local, but naming its result tells the reader what role those filtered
rules play.

```java title="Policy.java"
var matchingRules = rules.stream()
    .filter(rule -> rule.matches(request))
    .toList();

return Decision.from(matchingRules);
```

### C# names the policy decision

The branch reads as a publishability decision instead of a bundle of checks.

```csharp title="PublishPolicy.cs"
var hasRequiredFields = pattern.Title != "" && pattern.Summary != "";
var canPublish = hasRequiredFields && pattern.Status == Status.Reviewed;

if (canPublish) {
    publisher.Publish(pattern);
}
```

### Python names the retry condition

The local name lets the next line read as a domain decision.

```python title="retry.py"
retryable_error = error.kind in {"timeout", "rate_limit"}
retry_budget_available = attempts < policy.max_attempts

if retryable_error and retry_budget_available:
    schedule_retry(request, attempts + 1)
```

### TypeScript names the route decision

The boolean describes why the branch exists before the UI chooses a route.

```ts title="src/navigation.ts"
const shouldOpenProblem = query.startsWith('problem:') && user.canBrowseProblems;

if (shouldOpenProblem) {
  return problemRoute(query.slice('problem:'.length));
}
```

## References

- [Tidy First?: Explaining Variables](https://www.oreilly.com/library/view/tidy-first/9781098151232/ch08.html)
- [Tidy First?: Explaining Constants](https://www.oreilly.com/library/view/tidy-first/9781098151232/ch09.html)

### Low-level boundary names the rule

The caller delegates the rule to a named boundary instead of repeating mechanics inline.

```c title="src/example.c"
if (approval_policy_can_approve(policy, user, request)) {
    approve_request(request);
}
```

### Object boundary names the rule

The object caller asks a boundary that owns the rule.

```cpp title="src/example.cpp"
if (approval_policy.can_approve(user, request)) {
    approvals.approve(request);
}
```

### Service boundary names the rule

The service keeps the rule behind one named operation.

```go title="internal/example/service.go"
if approvalPolicy.CanApprove(user, request) {
    approvals.Approve(request)
}
```
