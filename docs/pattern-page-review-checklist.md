# Pattern Page Review Checklist

Use this checklist when reviewing pattern pages. It mirrors the problem-page checklist where the
same review issues apply, but uses the pattern-page section shape.

Also apply `docs/writing-guidelines.md`. In particular, pattern pages should describe source-change
work directly instead of explaining how the site works.

## Page Shape

- [ ] Title names a reusable source-change move someone could use in review conversation.
- [ ] Title is the clearest durable name, or the page records a better-known alias in tags,
  narrative, or future work.
- [ ] Summary is pithy and describes the move, not the site mechanics.
- [ ] `Core Idea` explains the pattern in concrete source-change terms.
- [ ] `Use When` lists observable situations where the pattern fits.
- [ ] `Guidance` gives concrete ways to apply the pattern.
- [ ] `Tradeoffs` names when the pattern can be wrong or over-applied.
- [ ] `Agent Instruction` is narrow enough to apply safely.
- [ ] `Examples` show the pattern solving a real code-shaped problem.
- [ ] `References` render as links when the source is external.

## Heading Intent

- [ ] `Core Idea` is not a second summary. It gives the reader a clearer mental model.
- [ ] `Use When` is not generic encouragement. It names recognizable conditions in code.
- [ ] `Guidance` does not over-prescribe architecture when a local fix is enough.
- [ ] `Tradeoffs` sharpens diagnosis instead of weakening the pattern.
- [ ] Section copy is content-focused, not UI instructions such as "start here" or "use this".

## Scope and Balance

- [ ] Page states the boundary of the pattern, not only the preferred fix.
- [ ] Page names a balancing principle when one exists, such as locality versus reuse.
- [ ] The balancing principle explains when not to apply the pattern.
- [ ] The pattern does not turn one language or workflow version into the whole topic.
- [ ] Related patterns are useful next steps, not merely pages with shared words.

## Examples

- [ ] All launch languages are covered when the pattern is code-shaped: C, C++, C#, Go, Java,
  JavaScript, Python, Rust, and TypeScript.
- [ ] Drop the language name from example titles; the language tab already carries it.
- [ ] Each example note states the local problem before the code.
- [ ] Each example note names the pattern or idea used to clean it up.
- [ ] Examples feel like simplified real maintenance code, not toy syntax demonstrations.
- [ ] Examples stay small enough to read locally without reconstructing a whole project.
- [ ] The same pattern shape appears across languages when possible.
- [ ] Language examples diverge when the idiom genuinely changes the shape.
- [ ] Python examples choose dict-shaped or object-shaped code deliberately.

## Links and Relationships

- [ ] Link concepts in the narrative when the page relies on them.
- [ ] Link related patterns in narrative or guidance when the distinction matters.
- [ ] Do not force a related link when the existing page only partly fits.
- [ ] Add a future-work note when review exposes a repeated missing concept, pattern, or alias.
- [ ] References are useful sources for the reader, not summaries of this site's internal rationale.

## Error and Failure Paths

- [ ] If the pattern changes error shape, mention inspectable errors, result objects, or propagation
  explicitly.
- [ ] If the issue is language-level propagation, do not pretend `Return Structured Errors` covers
  it. Track a possible propagation pattern if the idea recurs.
- [ ] Rust `?`, Java checked exceptions, Go `error` returns, and result objects may need different
  wording even when they solve the same visual problem.

## Voice

- [ ] Avoid describing how the site works instead of describing source-change work.
- [ ] Avoid filler openings like "use this when", "start here", and "these concepts cover".
- [ ] Prefer concrete nouns: callers, branches, tests, errors, files, routes, types, diffs.
- [ ] Avoid over-explaining the UI controls around the content.
- [ ] Keep prose concise, but do not collapse the pattern into abstract bullet points.

## Status

- [ ] Mark as `reviewed` only after title, sections, examples, links, and relationships have had a
  human pass.
- [ ] Mark as `reviewed` only after generated findings are resolved or explicitly deferred.
- [ ] Keep as `draft` when the idea is useful but examples or links still need review.
- [ ] Keep as `seed` when the page may be useful but the name, scope, or examples are uncertain.
