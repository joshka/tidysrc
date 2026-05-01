---
title: Premature Architecture
status: reviewed
category: architecture
topics:
  - agents
  - architecture
  - review
  - yagni
summary: >-
  A local change turns into a broader architecture decision before the repeated pressure or
  requirements justify it.
relatedPatterns:
  - follow-existing-conventions
  - preparatory-refactor
  - smallest-trustworthy-verification
relatedConcepts:
  - agent-guidance
  - yagni
  - change-economics
  - reader-locality
  - cognitive-burden
---

## Description

Premature architecture happens when a local change turns into a general framework before the code
has shown repeated pressure. The new provider, registry, interface, strategy, or configuration layer
may be internally tidy, but it asks the reader to learn a concept that does not yet explain enough
real behavior.

This is the [YAGNI](/concepts/yagni/) family of problems applied to source structure. The [change
economics](/concepts/change-economics/) are unfavorable when the abstraction spends review attention
now for optional futures that may never arrive.

The balancing idea is the open-closed principle in object-oriented design: a stable extension point
can be worthwhile when real variation is expected and callers should add behavior without editing a
closed core. The problem is creating that extension point before the variation is real enough to
name.

Humans often overbuild from taste, anxiety about future reuse, or one memorable past failure. Agents
can amplify the same mistake when the prompt leaves scope open or when the repository contains one
nearby example of heavier architecture.

## Why It Matters

A small change starts carrying the review cost of a system redesign. The reviewer now has to judge
both behavior and architecture, even though the architecture may only be serving guessed future
requirements.

## Code Impact

Extra files, providers, registries, base classes, or configuration layers make future changes slower
when they do not reduce the number of concepts a maintainer has to hold. The next change has to
preserve the abstraction even if the abstraction was never needed.

## Signals

- A small feature introduces a new architecture vocabulary.
- The implementation is organized around generic patterns instead of nearby code shape.
- The change optimizes for hypothetical reuse before there is repeated pressure.
- Preparatory refactoring is bundled into behavior change, making review harder.
- The patch copies heavier nearby architecture without checking whether this change needs it.

## Diagnostic Questions

- What is the smallest local change that satisfies the request?
- Which existing repo pattern should the implementation imitate?
- Does the abstraction reduce concepts for the reader or add them?
- Is there enough repeated pressure to justify naming a new architectural concept?
- Is this a real open-closed extension point, or only a guessed future variation?
- What real future change would this architecture make cheaper, and is that future likely enough to
  pay for the concept now?
- What constraint would prevent the change from widening scope again?

## Approach

- Keep the behavior change local until repeated examples prove the shape.
- Split [preparatory refactoring](/patterns/preparatory-refactor/) into a separate review when it
  is genuinely needed.
- Prefer nearby project vocabulary over generic architecture vocabulary.
- When an agent is doing the work, state the local constraints, non-goals, and files that should
  set the pattern. [Existing conventions](/patterns/follow-existing-conventions/) should win
  over general pattern catalogs.
- Verify the behavior that changed, not just the scaffold that was added. Use the
  [smallest trustworthy verification](/patterns/smallest-trustworthy-verification/) that can catch
  the likely failure.

## Examples

These examples show how a local rule grows architecture before the code has earned it. The trigger
may be guessed future requirements, a familiar pattern applied too early, or an agent copying a
heavier shape without enough local evidence.

### Problem: One parser callback becomes a handler table

The parser has one special case, but the change creates a dispatch table before more handlers exist.

```c title="src/parser.c"
typedef bool (*field_handler)(struct parser *parser, const char *value);

struct field_rule {
    const char *name;
    field_handler handler;
};

static bool handle_title(struct parser *parser, const char *value) {
    return parser_set_title(parser, value);
}

static const struct field_rule field_rules[] = {
    { "title", handle_title },
};

bool parse_field(struct parser *parser, const char *name, const char *value) {
    for (size_t i = 0; i < ARRAY_LEN(field_rules); i++) {
        if (strcmp(field_rules[i].name, name) == 0) {
            return field_rules[i].handler(parser, value);
        }
    }

    return false;
}
```

### Better: Keep the single parse rule direct

Keeping the special case direct avoids naming a dispatch concept before more fields prove that a
table reduces complexity.

```c title="src/parser.c"
bool parse_field(struct parser *parser, const char *name, const char *value) {
    if (strcmp(name, "title") != 0) {
        return false;
    }

    return parser_set_title(parser, value);
}
```

### Problem: One-off rule becomes a strategy set

The code has one discount rule, but the change creates architecture for many.

```csharp title="Billing/Discounts.cs"
public interface IDiscountStrategy
{
    bool Applies(Order order);
    decimal Amount(Order order);
}
```

