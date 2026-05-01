---
title: >-
  Performance Fix Without Evidence
status: reviewed
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

The patch may be well-intentioned, but the reviewer cannot tell whether the added complexity buys
anything. The evidence can be small: a benchmark, profile, production trace, route timing, or a
focused measurement around the suspected hot path. The problem is the absence of a falsifiable
performance claim.

## Why It Matters

Performance work often adds state, invalidation, timing, allocation, and concurrency risks. Without
evidence, reviewers have to accept those risks on intuition.

The cost is not only wasted work. A guessed optimization can make the main path harder to read,
change ordering, introduce stale data, or hide a correctness bug behind code that looks more
advanced than the measured problem requires.

## Code Impact

The code gains performance machinery before the bottleneck is known. Caches need freshness rules,
parallelism needs ordering and cancellation rules, allocation tricks change ownership, and broad
rewrites increase the review surface.

When the measurement is missing, future maintainers cannot tell which complexity is still earning
its keep. They either preserve it forever or remove it without knowing whether they regressed the
actual hot path.

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

- [Measure before optimizing](/patterns/measure-before-optimizing/), and keep the measurement close
  to the claim.
- Prefer local improvements that preserve reader locality before adding cache or concurrency state.
- Treat cache, async, and allocation changes as behavior-risking when they alter ordering or
  ownership.
- Use the [smallest trustworthy verification](/patterns/smallest-trustworthy-verification/) that
  can fail the performance claim.
- [Make side effects visible](/patterns/make-side-effects-visible/) when the optimization adds
  cache state, background work, or concurrency.
- [Cap change radius](/patterns/cap-change-radius/) so the performance change stays reviewable.

## Examples

### Before: direct load

The code has no cache state yet, so correctness and freshness are straightforward to review.

```csharp title="Catalog/Patterns.cs"
public Pattern GetPattern(string id)
{
    return repository.Load(id);
}
```

### Problem: cache is added without a measured bottleneck

The change adds freshness risk before proving this path is slow.

```csharp title="Catalog/Patterns.cs"
public Pattern GetPattern(string id)
{
    return cache.GetOrAdd(id, () => repository.Load(id));
}
```

### Better: optimization starts with a measurement

The claim can be reviewed before adding state. This applies
[Measure Before Optimizing](/patterns/measure-before-optimizing/).

```csharp title="Catalog/PatternsBenchmark.cs"
[Benchmark]
public Pattern LoadPattern() => repository.Load(patternId);
```

### Before: ordered publish loop

The original code preserves report order and has no new scheduling behavior.

```java title="src/main/java/example/Reports.java"
reports.forEach(report -> publisher.publish(report));
```

### Problem: parallelism changes ordering without evidence

The rewrite adds concurrency risk before showing a throughput problem.

```java title="src/main/java/example/Reports.java"
reports.parallelStream().forEach(report -> publisher.publish(report));
```

### Better: keeps behavior stable while measuring

The benchmark targets the suspected bottleneck. This applies
[Measure Before Optimizing](/patterns/measure-before-optimizing/).

```java title="src/jmh/java/example/ReportsBenchmark.java"
@Benchmark
public void publishReports() {
    reports.forEach(report -> publisher.publish(report));
}
```

### Before: direct repository load

The original path always reads current data.

```python title="catalog/patterns.py"
def load_pattern(pattern_id):
    return repository.load(pattern_id)
```

### Problem: memoization hides stale data

The cache changes behavior without evidence that loading dominates runtime.

```python title="catalog/patterns.py"
@lru_cache
def load_pattern(pattern_id):
    return repository.load(pattern_id)
```

### Better: profile names the hotspot first

The optimization can be chosen from evidence. This applies
[Measure Before Optimizing](/patterns/measure-before-optimizing/).

```python title="scripts/profile_patterns.py"
with cProfile.Profile() as profile:
    for pattern_id in pattern_ids:
        repository.load(pattern_id)
```

### Before: direct catalog parse

The original code reparses the catalog and returns fresh data.

```rust title="src/catalog.rs"
pub fn load_catalog(path: &Path) -> Result<Catalog, Error> {
    let source = fs::read_to_string(path)?;

    parse_catalog(&source)
}
```

### Problem: global cache is added without evidence

The cache adds invalidation and synchronization before proving parsing dominates runtime.

