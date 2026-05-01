---
title: >-
  Tooling Contract Implicit
status: seed
category: tooling
topics:
  - workflow
  - agents
  - verification
summary: >-
  Build, format, lint, generation, or release steps depend on unwritten local knowledge.
relatedPatterns:
  - follow-existing-conventions
  - smallest-trustworthy-verification
  - separate-structure-from-behavior
relatedConcepts:
  - agent-guidance
  - structure-vs-behavior
---

## Description

Humans and agents run the wrong checks, edit generated files by hand, or miss required regeneration.
The repo becomes harder to change because the done signal is tribal knowledge.

An implicit tooling contract appears when the repository depends on local workflow knowledge that
is not encoded in scripts, config, or nearby documentation. The source change may be correct, but
the required generation, formatting, or verification step is easy to miss.

## Why It Matters

Hidden workflow rules make review noisy. The reviewer has to detect both code issues and process
mistakes that the repository could have made explicit.

## Code Impact

Generated files drift from sources, CI runs different checks than local work, and agents choose
broad or irrelevant commands. The codebase gains avoidable churn because contributors discover the
real workflow by failing.

## Signals

- A change requires generated files, but the command is not documented near the workflow.
- Agents run broad or irrelevant checks because the narrow verification path is unclear.
- Formatting or lint rules differ between local edits and CI.
- Release or build steps depend on environment assumptions not encoded in config.

## Diagnostic Questions

- What command proves this kind of change is complete?
- Where should that command be documented for humans and agents?
- Are generated artifacts owned by source or by a build step?
- Can existing conventions state the precedence and verification path?

## Approach

- Capture repo-local workflow in AGENTS, CONTRIBUTING, scripts, or config where agents and
  maintainers will look.
- Prefer narrow commands that match the changed surface over broad unfocused checks.
- Make generated-file ownership explicit.
- Keep tooling guidance local to the repo instead of relying on general preferences.

## Examples

### Problem: generated output is edited by hand

The generated file changes directly, but nothing records the command that owns it.

```typescript title="src/generated/routes.ts"
export const routes = ["/", "/patterns", "/problems", "/concepts"];
```

### Better: the workflow names the generator

The local command gives humans and agents the same path to regenerate the file.

```json title="package.json"
{
  "scripts": {
    "generate:routes": "tsx scripts/generate-routes.ts"
  }
}
```
