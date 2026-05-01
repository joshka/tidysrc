# Problem Page Review Checklist

Use this checklist when reviewing problem pages. It captures the shape proven out during the
`Hidden Main Path` review and should be applied before marking another problem as reviewed.

## Page Shape

- [ ] Title names the problem in a way someone could use in review conversation.
- [ ] Title is the clearest durable name, or the page records a better-known alias in topics,
  description, or future work.
- [ ] Summary is pithy and describes the symptom, not the site mechanics.
- [ ] `Description` explains the problem shape in concrete source-change terms.
- [ ] `Why It Matters` explains why reviewers or maintainers care.
- [ ] `Code Impact` explains what the problem does to real code.
- [ ] `Signals` lists observable signs a reader can recognize in a diff or file.
- [ ] `Diagnostic Questions` help decide whether this is the right problem.
- [ ] `Approach` points to concrete ways to work the problem down.
- [ ] `Examples` show how the problem appears in code when the problem is code-shaped.

## Heading Intent

- [ ] `Description` is not a second summary. It gives the reader a clearer mental model.
- [ ] `Why It Matters` is not generic importance text. It names the review or maintenance cost.
- [ ] `Code Impact` is not the same as `Why It Matters`. It names the code-level consequence.
- [ ] `Signals` are not instructions. They are things the reader may already be seeing.
- [ ] `Approach` does not over-prescribe architecture when a local fix is enough.
- [ ] Section headings are content labels, not UI instructions such as "start here" or "use this".

## Scope and Balance

- [ ] Page states the boundary of the problem, not only the preferred fix.
- [ ] Page names a balancing principle when one exists, such as YAGNI versus open-closed
  extension points.
- [ ] The balancing principle sharpens diagnosis instead of weakening the main warning.
- [ ] Diagnostic questions help decide when the problem is real and when the apparent smell is
  justified by context.
- [ ] The page does not turn one language or workflow version of the problem into the whole topic.

## Examples

- [ ] All launch languages are covered when the problem is code-shaped: C, C++, C#, Go, Java,
  JavaScript, Python, Rust, and TypeScript.
- [ ] Use `Problem:` and `Better:` pairs when contrast teaches the issue.
- [ ] Drop the language name from example titles; the language tab already carries it.
- [ ] Each example note states the local problem before the code.
- [ ] Each better example note names the pattern or idea used to clean it up.
- [ ] Examples feel like simplified real maintenance code, not toy syntax demonstrations.
- [ ] Examples stay small enough to read locally without reconstructing a whole project.
- [ ] The same problem shape appears across languages when possible.
- [ ] Language examples diverge when the idiom genuinely changes the shape.
- [ ] Python examples choose dict-shaped or object-shaped code deliberately.

## Links and Relationships

- [ ] Link concepts in the narrative when the page relies on them.
- [ ] Link patterns in `Approach` and example notes when the example uses that pattern.
- [ ] Do not force a related link when the existing page only partly fits.
- [ ] Add a future-work note when review exposes a repeated missing concept, pattern, or alias.
- [ ] Related patterns are useful next steps, not merely pages with shared words.
- [ ] Related concepts explain recurring ideas that would otherwise bloat the problem page.

## Error and Failure Paths

- [ ] If early exits return inspectable errors or result objects, link
  `Return Structured Errors`.
- [ ] If the issue is language-level propagation, do not pretend `Return Structured Errors` covers
  it. Track a possible propagation pattern if the idea recurs.
- [ ] Rust `?`, Java checked exceptions, Go `error` returns, and result objects may need different
  wording even when they solve the same visual problem.

## Voice

- [ ] Avoid describing how the site works instead of describing the source-change problem.
- [ ] Avoid filler openings like "use this when", "start here", and "these concepts cover".
- [ ] Prefer concrete nouns: callers, branches, tests, errors, files, routes, types, diffs.
- [ ] Avoid over-explaining the UI controls around the content.
- [ ] Keep prose concise, but do not collapse the problem into abstract bullet points.

## Status

- [ ] Mark as `reviewed` only after title, sections, examples, links, and relationships have had a
  human pass.
- [ ] Mark as `reviewed` only after generated findings are resolved or explicitly deferred.
- [ ] Keep as `draft` when the idea is useful but examples or links still need review.
- [ ] Keep as `seed` when the page may be useful but the name, scope, or examples are uncertain.
