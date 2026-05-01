---
title: >-
  Centralize Configuration Policy
summary: >-
  Parse and name configuration policy once so callers do not rediscover defaults, precedence, and
  magic values.
status: reviewed
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

The main tradeoff is scope. Do not create a global config object that every module can reach; pass
the narrow policy each caller needs.

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

### Config boundary names retry policy

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

### Pass narrow policy

The worker receives only the timeout policy it needs, not the full raw configuration.

```go title="config.go"
type WorkerPolicy struct {
    Timeout time.Duration
    Retries int
}

func LoadWorkerPolicy(env Env) WorkerPolicy {
    return WorkerPolicy{
        Timeout: env.Duration("WORKER_TIMEOUT", 500*time.Millisecond),
        Retries: env.Int("WORKER_RETRIES", 3),
    }
}
```

### Config parser owns defaults

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

### Config boundary owns defaults

Callers receive RetryPolicy instead of reading environment values directly.

```csharp title="AppConfig.cs"
public static RetryPolicy LoadRetryPolicy(IConfiguration config)
{
    return new RetryPolicy(
        attempts: config.GetValue("Retry:Attempts", 3),
        timeout: config.GetValue("Retry:TimeoutMs", 500));
}
```

### Pass narrow config

The worker receives only the retry policy it needs.

```java title="WorkerConfig.java"
static RetryPolicy loadRetryPolicy(Config config) {
    return new RetryPolicy(
        config.getInt("retry.attempts", 3),
        config.getDuration("retry.timeout", Duration.ofMillis(500)));
}
```

### Parse config once

Defaults and environment names live at the config boundary.

```python title="config.py"
def load_retry_policy(env):
    return RetryPolicy(
        attempts=int(env.get("RETRY_ATTEMPTS", "3")),
        timeout_ms=int(env.get("RETRY_TIMEOUT_MS", "500")),
    )
```

### Low-level boundary names retry policy

Business code receives named retry settings instead of parsing raw environment strings.

```c title="src/example.c"
struct retry_policy load_retry_policy(const struct env *env) {
    return (struct retry_policy) {
        .attempts = env_int(env, "RETRY_ATTEMPTS", 3),
        .timeout_ms = env_int(env, "RETRY_TIMEOUT_MS", 500),
    };
}
```

### Object boundary names retry policy

The parser owns defaults and returns a typed policy object.

```cpp title="src/example.cpp"
RetryPolicy load_retry_policy(const Config& config) {
    return RetryPolicy{
        config.get_int("retry.attempts", 3),
        config.get_duration("retry.timeout", 500ms),
    };
}
```

### Client boundary names retry policy

UI code receives a named policy instead of reading global config values directly.

```js title="src/example.js"
export function loadRetryPolicy(env) {
  return {
    attempts: Number(env.RETRY_ATTEMPTS ?? 3),
    timeoutMs: Number(env.RETRY_TIMEOUT_MS ?? 500),
  };
}
```

## References

- None yet.
