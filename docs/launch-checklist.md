# Launch Checklist

Use this checklist before publishing TidySrc. It is intentionally separate from
`docs/progress-and-future-work.md` so launch work stays actionable.

Status: complete for the current public launch candidate.

Validation evidence:

- `pnpm review:prepare` regenerated `docs/content-coverage-report.md` with no P0 page findings.
- `markdownlint-cli2 "**/*.md"` passed for 173 Markdown files.
- `node scripts/check-content.mjs` passed for 61 patterns, 34 problems, 19 concepts, and 20
  references.
- `mise exec -- pnpm check` passed with 0 Astro errors, warnings, or hints.
- `mise exec -- pnpm check:languages` passed and regenerated `docs/language-coverage-report.md`.
- `mise exec -- pnpm build` built 121 pages.
- `mise exec -- pnpm check:site` passed internal-link and syntax-highlight contrast checks.
- `mise exec -- pnpm check:launch-ui` passed rendered desktop/mobile, light/dark, search/filter,
  footer/font, problem-to-pattern, and copy-control checks.
- Rendered screenshots were inspected from `.review/screenshots/` for home, pattern catalog, problem
  catalog, and agent pages across desktop/mobile and light/dark themes.

## Content Readiness

- [x] Every reviewed pattern has a clear core idea, use-when guidance, tradeoffs,
  examples, agent instruction, related links, and references where relevant.
- [x] Every reviewed problem explains impact, signals, diagnostic questions, approach,
  related patterns, and at least one useful example when the problem is code-shaped.
- [x] Every reviewed concept defines the idea in source-change terms and links to the
  problems or patterns that make it concrete.
- [x] Seed entries are either hidden, clearly marked, or acceptable to publish as reviewable seeds.
- [x] No page relies on vague AI-writing filler instead of concrete source-change pressure.

## Examples

- [x] Each example has a title, path, language, note, and code small enough to read locally.
- [x] Bad/good examples are labeled when contrast is the point.
- [x] Language examples are idiomatic enough for a knowledgeable reader in that ecosystem.
- [x] Python examples choose dict-shaped or object-shaped code deliberately.
- [x] Examples explain the problem they solve before showing code.

## Navigation and Discovery

- [x] Pattern, problem, concept, agent, and reference index pages have useful grouping.
- [x] Search and filters work after using grouped navigation cards.
- [x] Category, tag, status, and related links navigate to valid routes.
- [x] Seed content can be found for review without dominating the default experience.
- [x] The site has a clear path from symptom to problem to pattern.

## Visual Review

- [x] Light theme has crisp figure/ground separation across home, indexes, and detail pages.
- [x] Dark theme has enough contrast between canvas, cards, borders, muted text, and accents.
- [x] Code blocks fit the bento visual language and remain readable in both themes.
- [x] Copy controls look consistent with Expressive Code copy controls.
- [x] Font rendering is consistent: site text uses the sans token; code uses the mono token.

## Mobile Review

- [x] Detail-page display text does not dominate the first viewport.
- [x] Bento cards and code examples do not overflow horizontally.
- [x] Top navigation remains compact enough to leave room for content.
- [x] Problem impact panels feel like dense reference material, not poster sections.
- [x] Copy controls remain usable on touch devices.

## Technical Checks

- [x] `markdownlint-cli2` passes for changed markdown files.
- [x] `node scripts/check-content.mjs` passes.
- [x] `mise exec -- pnpm check` passes.
- [x] `mise exec -- pnpm check:site` passes.
- [x] The generated site has no missing internal links.
- [x] Syntax highlighted code passes the rendered contrast check.

## Final Human Pass

- [x] Read the home page as a first-time visitor.
- [x] Read the pattern catalog as a reviewer looking for a comment link.
- [x] Read the problem catalog as someone who knows the symptom but not the pattern name.
- [x] Read the agent page as someone setting up a coding-agent task.
- [x] Confirm the footer and author surface are present without overwhelming the site.
