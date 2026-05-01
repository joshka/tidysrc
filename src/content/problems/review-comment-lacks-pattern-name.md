---
title: >-
  Review Comment Lacks a Pattern Name
status: seed
category: agent-workflow
topics:
  - review
  - shared-language
  - agents
summary: >-
  A reviewer can see a problem but cannot name the move clearly enough for the author or an agent to
  apply it.
relatedPatterns:
  - reader-locality
  - guard-clause
  - avoid-premature-agent-architecture
relatedConcepts:
  - agent-guidance
  - cognitive-burden
---

## Impact

Unnamed feedback becomes taste. Authors may make broad rewrites, agents may overbuild, and future
reviews repeat the same explanation without a stable link or shared vocabulary.

## Signals

- Comments say “this feels hard to read” without naming the change pressure.
- The same review advice is rewritten differently in each pull request.
- An agent receives vague feedback and changes more code than requested.
- The author fixes one symptom but misses the underlying pattern.

## Diagnostic Questions

- What source-change problem is visible in the diff?
- Which small pattern would work the problem down?
- What tradeoff should the author watch for?
- Would a review snippet with a stable link reduce ambiguity?

## Approach

- Name the problem first, then link to the pattern that fits the local code.
- Use the pattern’s review snippet when the comment should be concise and repeatable.
- Avoid turning the comment into a broad rewrite request unless the scope is genuinely larger.
- Point agents to the operational instruction, not only the human explanation.
