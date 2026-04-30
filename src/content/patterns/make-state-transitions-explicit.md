---
title: >-
  Make State Transitions Explicit
summary: >-
  Represent lifecycle changes as named transitions instead of scattered field writes and flag
  checks.
status: draft
tags:
  - "correctness"
  - "state"
  - "api-design"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "csharp"
  - "java"
  - "python"
  - "rust"
  - "ts"
problems:
  - "Lifecycle state changes happen through scattered flags, nullable fields, or direct property writes."
concepts:
  - "state-space"
  - "observable-behavior"
related:
  - "make-invalid-states-hard-to-express"
  - "observable-behavior-tests"
---

## Core Idea

State bugs often come from code that edits flags directly or spreads one lifecycle across several
ordinary fields. A record can be draft, queued, published, archived, failed, and retried, but the
allowed movement between those states is nowhere named. Explicit transitions give reviewers a place
to check invariants, side effects, and invalid movements. When field combinations secretly control
later behavior, name the state machine instead of making every reader reconstruct it.

Reach for this pattern when a value has a lifecycle and only some transitions are valid.

The main tradeoff is that a tiny two-state value may only need a boolean if the states are obvious
and no transition logic exists.

## Use When

- A value has a lifecycle and only some transitions are valid.
- Different callers update status fields directly and disagree about side effects or required
  timestamps.
- A struct or object has several fields whose combinations determine future behavior.
- Tests need to build impossible states to exercise ordinary behavior.

## Guidance

- Name transitions with verbs that describe the lifecycle move, such as submit, publish, archive,
  retry, or cancel.
- Keep invariant checks, timestamps, and transition events inside the transition boundary.
- Replace field combinations that act like states with explicit variants, typed states, or named
  transition functions.
- Prefer enums or sealed variants over independent booleans when the states are mutually exclusive.

## Tradeoffs

- A tiny two-state value may only need a boolean if the states are obvious and no transition logic
  exists.
- State machines can become ceremonial when the domain has no real transition rules; use them when
  they reduce impossible states.
- Java and TypeScript often need discipline or sealed unions; Rust enums can encode invalid
  transitions more directly.

## Agent Instruction

When lifecycle state changes through scattered field writes, introduce a named transition boundary.
Keep invariant checks and transition side effects together.

## Examples

### TypeScript transition owns timestamp and event

Publishing is a named transition, so the status change, timestamp, and event stay together.

```ts title="src/patternStatus.ts"
export function publish(pattern: DraftPattern, now: Date): PublishedPattern {
  return {
    ...pattern,
    status: 'published',
    publishedAt: now,
    events: [...pattern.events, { type: 'published', at: now }],
  };
}
```

### Rust enum rejects impossible states

The retry transition exists only for failed jobs, so queued jobs cannot accidentally carry failure
data.

```rust title="src/job.rs"
pub enum JobState {
    Queued,
    Running,
    Failed { reason: String },
}

impl JobState {
    pub fn retry(self) -> Result<JobState, JobState> {
        match self {
            JobState::Failed { .. } => Ok(JobState::Queued),
            other => Err(other),
        }
    }
}
```

### Java transition method owns the lifecycle move

Direct status assignment is replaced with a method that owns the allowed movement and timestamp.

```java title="PatternStatus.java"
Pattern publish(Clock clock) {
    if (status != Status.DRAFT) {
        throw new InvalidTransition(status, Status.PUBLISHED);
    }

    return withStatus(Status.PUBLISHED, clock.instant());
}
```

### C# exposes transitions as methods

The status change is named and checked in one place.

```csharp title="Pattern.cs"
public Pattern Publish()
{
    if (Status != PatternStatus.Reviewed) throw new InvalidOperationException();

    return this with { Status = PatternStatus.Published };
}
```

### Python names allowed transitions

The transition table makes impossible moves visible.

```python title="workflow.py"
ALLOWED = {
    "draft": {"reviewed"},
    "reviewed": {"published", "draft"},
}

def transition(pattern, next_status):
    if next_status not in ALLOWED[pattern.status]:
        raise ValueError("invalid transition")
    return replace(pattern, status=next_status)
```

## References

- None yet.
