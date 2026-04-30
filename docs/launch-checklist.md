# Launch Checklist

Use this checklist before publishing TidySrc. It is intentionally separate from
`docs/progress-and-future-work.md` so launch work stays actionable.

## Content Readiness

- [ ] Every stable or reviewed pattern has a clear core idea, use-when guidance, tradeoffs,
  examples, agent instruction, related links, and references where relevant.
- [ ] Every stable or reviewed problem explains impact, signals, diagnostic questions, approach,
  related patterns, and at least one useful example when the problem is code-shaped.
- [ ] Every stable or reviewed concept defines the idea in source-change terms and links to the
  problems or patterns that make it concrete.
- [ ] Seed entries are either hidden, clearly marked, or acceptable to publish as reviewable seeds.
- [ ] No page relies on vague AI-writing filler instead of concrete source-change pressure.

## Examples

- [ ] Each example has a title, path, language, note, and code small enough to read locally.
- [ ] Bad/good examples are labeled when contrast is the point.
- [ ] Language examples are idiomatic enough for a knowledgeable reader in that ecosystem.
- [ ] Python examples choose dict-shaped or object-shaped code deliberately.
- [ ] Examples explain the problem they solve before showing code.

## Navigation and Discovery

- [ ] Pattern, problem, concept, agent, config, and reference index pages have useful grouping.
- [ ] Search and filters work after using grouped navigation cards.
- [ ] Category, tag, status, and related links navigate to valid routes.
- [ ] Seed content can be found for review without dominating the default experience.
- [ ] The site has a clear path from symptom to problem to pattern.

## Visual Review

- [ ] Light theme has crisp figure/ground separation across home, indexes, and detail pages.
- [ ] Dark theme has enough contrast between canvas, cards, borders, muted text, and accents.
- [ ] Code blocks fit the bento visual language and remain readable in both themes.
- [ ] Copy controls look consistent with Expressive Code copy controls.
- [ ] Font rendering is consistent: site text uses the sans token; code uses the mono token.

## Mobile Review

- [ ] Detail-page display text does not dominate the first viewport.
- [ ] Bento cards and code examples do not overflow horizontally.
- [ ] Top navigation remains compact enough to leave room for content.
- [ ] Problem impact panels feel like dense reference material, not poster sections.
- [ ] Copy controls remain usable on touch devices.

## Technical Checks

- [ ] `markdownlint-cli2` passes for changed markdown files.
- [ ] `node scripts/check-content.mjs` passes.
- [ ] `mise exec -- pnpm check` passes.
- [ ] `mise exec -- pnpm check:site` passes.
- [ ] The generated site has no missing internal links.
- [ ] Syntax highlighted code passes the rendered contrast check.

## Final Human Pass

- [ ] Read the home page as a first-time visitor.
- [ ] Read the pattern catalog as a reviewer looking for a comment link.
- [ ] Read the problem catalog as someone who knows the symptom but not the pattern name.
- [ ] Read the agent page as someone setting up a coding-agent task.
- [ ] Confirm the footer and author surface are present without overwhelming the site.