```rust title="src/catalog.rs"
static CATALOG: OnceLock<Catalog> = OnceLock::new();

pub fn load_catalog(path: &Path) -> Result<&'static Catalog, Error> {
    CATALOG.get_or_try_init(|| {
        let source = fs::read_to_string(path)?;

        parse_catalog(&source)
    })
}
```

### Better: benchmark the parse boundary

The benchmark shows whether parsing is worth changing before cache state is added. This applies
[Measure Before Optimizing](/patterns/measure-before-optimizing/).

```rust title="benches/catalog.rs"
fn catalog_parse_benchmark(c: &mut Criterion) {
    let source = fs::read_to_string("fixtures/catalog.toml").unwrap();

    c.bench_function("parse catalog", |b| b.iter(|| parse_catalog(&source)));
}
```

### Before: direct API read

The original code returns fresh data from the service.

```ts title="src/catalog/loadPattern.ts"
export async function loadPattern(id: string) {
  return api.loadPattern(id);
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

The timing captures the path before changing behavior. This applies
[Measure Before Optimizing](/patterns/measure-before-optimizing/).

```ts title="src/catalog/loadPattern.measure.ts"
performance.mark('load-pattern-start');
await api.loadPattern(id);
performance.mark('load-pattern-end');
performance.measure('load-pattern', 'load-pattern-start', 'load-pattern-end');
```

### Before: direct parse

The original code has no global cache state.

```c title="src/example.c"
ParsedReport *load_report(const char *path) {
    return parse_report_file(path);
}
```

### Problem: cache is added before timing the path

The cache adds invalidation risk before proving repeated parsing is slow.

```c title="src/example.c"
static ParsedReport *cached_report;

ParsedReport *load_report(const char *path) {
    if (cached_report == NULL) {
        cached_report = parse_report_file(path);
    }

    return cached_report;
}
```

### Better: measure the suspected hot path

The timing check can fail the claim before cache state is added. This applies
[Measure Before Optimizing](/patterns/measure-before-optimizing/).

```c title="src/example.c"
clock_t start = clock();
ParsedReport *report = parse_report_file(path);
clock_t elapsed = clock() - start;

record_timing("report_parse_ticks", elapsed);
```

### Before: ordinary owned return

The original code returns an owned value with clear lifetime rules.

```cpp title="src/example.cpp"
std::string display_name(const User& user) {
    return user.first_name() + " " + user.last_name();
}
```

### Problem: allocation trick obscures ownership

The rewrite changes lifetime and ownership before showing allocation cost matters.

```cpp title="src/example.cpp"
std::string_view display_name(const User& user) {
    static std::string cached;
    cached = user.first_name() + " " + user.last_name();
    return cached;
}
```

### Better: benchmark the original allocation

The benchmark names the claim without changing ownership yet. This applies
[Measure Before Optimizing](/patterns/measure-before-optimizing/).

```cpp title="src/example.cpp"
static void BMDisplayName(benchmark::State& state) {
    for (auto _ : state) {
        benchmark::DoNotOptimize(display_name(user));
    }
}
```

### Before: sequential publish

The original code preserves ordering and cancellation behavior.

```go title="internal/example/service.go"
for _, report := range reports {
    if err := publisher.Publish(ctx, report); err != nil {
        return err
    }
}
```

### Problem: goroutines change ordering without evidence

The rewrite introduces scheduling and cancellation questions before proving throughput is bounded by
publishing.

```go title="internal/example/service.go"
for _, report := range reports {
    go publisher.Publish(ctx, report)
}
```

### Better: benchmark the sequential path

The benchmark can justify concurrency before the behavior changes. This applies
[Measure Before Optimizing](/patterns/measure-before-optimizing/).

```go title="internal/example/service.go"
func BenchmarkPublishReports(b *testing.B) {
    for i := 0; i < b.N; i++ {
        publishReports(ctx, reports, publisher)
    }
}
```

### Before: direct request

The original code always reads fresh data.

```js title="src/example.js"
export async function loadReport(id) {
  return api.loadReport(id);
}
```

### Problem: memoization changes freshness without evidence

The browser cache can return stale data, but the route has not been measured.

```js title="src/example.js"
const cache = new Map();

export async function loadReport(id) {
  if (!cache.has(id)) cache.set(id, await api.loadReport(id));
  return cache.get(id);
}
```

### Better: measure before adding cache state

The timing captures whether the request is actually the bottleneck. This applies
[Measure Before Optimizing](/patterns/measure-before-optimizing/).

```js title="src/example.js"
const start = performance.now();
await api.loadReport(id);
console.info('loadReport ms', performance.now() - start);
```
