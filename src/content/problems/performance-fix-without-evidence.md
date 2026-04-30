---
title: >-
  Performance fix without evidence
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
  - smallest-trustworthy-verification
  - make-side-effects-visible
  - cap-change-radius
relatedConcepts:
  - side-effect-visibility
  - change-radius
  - cognitive-burden
---

## Impact

Performance work can add state, invalidation, timing, and concurrency risks. Without evidence, the
code may get harder to change while the real bottleneck remains elsewhere.

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

### Problem: C# cache is added without a measured bottleneck

The change adds freshness risk before proving this path is slow.

```csharp title="Catalog/Patterns.cs"
public Pattern GetPattern(string id)
{
    return cache.GetOrAdd(id, () => repository.Load(id));
}
```

### Better: C# optimization starts with a measurement

The claim can be reviewed before adding state.

```csharp title="Catalog/PatternsBenchmark.cs"
[Benchmark]
public Pattern LoadPattern() => repository.Load(patternId);
```

### Problem: Java parallelism changes ordering without evidence

The rewrite adds concurrency risk before showing a throughput problem.

```java title="src/main/java/example/Reports.java"
reports.parallelStream().forEach(report -> publisher.publish(report));
```

### Better: Java keeps behavior stable while measuring

The benchmark targets the suspected bottleneck.

```java title="src/jmh/java/example/ReportsBenchmark.java"
@Benchmark
public void publishReports() {
    reports.forEach(report -> publisher.publish(report));
}
```

### Problem: Python memoization hides stale data

The cache changes behavior without evidence that loading dominates runtime.

```python title="catalog/patterns.py"
@lru_cache
def load_pattern(pattern_id):
    return repository.load(pattern_id)
```

### Better: Python profile names the hotspot first

The optimization can be chosen from evidence.

```python title="scripts/profile_patterns.py"
with cProfile.Profile() as profile:
    for pattern_id in pattern_ids:
        repository.load(pattern_id)
```

### Problem: Rust allocation trick obscures the main path

The rewrite changes ownership before proving allocation cost matters.

```rust title="src/catalog.rs"
pub fn titles(patterns: Vec<Pattern>) -> Vec<String> {
    patterns.into_iter().map(|pattern| pattern.title).collect()
}
```

### Better: Rust benchmark isolates the claim

The benchmark shows whether title collection is worth optimizing.

```rust title="benches/catalog.rs"
fn titles_benchmark(c: &mut Criterion) {
    c.bench_function("titles", |b| b.iter(|| titles(patterns.clone())));
}
```

### Problem: TypeScript cache changes freshness without evidence

The cache may serve stale results and the performance claim is unmeasured.

```ts title="src/catalog/loadPattern.ts"
const cached = new Map<string, Pattern>();

export async function loadPattern(id: string) {
  if (!cached.has(id)) cached.set(id, await api.loadPattern(id));
  return cached.get(id);
}
```

### Better: TypeScript measurement precedes the cache

The timing captures the path before changing behavior.

```ts title="src/catalog/loadPattern.measure.ts"
performance.mark('load-pattern-start');
await api.loadPattern(id);
performance.mark('load-pattern-end');
performance.measure('load-pattern', 'load-pattern-start', 'load-pattern-end');
```
