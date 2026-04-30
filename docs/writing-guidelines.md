# TidySrc Writing Guidelines

These guidelines govern TidySrc pattern, problem, concept, agent, config, and reference content.
They are adapted from the Komodo docs writing baseline and narrowed for this site.

TidySrc writing should help a reader name a source-change problem, choose a pattern, and verify the
tradeoff. It should not sound like marketing, coaching, customer-service prose, or a generated
summary of the page.

## Reader Model

TidySrc pages are hybrid surfaces. Readers often skim them like cards during review, but the same
pages must still carry enough prose to explain the tradeoff behind a pattern. The writing should
support both uses without turning every entry into a long article.

Pattern, problem, and concept pages should expose the main decision quickly: the symptom, the move,
and the risk. They also need enough surrounding explanation for a reader to judge whether the entry
fits their code. A card can name the pattern; the page must explain the change pressure.

This means TidySrc should avoid two failure modes:

- entries that are only terse labels, with no explanation of why the pattern applies
- entries that become essays, hiding the review-ready form under too much background

Write the compact form first, then add only the prose needed to make the tradeoff clear.

## Core Rules

- Write the point first, then explain the tradeoff.
- Name the actor when a sentence describes an action.
- Prefer active voice and present tense.
- Use prose for relationships, causality, and tradeoffs.
- Use lists for signals, checks, fields, steps, and short option sets.
- Keep headings for real content clusters, not one-sentence fragments.
- Use concrete nouns: tests, callers, errors, files, routes, types, diffs, examples.
- Cut filler that only makes the sentence sound careful or polished.
- State what changed, what can break, and what evidence would catch it.

## Avoid

Avoid stock AI-writing patterns:

- page narration: `this page covers`, `use this page when`, `the rest of this page`
- throat-clearing: `to be clear`, `that said`, `in practice`, `it is worth noting`
- contrast templates: `not just X, but Y`, `it is not X, it is Y`, `the real issue is`
- teaching-order narration: `the first thing to understand`, `start with`, `later`, `next`
- unearned ranking: `best`, `easiest`, `fastest`, `safest`, `cleanest`
- weak recommendation words: `usually`, `for most users`, `good starting point`
- vague praise: `powerful`, `flexible`, `robust`, `meaningful`, `modern`
- punctuation-driven style: repeated em dashes, `--` pivots, `Why:` and `Key point:`
- mini-introductions before every list and mini-summaries after every section

These words are not banned in code samples or source titles, but prose should not depend on them.

## Pattern Entries

Pattern pages should be concise and linkable. A reader should be able to use the title, summary,
and first visible sections in a review comment without reading a long article.

Each pattern should answer:

- What change pressure triggers this pattern?
- What local move should the reader make?
- What tradeoff or failure mode limits the pattern?
- What code example shows the problem being solved?
- What instruction would help a coding agent apply it without widening scope?

Write pattern narratives as explanation, not promotion. Do not oversell a pattern as cleaner,
safer, or simpler unless the text states the property that earns the claim.

## Problem Entries

Problem pages begin with symptoms. They should turn a vague review concern into concrete questions
and related patterns.

Good problem writing:

- names the observable symptom
- explains why the symptom raises change risk
- gives diagnostic questions that a reviewer can ask directly
- links to patterns that address the risk

Avoid making problem pages into generic advice. If the prose could apply to any software problem,
add a concrete signal, example, or failure mode.

## Concept Entries

Concept pages carry explanation that would overload pattern pages. They can be more narrative than
patterns, but they still need density.

Concept writing should:

- define the concept in local source-change terms
- connect the concept to concrete patterns
- explain the tradeoff once, not in several tonal restatements
- use examples when the concept would otherwise stay abstract

Do not turn concept pages into taxonomies. If a list names many terms without explaining how they
relate, cut the list or rewrite it as prose.

## Code Examples

Code examples need context. A snippet should not appear as a standalone artifact with no explanation
of the problem it solves.

Each example should include:

- a title that names the move
- a plausible file path
- the relevant language
- a short note that explains the pressure or tradeoff
- code small enough to read without reconstructing a project

Use tabs when a pattern has examples in multiple languages. Rust, Go, TypeScript, JavaScript, and
Java examples should use the same pattern vocabulary where possible.

## Agent Instructions

Agent instructions should be operational. They should tell the agent what to do, what not to add,
and what evidence to report.

A good agent instruction:

- gives repo-local instructions priority
- names the narrow change
- rejects premature architecture when the change does not need it
- asks for verification tied to the risk
- avoids implying that unrun checks passed

Do not write agent instructions as motivational prose.

## References

References are context, not authorities. Link to real external sites and avoid bridge prose that
explains the existence of the link more than the source itself.

Reference notes should say what the reader can expect from the source:

- catalog structure
- examples
- legacy-code tactics
- UX heuristics
- pattern-language history
- relevant discussion

Do not cite personal summaries as external references.

## Review Checklist

Before publishing content, check:

- Does each page have one dominant job?
- Does the first paragraph say the actual point?
- Are lists used because enumeration helps?
- Are headings carrying real sections?
- Does any sentence explain the page instead of the topic?
- Does any recommendation word need evidence or a tradeoff?
- Does every code example explain the problem it solves?
- Do references link to approved external sources?
- Would a reviewer know what behavior, risk, or source shape the entry is about?

If the prose feels polished but low-signal, cut repetition, merge small sections, replace abstract
labels with concrete nouns, and add a real example or tradeoff.
