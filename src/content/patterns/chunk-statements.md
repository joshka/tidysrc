---
title: >-
  Chunk Statements
summary: >-
  Group nearby statements into visible logic paragraphs so each workflow phase is visible.
status: draft
tags:
  - "readability"
  - "formatting"
  - "review"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "csharp"
  - "go"
  - "java"
  - "python"
  - "rust"
  - "ts"
problems:
  - "A function is technically short but reads as one uninterrupted wall of work."
concepts:
  - "reader-locality"
  - "cognitive-burden"
related:
  - "reader-locality"
  - "explaining-variable"
  - "smallest-trustworthy-verification"
---

## Core Idea

Chunking statements uses whitespace to show the shape of a small algorithm. Each blank line should
mark a change in intent such as setup, filtering, mutation, verification, or return assembly. A
reviewer can read the function as a sequence of phases before reading each line closely.

Reach for this pattern when a function has setup, decision, mutation, and return phases that are
currently pressed together into one visual block.

The main tradeoff is that blank lines should reveal structure, not decorate every statement; too
much whitespace makes the function feel fragmented.

## Use When

- A function has setup, decision, mutation, and return phases that are currently pressed together
  into one visual block.
- The statements are correct but the reader cannot see the workflow shape without simulating the
  whole function line by line.
- A blank line would communicate a real change in intent, such as moving from collecting data to
  mutating state or assembling the response.

## Guidance

- Use blank lines as algorithm paragraphs, with each paragraph answering one local question for the
  reader.
- Keep each paragraph focused on one phase or side effect so mutation, validation, and return
  construction do not blur together.
- Name intermediate values when a following paragraph depends on them; the name becomes the bridge
  between phases.

## Tradeoffs

- Blank lines should reveal structure, not decorate every statement; too much whitespace makes the
  function feel fragmented.
- If every paragraph needs a heading comment, a function or concept may be missing and the code may
  need a stronger extraction.
- Do not split a dense expression when the local idiom already reads as one thought.

## Agent Instruction

When a function is correct but hard to scan, group statements into logic paragraphs. Use blank lines
only where the reader crosses a real phase boundary.

## Examples

### Show phases with blank lines

The blank lines separate parsing, filtering, indexing, and return assembly so reviewers can see the
workflow before reading each expression.

```ts title="src/import.ts"
export function importPatterns(files: SourceFile[]) {
  const parsed = files.map(parsePatternFile);
  const valid = parsed.filter((pattern) => pattern.status !== 'rejected');

  const indexed = buildSearchIndex(valid);

  return {
    patterns: valid,
    index: indexed,
  };
}
```

### Rust setup, decision, and return paragraphs

Each paragraph has one job: parse the files, reject invalid records, build the index, then assemble
the return value.

```rust title="src/import.rs"
pub fn import_patterns(files: Vec<SourceFile>) -> Result<Catalog, ImportError> {
    let parsed = files
        .into_iter()
        .map(parse_pattern_file)
        .collect::<Result<Vec<_>, _>>()?;

    let valid = parsed
        .into_iter()
        .filter(|pattern| pattern.status != Status::Rejected)
        .collect::<Vec<_>>();

    let index = build_search_index(&valid);

    Ok(Catalog { patterns: valid, index })
}
```

### Mutation gets its own paragraph

The new map is prepared before the lock is taken, and the mutation is isolated in its own paragraph
to highlight the side effect.

```go title="internal/cache/cache.go"
func (c *Cache) Refresh(items []Item) {
    next := make(map[string]Item, len(items))
    for _, item := range items {
        next[item.ID] = item
    }

    c.mu.Lock()
    defer c.mu.Unlock()

    c.items = next
}
```

### C# separates load, filter, and return assembly

Each paragraph represents one phase of the handler.

```csharp title="CatalogQuery.cs"
var patterns = repository.LoadPatterns();
var stable = patterns.Where(pattern => pattern.Status == Status.Stable).ToList();

var cards = stable.Select(PatternCard.From).ToList();

return new CatalogPage(cards);
```

### Java gives mutation a paragraph

The map is built before the cache mutation so the side effect is easy to see.

```java title="PatternCache.java"
var next = patterns.stream()
    .collect(Collectors.toMap(Pattern::slug, Function.identity()));

synchronized (cache) {
    cache.replaceAll(next);
}

return next.size();
```

### Python shows the workflow phases

Parsing, filtering, and indexing are separated before the return value is assembled.

```python title="catalog/importer.py"
parsed = [parse_pattern(file) for file in files]
visible = [pattern for pattern in parsed if not pattern.hidden]

index = build_index(visible)

return Catalog(patterns=visible, index=index)
```

## References

- None yet.
