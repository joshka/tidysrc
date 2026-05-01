# AI Blindspots Mapping

This maps Edward Yang's AI Blindspots articles to TidySrc entries. The goal is not one TidySrc page
per article. The goal is to distill durable source-change names and cite the source material where
it helps.

## Strongly Mapped

| AI Blindspots article | Current TidySrc fit | Notes |
| --- | --- | --- |
| Stop Digging | `stop-and-reframe`, `make-stop-conditions-explicit` | Use when evidence says the current approach is wrong. |
| Black Box Testing | `test-observable-behavior`, `report-verification-honestly` | Fold into behavior-focused verification guidance. |
| Preparatory Refactoring | `separate-structure-from-behavior`, `untangle-before-changing` | Keep tidying distinct from behavior change. |
| Requirements, not Solutions | `state-requirements-before-solutions`, `constrain-agent-edit-surface` | Use constraints and non-goals before implementation. |
| Respect the Spec | `preserve-the-spec`, `review-generated-code-normally` | Do not make tests pass by weakening the contract. |
| Scientific Debugging | `debug-from-evidence`, `stop-and-reframe` | Use evidence before another patch. |
| Know Your Limits | `stop-and-reframe`, `make-stop-conditions-explicit` | Name when the task should pause or escalate. |

## Agent Workflow Support

| AI Blindspots article | Current TidySrc fit | Notes |
| --- | --- | --- |
| Stateless Tools | `prepare-the-workspace` | Make commands and tool state reproducible. |
| Use MCP Servers | `prepare-the-workspace`, `pin-authoritative-context` | Prefer project-specific tools over generic guesses. |
| Mise en Place | `prepare-the-workspace` | Prepare docs, commands, and state before risky edits. |
| Read the Docs | `pin-authoritative-context`, `separate-exploration-from-editing` | Current docs outrank stale model memory. |
| Memento | `keep-agent-handoff-current`, `context-hygiene` | Keep task facts current across handoffs. |
| The tail wagging the dog | `keep-agent-handoff-current`, `context-hygiene` | Avoid stale context steering later work. |

## Config or Practice Guidance

| AI Blindspots article | Current TidySrc fit | Notes |
| --- | --- | --- |
| Use Automatic Code Formatting | `let-tools-handle-mechanics`, future config guidance | Mechanical formatting should not consume review attention. |
| Use Static Types | `make-invalid-states-hard-to-express` | Useful support, but not always a standalone pattern. |
| Keep Files Small | `reader-locality`, `cognitive-burden` | Needs careful framing to avoid file-count rules. |

## Reference Only for Now

| AI Blindspots article | Current TidySrc fit | Notes |
| --- | --- | --- |
| Bulldozer Method | Reference only | Useful posture, but too broad for a narrow pattern today. |
| Walking Skeleton | Reference only | Product delivery shape more than source-change pattern. |
| Culture Eats Strategy | Reference only | Organizational guidance; may inform agent workflow later. |
| Rule of Three | Reference only | Supports abstraction timing, already covered by premature architecture guidance. |

## Follow-Up Questions

- Should `/agents/` include a short "failure modes" guide using this mapping?
- Which source articles deserve direct reference links on existing pattern pages?
- Are any mapped seed patterns strong enough to promote to `draft` after review?
