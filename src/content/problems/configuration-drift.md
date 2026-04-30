---
title: >-
  Configuration drift
status: draft
category: boundaries
topics:
  - configuration
  - policy
  - change-radius
summary: >-
  Defaults, feature flags, environment variables, and magic values are interpreted differently
  across callers.
relatedPatterns:
  - centralize-configuration-policy
  - parse-dont-validate
  - cap-change-radius
relatedConcepts:
  - boundary-trust
  - change-radius
---

## Impact

The running system can behave differently depending on which path read the config. A small policy
change becomes a search-and-edit task with hidden edge cases.

## Signals

- Multiple modules read the same environment variable or feature flag directly.
- Defaults are repeated as literals in business logic.
- A config key is parsed in several places with different error handling.
- Changing a timeout, retry count, or mode requires edits outside the config boundary.

## Diagnostic Questions

- Which boundary owns this config value and its default?
- What named policy should callers receive?
- Are precedence rules documented in code or recreated at call sites?
- Can the raw value be parsed once and passed inward as a precise type?

## Approach

- Parse raw config at one boundary and pass narrow policy values inward.
- Name defaults and magic values by their domain role.
- Keep framework-shaped config at the framework edge.
- Test surprising precedence or default behavior as observable behavior.

## Examples

### Problem: C# callers parse the same setting

Each caller can choose a different default or parsing rule.

```csharp title="Billing/RetryPolicy.cs"
int RetryLimit(IConfiguration config)
{
    return int.Parse(config["PAYMENT_RETRIES"] ?? "3");
}
```

### Better: C# config is parsed into a policy

Business code receives the policy, not the raw configuration key.

```csharp title="Billing/PaymentPolicy.cs"
public sealed record PaymentPolicy(int RetryLimit);

public static PaymentPolicy Load(IConfiguration config) =>
    new(int.Parse(config["PAYMENT_RETRIES"] ?? "3"));
```

### Problem: Java defaults are repeated in services

The timeout default can drift across call sites.

```java title="src/main/java/example/Payments.java"
Duration paymentTimeout(Config config) {
    return Duration.ofSeconds(config.getInt("payment.timeout.seconds", 30));
}
```

### Better: Java exposes a named policy

The raw config key stays at the boundary.

```java title="src/main/java/example/PaymentPolicy.java"
record PaymentPolicy(Duration timeout) {
    static PaymentPolicy from(Config config) {
        return new PaymentPolicy(
            Duration.ofSeconds(config.getInt("payment.timeout.seconds", 30))
        );
    }
}
```

### Problem: Callers interpret the same flag differently

Two paths can disagree about defaults because raw environment access leaks inward.

```python title="billing/retry.py"
def retry_limit():
    return int(os.getenv("PAYMENT_RETRIES", "3"))


def can_retry(attempts):
    return attempts < int(os.getenv("PAYMENT_RETRIES", "5"))
```

### Better: Parsed config gives callers one policy

The raw value is interpreted once at the boundary.

```python title="billing/config.py"
@dataclass(frozen=True)
class PaymentPolicy:
    retry_limit: int


def load_payment_policy(env: Mapping[str, str]) -> PaymentPolicy:
    return PaymentPolicy(retry_limit=int(env.get("PAYMENT_RETRIES", "3")))
```

### Problem: Rust callers read raw environment

The default and parse error behavior can differ in every caller.

```rust title="src/payments.rs"
pub fn retry_limit() -> usize {
    std::env::var("PAYMENT_RETRIES")
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(3)
}
```

### Better: Rust parses config once

The rest of the app receives a typed policy.

```rust title="src/config.rs"
pub struct PaymentPolicy {
    pub retry_limit: usize,
}

pub fn load_payment_policy(env: &Env) -> Result<PaymentPolicy, ConfigError> {
    Ok(PaymentPolicy {
        retry_limit: env.get("PAYMENT_RETRIES").unwrap_or("3").parse()?,
    })
}
```

### Problem: TypeScript callers read flags directly

Raw config leaks into business logic and repeats the default.

```ts title="src/payments/retry.ts"
export function canRetry(attempts: number) {
  return attempts < Number(process.env.PAYMENT_RETRIES ?? '3');
}
```

### Better: TypeScript callers receive a policy

The parser owns precedence and defaults.

```ts title="src/payments/policy.ts"
export type PaymentPolicy = {
  retryLimit: number;
};

export function loadPaymentPolicy(env: NodeJS.ProcessEnv): PaymentPolicy {
  return { retryLimit: Number(env.PAYMENT_RETRIES ?? '3') };
}
```
