---
title: >-
  Performance Fix Without Evidence
status: draft
category: change-risk
topics:
  - performance
  - measurement
  - complexity
summary: >-
  A change adds caching, concurrency, allocation tricks, or broad rewrites without a measured
  bottleneck.
relatedPatterns:
  - measure-before-optimizing
  - smallest-trustworthy-verification
  - make-side-effects-visible
  - cap-change-radius
relatedConcepts:
  - side-effect-visibility
  - change-radius
  - cognitive-burden
---

## Description

A change adds caching, concurrency, allocation tricks, or broad rewrites without a measured
bottleneck.

The problem is not the existence of the mechanism itself. It is that the ownership, boundary, or
contract is implicit enough that each caller can interpret it differently.

## Why It Matters

Performance work can add state, invalidation, timing, and concurrency risks. Without evidence, the

Reviewers care because the risk is not visible at one call site. They have to reconstruct the
intended behavior from scattered branches, tests, and boundaries before they can tell whether the
change is safe.

## Code Impact

The code impact is drift. Related checks, state changes, defaults, errors, or side effects spread
across files, so a future edit can update one path while leaving another path with the old rule.
Tests then tend to protect one example rather than the contract that all callers rely on.

## Signals

- A patch adds caching or parallelism without a benchmark, profile, or production signal.
- The optimization changes data shape or ownership before proving a bottleneck.
- A micro-optimization obscures the main path.
- Tests prove correctness but not the performance claim that justified the complexity.

## Diagnostic Questions

- What measurement shows this path is the bottleneck?
- What behavior or contract could the optimization change?
- Can the performance-sensitive boundary be isolated?
- What verification proves both correctness and the intended performance property?

## Approach

- Measure before adding complexity, and keep the measurement close to the claim.
- Prefer local improvements that preserve reader locality before adding cache or concurrency state.
- Treat cache, async, and allocation changes as behavior-risking when they alter ordering or
  ownership.
- Keep the fallback or original behavior easy to compare during review.

## Examples

### Problem: cache is added without a measured bottleneck

The change adds freshness risk before proving this path is slow.

```csharp title="Catalog/Patterns.cs"
public Pattern GetPattern(string id)
{
    return cache.GetOrAdd(id, () => repository.Load(id));
}
```

### Better: optimization starts with a measurement

The claim can be reviewed before adding state.

```csharp title="Catalog/PatternsBenchmark.cs"
[Benchmark]
public Pattern LoadPattern() => repository.Load(patternId);
```

### Problem: parallelism changes ordering without evidence

The rewrite adds concurrency risk before showing a throughput problem.

```java title="src/main/java/example/Reports.java"
reports.parallelStream().forEach(report -> publisher.publish(report));
```

### Better: keeps behavior stable while measuring

The benchmark targets the suspected bottleneck.

```java title="src/jmh/java/example/ReportsBenchmark.java"
@Benchmark
public void publishReports() {
    reports.forEach(report -> publisher.publish(report));
}
```

### Problem: memoization hides stale data

The cache changes behavior without evidence that loading dominates runtime.

```python title="catalog/patterns.py"
@lru_cache
def load_pattern(pattern_id):
    return repository.load(pattern_id)
```

### Better: profile names the hotspot first

The optimization can be chosen from evidence.

```python title="scripts/profile_patterns.py"
with cProfile.Profile() as profile:
    for pattern_id in pattern_ids:
        repository.load(pattern_id)
```

### Problem: allocation trick obscures the main path

The rewrite changes ownership before proving allocation cost matters.

```rust title="src/catalog.rs"
pub fn titles(patterns: Vec<Pattern>) -> Vec<String> {
    patterns.into_iter().map(|pattern| pattern.title).collect()
}
```

### Better: benchmark isolates the claim

The benchmark shows whether title collection is worth optimizing.

```rust title="benches/catalog.rs"
fn titles_benchmark(c: &mut Criterion) {
    c.bench_function("titles", |b| b.iter(|| titles(patterns.clone())));
}
```

### Problem: cache changes freshness without evidence

The cache may serve stale results and the performance claim is unmeasured.

```ts title="src/catalog/loadPattern.ts"
const cached = new Map<string, Pattern>();

export async function loadPattern(id: string) {
  if (!cached.has(id)) cached.set(id, await api.loadPattern(id));
  return cached.get(id);
}
```

### Better: measurement precedes the cache

The timing captures the path before changing behavior.

```ts title="src/catalog/loadPattern.measure.ts"
performance.mark('load-pattern-start');
await api.loadPattern(id);
performance.mark('load-pattern-end');
performance.measure('load-pattern', 'load-pattern-start', 'load-pattern-end');
```

### Problem: low-level caller repeats the rule

The low-level path updates state without naming the boundary that owns the rule.

```c title="src/example.c"
if (request_total < 5000 || user_is_manager(user)) {
    approve_request(request);
}
```

### Better: low-level boundary owns the rule

The caller asks a named boundary instead of repeating the condition.

```c title="src/example.c"
if (approval_policy_can_approve(policy, user, request)) {
    approve_request(request);
}
```

### Problem: object path repeats the rule

The object caller owns a rule that should have a named boundary.

```cpp title="src/example.cpp"
if (request.total() < Money::from_cents(500000) || user.is_manager()) {
    approvals.approve(request);
}
```

### Better: object boundary owns the rule

The policy names the rule and narrows the future change radius.

```cpp title="src/example.cpp"
if (approval_policy.can_approve(user, request)) {
    approvals.approve(request);
}
```

### Problem: service path repeats the rule

The service path makes the rule local to one caller, so another caller can drift.

```go title="internal/example/service.go"
if request.Total < 5000 || user.IsManager {
    approvals.Approve(request)
}
```

### Better: service boundary owns the rule

The caller uses a named policy boundary.

```go title="internal/example/service.go"
if approvalPolicy.CanApprove(user, request) {
    approvals.Approve(request)
}
```

### Problem: client path repeats the rule

The client path repeats a rule that should have a named boundary.

```js title="src/example.js"
if (request.total < 5000 || user.role === 'manager') {
  approve(request);
}
```

### Better: client boundary owns the rule

The caller asks the named policy instead of rebuilding the condition.

```js title="src/example.js"
if (approvalPolicy.canApprove(user, request)) {
  approve(request);
}
```
