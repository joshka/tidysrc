# Taxonomy Audit

This note records the current taxonomy shape and the cleanup questions to answer before launch. It
is a review aid, not a source of truth; content frontmatter remains the source of truth.

## Current Facets

### Status

Content uses three maturity values:

- `seed`: useful enough to keep, but not yet editorially reviewed.
- `draft`: shaped content that still needs review.
- `reviewed`: manually reviewed enough to appear as a stronger entry.

Older drafts used `stable`; that state has been folded into `reviewed`.

### Audiences

Patterns use audience metadata:

- `reviewers`
- `agents`
- `learners`

Open question: decide whether audiences should stay visible on cards or become a search/filter
facet only. The current value is retrieval and filtering, not necessarily visual prominence.

### Problem Categories

Problems currently use these categories:

- `agent-workflow`
- `architecture`
- `async`
- `boundaries`
- `change-risk`
- `readability`
- `side-effects`
- `state`
- `testing`
- `tooling`

Open question: `side-effects`, `state`, and `async` overlap. That may be acceptable if each remains
a browsing path rather than a strict taxonomy.

### Pattern Tags

Pattern tags are broader and less controlled than problem categories. Common tags include
readability, testing, workflow, review, boundaries, agent-guidance, architecture, and side-effects.

Open question: decide which tags are public navigation concepts and which are only search terms.

### Languages

The working language direction is:

- Python, Java, C#, JavaScript/TypeScript, and Rust as the core review languages.
- C, C++, and Go where the problem naturally appears or the ecosystem difference teaches something.

Open question: avoid forcing every item to cover every language. Coverage should follow the shape of
the pattern, not a completeness grid.

## Suggested Cleanup Pass

1. Generate a tag frequency report from content frontmatter.
2. Merge tags that differ only by wording.
3. Keep problem categories fewer and stronger than pattern tags.
4. Treat status as editorial maturity, not as quality marketing.
5. Keep languages separate from tags in rendered chips.
6. Review all seed entries after the next content expansion.

## Automation Ideas

- Add a script that prints tag/category/status/language counts.
- Add a script that flags tags used by only one entry.
- Add a script that flags language tags duplicated as normal tags.
- Add a script that lists seed entries by content type.
