---
title: >-
  Tooling contract implicit
status: draft
category: tooling
topics:
  - workflow
  - agents
  - verification
summary: >-
  Build, format, lint, generation, or release steps depend on unwritten local knowledge.
relatedPatterns:
  - repo-local-instructions-win
  - smallest-trustworthy-verification
  - separate-structure-from-behavior
relatedConcepts:
  - agent-guidance
  - structure-vs-behavior
---

## Impact

Humans and agents run the wrong checks, edit generated files by hand, or miss required regeneration.
The repo becomes harder to change because the done signal is tribal knowledge.

## Signals

- A change requires generated files, but the command is not documented near the workflow.
- Agents run broad or irrelevant checks because the narrow verification path is unclear.
- Formatting or lint rules differ between local edits and CI.
- Release or build steps depend on environment assumptions not encoded in config.

## Diagnostic Questions

- What command proves this kind of change is complete?
- Where should that command be documented for humans and agents?
- Are generated artifacts owned by source or by a build step?
- Can repo-local instructions state the precedence and verification path?

## Approach

- Capture repo-local workflow in AGENTS, CONTRIBUTING, scripts, or config where agents and
  maintainers will look.
- Prefer narrow commands that match the changed surface over broad unfocused checks.
- Make generated-file ownership explicit.
- Keep tooling guidance local to the repo instead of relying on general preferences.
