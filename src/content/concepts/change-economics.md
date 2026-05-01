---
title: >-
  Change Economics
summary: >-
  The tradeoff between paying structure cost now and preserving options for later changes.
status: seed
tags:
  - "workflow"
  - "design"
  - "review"
relatedPatterns:
  - "keep-structure-reversible"
  - "choose-change-batch-size"
  - "separate-structure-from-behavior"
---

## Why it matters

Every structure change spends attention now for possible benefit later. The question is not whether
tidying is good, but whether this tidy improves the next decision enough to justify its cost.

Small reversible structure changes preserve options. Large irreversible structure changes need
stronger evidence because they can create compatibility or migration cost.

## How to apply it

Ask what option this change creates or removes. If the code becomes easier to change without
committing to a broad design, the economics are usually favorable.

## Examples

### Expensive option: public API changes before pressure is clear

The new interface creates a compatibility obligation before there is a second implementation.

```ts title="src/public/search.ts"
export interface SearchProvider {
  search(query: string): Promise<Result[]>;
}
```

### Better: keep the option private

The private helper improves the next edit without committing public callers.

```ts title="src/search/run-search.ts"
function runSearch(query: string): Promise<Result[]> {
  return database.search(query);
}
```
