# UX Documentation Guidance Import

This note records the development-preferences guidance selected for TidySrc content. The source
rules are already present in compact form under `docs/development/`; this pass adapts the deeper UX
and documentation-surface ideas into site content.

## Candidate Rules

Primary documentation rules:

- `DOCS-AVOID-GENERATED-PROSE-TELLS`
- `DOCS-WRITE-TECHNICAL-PROSE`
- `DOCS-NAME-DESTINATION-NOT-DIRECTION`
- `DOCS-USE-DESCRIPTIVE-HEADINGS`
- `DOCS-MATCH-PAGE-SHAPE-TO-READER-TASK`
- `DOCS-HIDE-CATALOG-MECHANICS`
- `DOCS-ONE-DOMINANT-MODE-PER-PAGE`
- `DOCS-PROSE-FOR-RELATIONSHIPS-LISTS-FOR-ENUMERATION`

Supporting rules:

- `TEST-MATCH-EVIDENCE-TO-SURFACE`
- `TEST-COVER-NAVIGATION-BOUNDARIES`
- `BOUNDARY-SEPARATE-UI-AND-APP-STATE`
- `BOUNDARY-TREAT-TERMINAL-UI-AS-PRODUCT-SURFACE`

Related planning candidates from `../development-preferences/.plans/site-ui-rule-gaps.md`:

- Make clickable surfaces obvious.
- Align spacing to a visible rhythm.
- Keep tags distinct from titles.
- Preserve orientation in deep pages.
- Match density to content size.
- Shape landing pages as navigation surfaces.
- Group indexes by reader task.
- Remove redundant context in lists.
- Use metadata as data, not body content.
- Keep reference copy direct.
- Verify rendered documentation pages.

## Applied TidySrc Content

- `src/content/concepts/documentation-surface.md` captures the shared idea that rendered
  documentation is a user-facing surface.
- `src/content/problems/interface-narration-obscures-task.md` names the recurring failure mode
  behind page and component narration.
- `src/content/patterns/cut-interface-narration.md` covers generated-prose tells, technical prose,
  and hidden catalog mechanics.
- `src/content/patterns/name-destinations-not-directions.md` covers navigation labels, headings,
  cards, and index rows.
- `src/content/patterns/match-documentation-shape-to-reader-task.md` covers page mode, dominant
  task, metadata placement, and rendered-surface validation.

## Deferred Candidates

The UI-planning candidates about spacing, density, deep-page orientation, tags, and clickable
affordances are useful, but they are more visual-design specific than the current TidySrc content
set. They should become separate patterns only after another rendered-site review provides concrete
examples from this repo or another production docs site.