### Better: Keep the rule local until pressure repeats

The local function names the policy without inventing an extension point. Keep the behavior local
until repeated examples prove a broader abstraction.

```csharp title="Billing/Discounts.cs"
public static decimal LoyaltyDiscount(Order order)
{
    if (!order.Customer.IsLoyal) {
        return 0m;
    }

    return order.Total * 0.05m;
}
```

### Problem: One parser option becomes a class hierarchy

There is one output option, but the code introduces an abstract renderer before another renderer is
needed.

```cpp title="src/report_export.cpp"
class ExportRenderer {
public:
    virtual ~ExportRenderer() = default;
    virtual bool supports(Format format) const = 0;
    virtual ExportedFile render(const Report& report) const = 0;
};

class PdfExportRenderer final : public ExportRenderer {
public:
    bool supports(Format format) const override {
        return format == Format::Pdf;
    }

    ExportedFile render(const Report& report) const override {
        return render_pdf(report);
    }
};
```

### Better: Keep the concrete export path visible

The direct function leaves the supported behavior visible. Extract a renderer only when a second
real format makes the common concept worth naming.

```cpp title="src/report_export.cpp"
ExportedFile export_pdf_report(const Report& report) {
    return render_pdf(report);
}
```

### Problem: One delivery path becomes an interface

The order flow sends one notification, but the change introduces an interface and factory before
another delivery path exists.

```go title="internal/notify/send.go"
type Sender interface {
    Send(ctx context.Context, message Message) error
}

type SenderFactory struct {
    email EmailSender
}

func (f SenderFactory) For(channel string) Sender {
    return f.email
}

func NotifyOrder(ctx context.Context, factory SenderFactory, order Order) error {
    sender := factory.For("email")
    return sender.Send(ctx, OrderMessage(order))
}
```

### Better: Use the concrete dependency directly

[Existing conventions](/patterns/follow-existing-conventions/) and nearby code should decide whether
an interface is normal here. Without that pressure, the direct dependency is clearer.

```go title="internal/notify/send.go"
func NotifyOrder(ctx context.Context, email EmailSender, order Order) error {
    return email.Send(ctx, OrderMessage(order))
}
```

### Problem: Local branch becomes a provider

The provider exists before there is a second source of behavior.

```java title="src/main/java/example/Discounts.java"
interface DiscountProvider {
    BigDecimal discountFor(Order order);
}
```

### Better: Use the existing service shape

The behavior stays inside the service that already owns order pricing, so the reader does not have
to learn provider vocabulary for one rule.

```java title="src/main/java/example/Discounts.java"
BigDecimal loyaltyDiscount(Order order) {
    if (!order.customer().isLoyal()) {
        return BigDecimal.ZERO;
    }

    return order.total().multiply(new BigDecimal("0.05"));
}
```

### Problem: One UI decision becomes a renderer registry

The component renders one empty state, but the change creates a registry for future panels before
the UI has those variants.

```js title="src/renderDashboard.js"
const panelRenderers = new Map();

panelRenderers.set('empty', {
  supports(state) {
    return state.widgets.length === 0;
  },
  render(state) {
    return EmptyPanel({ message: 'No widgets configured' });
  },
});

export function renderDashboard(state) {
  for (const renderer of panelRenderers.values()) {
    if (renderer.supports(state)) {
      return renderer.render(state);
    }
  }

  return WidgetGrid({ widgets: state.widgets });
}
```

### Better: Keep the current UI branch direct

The ordinary UI rule is easier to review when the current states are direct. Add renderer
architecture after repeated panel variants make the registry useful.

```js title="src/renderDashboard.js"
export function renderDashboard(state) {
  if (state.widgets.length === 0) {
    return EmptyPanel({ message: 'No widgets configured' });
  }

  return WidgetGrid({ widgets: state.widgets });
}
```

### Problem: Small rule grows a registry

The registry adds a new concept before repeated pressure exists.

```python title="billing/discounts.py"
discount_registry.register("loyalty", LoyaltyDiscountStrategy())

def discount(order):
    return discount_registry.for_order(order).amount(order)
```

### Better: Keep the single rule as a named function

The code can still become a registry later if more rules prove that shape. Until then, the named
function is the smaller concept.

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

### Better: Make the one supported path explicit

The caller can see that PDF export is the supported behavior today.

```ts title="src/export/reportExport.ts"
export async function exportPdfReport(report: Report): Promise<ExportResult> {
  const rendered = await renderReportPdf(report);
  return uploadExport(rendered);
}
```

### Problem: A narrow command request grows a provider layer

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

### Better: Pass the concrete configuration where it is needed

The command has one configuration source, so the function accepts the value directly. The behavior
can still be verified with a focused check instead of proving a new provider layer.

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
