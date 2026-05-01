---
title: >-
  Centralize Configuration Policy
summary: >-
  Parse and name configuration policy once so callers do not rediscover defaults, precedence, and
  magic values.
status: draft
tags:
  - "configuration"
  - "correctness"
  - "boundaries"
audiences:
  - "reviewers"
  - "agents"
  - "learners"
languages:
  - "c"
  - "cpp"
  - "csharp"
  - "go"
  - "java"
  - "js"
  - "python"
  - "rust"
  - "ts"
problems:
  - "Defaults, feature flags, environment variables, and magic values are interpreted differently across callers."
concepts:
  - "boundary-trust"
  - "change-radius"
related:
  - "parse-dont-validate"
  - "cap-change-radius"
  - "make-invalid-states-hard-to-express"
---

## Core Idea

Configuration drift happens when defaults, environment names, feature flags, and precedence rules
spread through the code. A caller should receive the policy it needs, not a bag of raw config values
plus unwritten rules about how to combine them.

Reach for this pattern when several modules read the same environment variable, config key, or
feature flag directly.

The main tradeoff is that do not create a global config object that every module can reach; pass the
narrow policy each caller needs.

## Use When

- Several modules read the same environment variable, config key, or feature flag directly.
- Callers apply defaults or precedence rules slightly differently.
- A magic number or string appears in logic that should receive a named policy.

## Guidance

- Parse raw config once and pass named policy values inward.
- Put defaults and precedence rules in the config boundary that has enough context to explain them.
- Document surprising values with the domain reason, not only the value itself.

## Tradeoffs

- Do not create a global config object that every module can reach; pass the narrow policy each
  caller needs.
- Some framework config must remain framework-shaped; adapt it at the edge before business code uses
  it.
- Rust and Go make narrow config structs cheap; TypeScript needs care to avoid passing loosely typed
  config objects everywhere.

## Agent Instruction

When a change touches config, parse raw values at one boundary and pass narrow named policy inward.
Do not scatter environment reads, defaults, or magic values across callers.

## Examples

### Rust config boundary names retry policy

Business code receives RetryPolicy, not loose integers and strings from the environment.

```rust title="src/config.rs"
pub struct AppConfig {
    pub retry_policy: RetryPolicy,
}

pub fn load_config(env: &Env) -> Result<AppConfig, ConfigError> {
    Ok(AppConfig {
        retry_policy: RetryPolicy::from_env(env)?,
    })
}
```

### Go passes narrow policy

The worker receives only the timeout policy it needs, not the full raw configuration.

```go title="config.go"
type WorkerPolicy struct {
    Timeout time.Duration
    Retries int
}

worker := NewWorker(config.WorkerPolicy)
```

### TypeScript config parser owns defaults

Callers receive a named retry policy instead of reading raw environment values and repeating
defaults.

```ts title="src/config.ts"
export function loadRetryPolicy(env: Env): RetryPolicy {
  return {
    attempts: Number(env.RETRY_ATTEMPTS ?? 3),
    timeoutMs: Number(env.RETRY_TIMEOUT_MS ?? 500),
  };
}
```

### C# config boundary owns defaults

Callers receive RetryPolicy instead of reading environment values directly.

```csharp title="AppConfig.cs"
public static RetryPolicy LoadRetryPolicy(IConfiguration config)
{
    return new RetryPolicy(
        attempts: config.GetValue("Retry:Attempts", 3),
        timeout: config.GetValue("Retry:TimeoutMs", 500));
}
```

### Java passes narrow config

The worker receives only the retry policy it needs.

```java title="WorkerConfig.java"
var retryPolicy = RetryPolicy.from(config);
var worker = new Worker(retryPolicy);
```

### Python parses config once

Defaults and environment names live at the config boundary.

```python title="config.py"
def load_retry_policy(env):
    return RetryPolicy(
        attempts=int(env.get("RETRY_ATTEMPTS", "3")),
        timeout_ms=int(env.get("RETRY_TIMEOUT_MS", "500")),
    )
```

## References

- None yet.

### Low-level boundary names the rule

The caller delegates the rule to a named boundary instead of repeating mechanics inline.

```c title="src/example.c"
if (approval_policy_can_approve(policy, user, request)) {
    approve_request(request);
}
```

### Object boundary names the rule

The object caller asks a boundary that owns the rule.

```cpp title="src/example.cpp"
if (approval_policy.can_approve(user, request)) {
    approvals.approve(request);
}
```

### Client boundary names the rule

The client code uses a named boundary instead of rebuilding the rule.

```js title="src/example.js"
if (approvalPolicy.canApprove(user, request)) {
  approve(request);
}
```
