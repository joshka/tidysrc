---
title: Premature Architecture
status: reviewed
category: agent-workflow
topics:
  - agents
  - architecture
  - review
summary: >-
  A local change turns into a broader architecture decision before the repeated pressure or
  requirements justify it.
relatedPatterns:
  - repo-local-instructions-win
  - avoid-premature-agent-architecture
  - smallest-trustworthy-verification
relatedConcepts:
  - agent-guidance
  - reader-locality
  - cognitive-burden
---

## Impact

A small change can start carrying the review cost of a system redesign. Extra files, providers,
registries, base classes, or configuration layers may look polished while making future changes
slower. The reviewer now has to judge both behavior and architecture, even though the architecture
may only be serving guessed future requirements.

## Signals

- A small feature introduces a new architecture vocabulary.
- The implementation is organized around generic patterns instead of nearby code shape.
- The change optimizes for hypothetical reuse before there is repeated pressure.
- Preparatory refactoring is bundled into behavior change, making review harder.
- An agent ignores nearby examples, repo-specific instructions, or explicit non-goals.

## Diagnostic Questions

- What is the smallest local change that satisfies the request?
- Which existing repo pattern should the implementation imitate?
- Does the abstraction reduce concepts for the reader or add them?
- Is there enough repeated pressure to justify naming a new architectural concept?
- What constraint would prevent a human or agent from widening scope again?

## Approach

- Keep the behavior change local until repeated examples prove the shape.
- Split preparatory refactoring into a separate review when it is genuinely needed.
- Prefer nearby project vocabulary over generic architecture vocabulary.
- For agent work, state the local constraints, non-goals, and files that should set the pattern.
- Verify the behavior that changed, not just the scaffold that was added.

## Examples

These examples show two ways the problem appears. A human may generalize from taste or guessed
future requirements. An agent may do the same thing because the prompt omitted local constraints or
because it copied the wrong pattern from the repository.

### Problem: C# one-off rule becomes a strategy set

The code has one discount rule, but the change creates architecture for many.

```csharp title="Billing/Discounts.cs"
public interface IDiscountStrategy
{
    bool Applies(Order order);
    decimal Amount(Order order);
}
```

### Better: C# keep the rule local until pressure repeats

The local function names the policy without inventing an extension point.

```csharp title="Billing/Discounts.cs"
public static decimal LoyaltyDiscount(Order order)
{
    if (!order.Customer.IsLoyal) {
        return 0m;
    }

    return order.Total * 0.05m;
}
```

### Problem: Java local branch becomes a provider

The provider exists before there is a second source of behavior.

```java title="src/main/java/example/Discounts.java"
interface DiscountProvider {
    BigDecimal discountFor(Order order);
}
```

### Better: Java use the existing service shape

The behavior stays inside the service that already owns order pricing.

```java title="src/main/java/example/Discounts.java"
BigDecimal loyaltyDiscount(Order order) {
    if (!order.customer().isLoyal()) {
        return BigDecimal.ZERO;
    }

    return order.total().multiply(new BigDecimal("0.05"));
}
```

### Problem: Python small rule grows a registry

The registry adds a new concept before repeated pressure exists.

```python title="billing/discounts.py"
discount_registry.register("loyalty", LoyaltyDiscountStrategy())


def discount(order):
    return discount_registry.for_order(order).amount(order)
```

### Better: Python keep the single rule as a named function

The code can still become a registry later if more rules prove that shape.

```python title="billing/discounts.py"
def loyalty_discount(order):
    if not order.customer.is_loyal:
        return Decimal("0")

    return order.total * Decimal("0.05")
```

### Problem: One export path becomes a strategy registry

The product only has one export path, but the change introduces a registry and interface before a
second implementation exists.

```ts title="src/export/reportExport.ts"
export interface ExportStrategy {
  supports(format: string): boolean;
  export(report: Report): Promise<ExportResult>;
}

const strategies: ExportStrategy[] = [
  new PdfExportStrategy(),
];

export async function exportReport(report: Report, format: string) {
  const strategy = strategies.find((candidate) => candidate.supports(format));
  if (!strategy) {
    throw new Error(`Unsupported export format: ${format}`);
  }

  return strategy.export(report);
}
```

### Better: TypeScript make the one supported path explicit

The caller can see that PDF export is the supported behavior today.

```ts title="src/export/reportExport.ts"
export async function exportPdfReport(report: Report): Promise<ExportResult> {
  const rendered = await renderReportPdf(report);
  return uploadExport(rendered);
}
```

### Problem: A narrow agent request grows a provider layer

The requested change was to add one flag to one local command, but the implementation creates
configuration architecture that no other caller uses.

```rust title="src/commands/publish.rs"
pub trait PublishConfigProvider {
    fn config_for(&self, project: ProjectId) -> PublishConfig;
}

pub struct DefaultPublishConfigProvider;

impl PublishConfigProvider for DefaultPublishConfigProvider {
    fn config_for(&self, project: ProjectId) -> PublishConfig {
        PublishConfig {
            project,
            require_review: true,
            notify_watchers: true,
        }
    }
}

pub fn publish(project: ProjectId, provider: &dyn PublishConfigProvider) -> Result<(), Error> {
    let config = provider.config_for(project);
    publish_with_config(config)
}
```

### Better: Rust pass the concrete configuration where it is needed

The command has one configuration source, so the function accepts the value directly.

```rust title="src/commands/publish.rs"
pub fn publish(project: ProjectId) -> Result<(), Error> {
    let config = PublishConfig {
        project,
        require_review: true,
        notify_watchers: true,
    };

    publish_with_config(config)
}
```
