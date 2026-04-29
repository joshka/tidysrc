export type Audience = 'reviewers' | 'agents' | 'learners';
export type Status = 'seed' | 'draft' | 'stable';

export type CodeExample = {
  title: string;
  path: string;
  language: string;
  code: string;
  note?: string;
};

export type Pattern = {
  id: string;
  title: string;
  summary: string;
  status: Status;
  tags: string[];
  audiences: Audience[];
  languages: string[];
  problems: string[];
  concepts: string[];
  related: string[];
  useWhen: string[];
  guidance: string[];
  tradeoffs: string[];
  agentInstruction: string;
  examples: CodeExample[];
  references: string[];
};

export type Concept = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  relatedPatterns: string[];
  sections: {
    title: string;
    body: string[];
  }[];
};

export const patterns: Pattern[] = [
  {
    id: 'reader-locality',
    title: 'Reader Locality',
    summary:
      'Keep the next useful concept close to the code that needs it, especially when the abstraction is weak.',
    status: 'stable',
    tags: ['readability', 'organization', 'rust', 'review'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['rust', 'ts'],
    problems: ['The reader has to jump between weak helpers to understand one change.'],
    concepts: ['reader-locality', 'cognitive-burden'],
    related: ['chunk-statements', 'explaining-variable', 'avoid-premature-agent-architecture'],
    useWhen: [
      'A helper, type, or module only makes sense beside one caller.',
      'A review requires jumping across files to understand one local behavior.',
      'A proposed extraction reduces line count but increases the reader’s live mental stack.',
    ],
    guidance: [
      'Put the central item first, then place weak helpers near the caller that gives them meaning.',
      'Extract only concepts that have semantic coherence and can be understood locally.',
      'Prefer a little repetition over a distant abstraction that forces reconstruction.',
    ],
    tradeoffs: [
      'Strong reusable concepts can live farther away if their contract is clear.',
      'Generated code and framework conventions may impose a different file shape.',
      'Do not use locality as an excuse to leave unrelated responsibilities fused together.',
    ],
    agentInstruction:
      'Before extracting or moving code, check whether the new location reduces the reader’s live context. Keep weak helpers near their caller and prefer repo-local organization over generic architecture.',
    examples: [
      {
        title: 'Keep the helper beside the workflow it explains',
        path: 'src/report.rs',
        language: 'rust',
        code: `pub fn render_report(input: ReportInput) -> Result<String, ReportError> {
    let rows = collect_rows(input)?;
    let totals = summarize_rows(&rows);

    Ok(format_report(rows, totals))
}

fn collect_rows(input: ReportInput) -> Result<Vec<Row>, ReportError> {
    input.records.into_iter().map(Row::try_from).collect()
}

fn summarize_rows(rows: &[Row]) -> Totals {
    rows.iter().fold(Totals::default(), Totals::add_row)
}`,
      },
      {
        title: 'Keep a page-local formatter local until it becomes a concept',
        path: 'src/patterns/format.ts',
        language: 'ts',
        code: `export function patternSearchText(pattern: Pattern): string {
  return [
    pattern.title,
    pattern.summary,
    pattern.tags.join(' '),
    pattern.problems.join(' '),
  ].join(' ').toLowerCase();
}`,
      },
    ],
    references: [
      'epage Rust Style: central item first and caller-before-callee ordering.',
      'Software Change Preferences: optimize for reducing the reader’s live mental stack.',
    ],
  },
  {
    id: 'guard-clause',
    title: 'Use a Guard Clause',
    summary:
      'Exit early when a boring precondition would otherwise indent or obscure the main path.',
    status: 'stable',
    tags: ['readability', 'control-flow', 'refactoring', 'review'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['rust', 'js', 'go'],
    problems: ['The normal case is buried under validation, empty cases, or unsupported modes.'],
    concepts: ['reader-locality'],
    related: ['chunk-statements', 'parse-dont-validate', 'make-invalid-states-hard-to-express'],
    useWhen: [
      'The branch handles an empty case, invalid input, unsupported mode, or no-op.',
      'Continuing would make the main path more indented than the edge case.',
      'The early return does not skip meaningful cleanup or later behavior.',
    ],
    guidance: [
      'Put boring preconditions at the top of the function.',
      'Keep the main behavior visually prominent after the guards.',
      'Use domain-specific return values or errors rather than vague booleans.',
    ],
    tradeoffs: [
      'Too many guards can hide a missing input type or parser.',
      'In languages with manual cleanup, make cleanup ownership explicit before returning.',
      'A meaningful alternative path may deserve a named branch rather than a guard.',
    ],
    agentInstruction:
      'Use a guard clause when an empty case, validation failure, unsupported mode, or no-op would otherwise indent the main path. Keep the normal behavior visually prominent.',
    examples: [
      {
        title: 'Guard invalid input before parsing',
        path: 'src/parser.rs',
        language: 'rust',
        code: `pub fn parse_name(input: &str) -> Option<Name> {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return None;
    }

    Some(Name::new(trimmed))
}`,
      },
      {
        title: 'Guard missing DOM target',
        path: 'src/search.js',
        language: 'js',
        code: `export function attachSearch(input, results) {
  if (!input || !results) {
    return;
  }

  input.addEventListener('input', () => {
    results.dataset.query = input.value.trim().toLowerCase();
  });
}`,
      },
      {
        title: 'Guard empty work before allocating',
        path: 'internal/report/report.go',
        language: 'go',
        code: `func BuildReport(rows []Row) Report {
    if len(rows) == 0 {
        return Report{}
    }

    totals := summarize(rows)
    return Report{Rows: rows, Totals: totals}
}`,
      },
    ],
    references: ['Tidy First: guard clauses as small structural changes.'],
  },
  {
    id: 'chunk-statements',
    title: 'Chunk Statements',
    summary:
      'Group nearby statements into visible logic paragraphs so each phase of the workflow is easy to scan.',
    status: 'draft',
    tags: ['readability', 'formatting', 'review'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['rust', 'ts', 'go'],
    problems: ['A function is technically short but reads as one uninterrupted wall of work.'],
    concepts: ['reader-locality', 'cognitive-burden'],
    related: ['reader-locality', 'explaining-variable', 'smallest-trustworthy-verification'],
    useWhen: [
      'A function has setup, decision, mutation, and return phases.',
      'The statements are correct but the reader cannot see the workflow shape.',
      'A blank line would communicate a real change in intent.',
    ],
    guidance: [
      'Use blank lines as algorithm paragraphs.',
      'Keep each paragraph focused on one phase or side effect.',
      'Name intermediate values when the next paragraph depends on them.',
    ],
    tradeoffs: [
      'Blank lines should reveal structure, not decorate every statement.',
      'If every paragraph needs a heading comment, a function or concept may be missing.',
      'Do not split a dense expression if a single idiom is clearer to the local audience.',
    ],
    agentInstruction:
      'When a function is correct but hard to scan, group statements into logic paragraphs. Use blank lines only where the reader crosses a real phase boundary.',
    examples: [
      {
        title: 'Show phases with blank lines',
        path: 'src/import.ts',
        language: 'ts',
        code: `export function importPatterns(files: SourceFile[]) {
  const parsed = files.map(parsePatternFile);
  const valid = parsed.filter((pattern) => pattern.status !== 'rejected');

  const indexed = buildSearchIndex(valid);

  return {
    patterns: valid,
    index: indexed,
  };
}`,
      },
      {
        title: 'Mutation gets its own paragraph',
        path: 'internal/cache/cache.go',
        language: 'go',
        code: `func (c *Cache) Refresh(items []Item) {
    next := make(map[string]Item, len(items))
    for _, item := range items {
        next[item.ID] = item
    }

    c.mu.Lock()
    defer c.mu.Unlock()

    c.items = next
}`,
      },
    ],
    references: ['Software Change Preferences: use blank lines as logic paragraphs.'],
  },
  {
    id: 'explaining-variable',
    title: 'Use an Explaining Variable',
    summary:
      'Name an intermediate value when it lowers the reader’s burden more than another inline expression would.',
    status: 'draft',
    tags: ['readability', 'naming', 'refactoring'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['rust', 'js', 'java'],
    problems: ['The important call is hidden inside nested expressions or repeated conditions.'],
    concepts: ['cognitive-burden'],
    related: ['chunk-statements', 'reader-locality', 'parse-dont-validate'],
    useWhen: [
      'A boolean condition combines several domain facts.',
      'A nested expression makes the important call hard to scan.',
      'The name can express intent better than the operations alone.',
    ],
    guidance: [
      'Name the domain fact, not the implementation detail.',
      'Prefer a local variable over a helper when the value is only meaningful here.',
      'Keep the named value close to its use.',
    ],
    tradeoffs: [
      'Do not introduce a name that merely repeats the expression.',
      'If the same concept appears in many places, promote it to a real API.',
      'Avoid stale names when the expression changes.',
    ],
    agentInstruction:
      'Introduce an explaining variable when a local name makes the next line easier to read. Do not extract a helper unless the concept has meaning beyond this local use.',
    examples: [
      {
        title: 'Name the local condition',
        path: 'src/retry.rs',
        language: 'rust',
        code: `let retryable_error = error.is_timeout() || error.is_rate_limited();
let retry_budget_available = attempts < policy.max_attempts;

if retryable_error && retry_budget_available {
    schedule_retry(request, attempts + 1);
}`,
      },
      {
        title: 'Make the branch read like a decision',
        path: 'src/auth.js',
        language: 'js',
        code: `const canUseStoredSession =
  session &&
  session.expiresAt > Date.now() &&
  session.userId === request.userId;

if (canUseStoredSession) {
  return session;
}`,
      },
      {
        title: 'Give a Java stream result a role',
        path: 'Policy.java',
        language: 'java',
        code: `var matchingRules = rules.stream()
    .filter(rule -> rule.matches(request))
    .toList();

return Decision.from(matchingRules);`,
      },
    ],
    references: ['Tidy First: explaining variables and constants.'],
  },
  {
    id: 'separate-structure-from-behavior',
    title: 'Separate Structure From Behavior',
    summary:
      'Keep tidying changes separate from behavior changes when mixing them would make review or rollback harder.',
    status: 'stable',
    tags: ['workflow', 'review', 'refactoring', 'legacy-code'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['rust', 'ts'],
    problems: ['A diff mixes renames, moves, formatting, and behavior changes in one review unit.'],
    concepts: ['structure-vs-behavior'],
    related: ['characterize-before-changing', 'smallest-trustworthy-verification'],
    useWhen: [
      'The structural change can be verified independently.',
      'The behavior change is easier to review after a small tidy.',
      'Rollback would be risky if cleanup and logic are fused.',
    ],
    guidance: [
      'Make pure structure changes first when they lower risk for the behavior change.',
      'Keep the behavior-preserving change mechanically reviewable.',
      'Run the smallest trustworthy check after each unit.',
    ],
    tradeoffs: [
      'Tiny local cleanups can stay with behavior if separation would add noise.',
      'Do not tidy unrelated areas just because a behavior change is nearby.',
      'Legacy code may need characterization tests before either change is safe.',
    ],
    agentInstruction:
      'If a requested behavior change needs tidying, separate the behavior-preserving structure change from the behavior change unless the cleanup is tiny and local. Verify each unit independently.',
    examples: [
      {
        title: 'Structure-only rename before logic',
        path: 'src/change.ts',
        language: 'ts',
        code: `// Change 1: rename "items" to "activePatterns" everywhere.
const activePatterns = patterns.filter((pattern) => pattern.status !== 'archived');

// Change 2: update the active-pattern rule after the rename is reviewable.
const activePatterns = patterns.filter((pattern) => pattern.status === 'stable');`,
      },
      {
        title: 'Rust workflow split',
        path: 'src/migrate.rs',
        language: 'rust',
        code: `// First change: move parsing into parse_record without changing behavior.
let record = parse_record(line)?;

// Later change: add the new validation rule.
record.validate_required_fields()?;`,
      },
    ],
    references: ['Tidy First: separate tidying from behavior changes.'],
  },
  {
    id: 'characterize-before-changing',
    title: 'Characterize Before Changing',
    summary:
      'Pin observable behavior before changing risky legacy code, even when the current behavior is awkward.',
    status: 'draft',
    tags: ['legacy-code', 'testing', 'workflow'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['rust', 'java', 'go'],
    problems: ['Nobody is sure which quirks are bugs and which are depended-on behavior.'],
    concepts: ['observable-behavior'],
    related: ['observable-behavior-tests', 'find-the-seam', 'separate-structure-from-behavior'],
    useWhen: [
      'The code is hard to understand and lacks reliable tests.',
      'Consumers may depend on surprising behavior.',
      'A refactor or bug fix could accidentally change public output.',
    ],
    guidance: [
      'Write tests around inputs and outputs that callers can observe.',
      'Name the test after the behavior, not the implementation.',
      'After behavior is pinned, make the smallest change that improves the situation.',
    ],
    tradeoffs: [
      'Characterization tests can preserve bugs; mark suspicious behavior clearly.',
      'Do not overfit tests to private helper calls or exact formatting unless that is the contract.',
      'For tiny obvious changes, a cheaper check may be enough.',
    ],
    agentInstruction:
      'Before changing risky legacy code, add or identify a behavior-level test that would fail if callers see a different result. Preserve suspicious behavior first, then change it deliberately.',
    examples: [
      {
        title: 'Pin current Java behavior',
        path: 'LegacyInvoiceTest.java',
        language: 'java',
        code: `@Test
void keepsBlankDiscountCodeAsZeroDiscount() {
    var invoice = legacyPricing.price(orderWithDiscountCode(""));

    assertEquals(Money.zero(), invoice.discount());
}`,
      },
      {
        title: 'Rust golden test for parser output',
        path: 'tests/parser.rs',
        language: 'rust',
        code: `#[test]
fn preserves_legacy_empty_field_behavior() {
    let record = parse_record("name,,active").unwrap();

    assert_eq!(record.middle_name, Some(String::new()));
}`,
      },
    ],
    references: ['Working Effectively with Legacy Code: characterization tests.'],
  },
  {
    id: 'observable-behavior-tests',
    title: 'Observable Behavior Tests',
    summary:
      'Protect what callers can observe instead of freezing private implementation shape.',
    status: 'stable',
    tags: ['testing', 'review', 'legacy-code'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['rust', 'ts', 'go'],
    problems: ['Tests fail after harmless refactors because they assert private calls or structure.'],
    concepts: ['observable-behavior'],
    related: ['characterize-before-changing', 'smallest-trustworthy-verification'],
    useWhen: [
      'A test exists mainly to protect behavior through future refactors.',
      'Private helper assertions make safe structure changes expensive.',
      'The API or user-visible output is the real contract.',
    ],
    guidance: [
      'Assert outputs, persisted state, events, errors, and side effects the caller can observe.',
      'Use fixtures, snapshots, or golden files when the observable result is structured.',
      'Keep private helper tests only when the helper is a real concept with its own contract.',
    ],
    tradeoffs: [
      'Some low-level algorithms need direct tests for edge cases.',
      'Observable tests can be broader and slower; choose the cheapest trustworthy boundary.',
      'Do not ignore important error context just because it is not user-facing UI.',
    ],
    agentInstruction:
      'When adding or updating tests, prefer assertions against observable behavior. Avoid tests that only prove a private helper was called unless that helper owns a real contract.',
    examples: [
      {
        title: 'Test the rendered result',
        path: 'src/render.test.ts',
        language: 'ts',
        code: `it('shows stable patterns first', () => {
  const html = renderCatalog([draftPattern, stablePattern]);

  expect(html.indexOf('Stable Pattern')).toBeLessThan(html.indexOf('Draft Pattern'));
});`,
      },
      {
        title: 'Assert behavior at the Rust boundary',
        path: 'tests/search.rs',
        language: 'rust',
        code: `#[test]
fn finds_pattern_by_problem_terms() {
    let results = search(patterns(), "nested validation");

    assert!(results.iter().any(|pattern| pattern.slug == "guard-clause"));
}`,
      },
      {
        title: 'Go API behavior instead of internal calls',
        path: 'search_test.go',
        language: 'go',
        code: `func TestSearchFindsProblemTerms(t *testing.T) {
    results := Search(patterns, "mutation inside expressions")

    require.Contains(t, slugs(results), "avoid-premature-agent-architecture")
}`,
      },
    ],
    references: ['Software Change Preferences: tests should protect observable behavior.'],
  },
  {
    id: 'make-invalid-states-hard-to-express',
    title: 'Make Invalid States Hard to Express',
    summary:
      'Move checks into types, constructors, or parsing boundaries so the rest of the code handles valid states.',
    status: 'draft',
    tags: ['correctness', 'api-design', 'rust', 'testing'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['rust', 'ts', 'java'],
    problems: ['Every caller must remember the same validation rule before using a value.'],
    concepts: ['observable-behavior'],
    related: ['parse-dont-validate', 'guard-clause', 'observable-behavior-tests'],
    useWhen: [
      'The same invalid case is checked repeatedly.',
      'A function accepts values that make no sense for its operation.',
      'The type system can carry a useful invariant without excessive ceremony.',
    ],
    guidance: [
      'Create a more precise type at the boundary where uncertainty enters.',
      'Expose constructors that validate once and return a useful error.',
      'Make downstream functions accept the precise type, not raw input.',
    ],
    tradeoffs: [
      'Do not wrap values that are constructed and immediately destructured.',
      'Avoid parameter-bag types that only rename a long argument list.',
      'For one local branch, a guard clause may be simpler than a new type.',
    ],
    agentInstruction:
      'When repeated checks protect the same invariant, consider moving the check into a precise type or construction path. Avoid new wrapper types that do not reduce downstream reasoning.',
    examples: [
      {
        title: 'Rust constructor owns the invariant',
        path: 'src/email.rs',
        language: 'rust',
        code: `pub struct Email(String);

impl Email {
    pub fn parse(input: &str) -> Result<Self, EmailError> {
        if !input.contains('@') {
            return Err(EmailError::MissingAtSign);
        }

        Ok(Self(input.to_owned()))
    }
}`,
      },
      {
        title: 'TypeScript branded parse boundary',
        path: 'src/email.ts',
        language: 'ts',
        code: `type Email = string & { readonly kind: unique symbol };

export function parseEmail(input: string): Email | null {
  return input.includes('@') ? (input as Email) : null;
}`,
      },
    ],
    references: [
      'Rust API Guidelines: conversions, common traits, and predictable public APIs.',
      'Microsoft Pragmatic Rust Guidelines: document magic values and prefer static verification.',
    ],
  },
  {
    id: 'parse-dont-validate',
    title: 'Parse, Don’t Validate',
    summary:
      'Convert uncertain input into a precise representation once, then pass the precise value onward.',
    status: 'draft',
    tags: ['correctness', 'api-design', 'rust'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['rust', 'ts', 'go'],
    problems: ['Code validates raw input repeatedly but still passes the raw input around.'],
    concepts: ['observable-behavior'],
    related: ['make-invalid-states-hard-to-express', 'guard-clause', 'explaining-variable'],
    useWhen: [
      'A value crosses a trust boundary such as user input, config, or wire data.',
      'Later code needs a stronger promise than raw strings or maps can provide.',
      'Validation and use are separated far enough that the reader must remember the check.',
    ],
    guidance: [
      'Parse at the boundary and return either a precise value or an actionable error.',
      'Pass the parsed value through downstream APIs.',
      'Preserve enough error context for the caller to act.',
    ],
    tradeoffs: [
      'Do not introduce a parser for a one-off local condition.',
      'Parsing can reveal behavior changes; characterize risky legacy input first.',
      'Keep parser errors intentional rather than leaking low-level implementation details.',
    ],
    agentInstruction:
      'When raw input is validated and then reused, prefer parsing it into a precise type at the boundary. Downstream code should accept the parsed representation.',
    examples: [
      {
        title: 'Rust parse boundary',
        path: 'src/config.rs',
        language: 'rust',
        code: `pub fn load_config(raw: RawConfig) -> Result<Config, ConfigError> {
    Ok(Config {
        endpoint: Endpoint::parse(&raw.endpoint)?,
        retry_policy: RetryPolicy::from_raw(raw.retry)?,
    })
}`,
      },
      {
        title: 'TypeScript request parser',
        path: 'src/request.ts',
        language: 'ts',
        code: `export function parsePatternRequest(input: unknown): PatternRequest {
  const data = requestSchema.parse(input);
  return {
    query: data.query.trim(),
    tags: new Set(data.tags ?? []),
  };
}`,
      },
      {
        title: 'Go parses once at the boundary',
        path: 'config.go',
        language: 'go',
        code: `func ParseConfig(raw RawConfig) (Config, error) {
    endpoint, err := ParseEndpoint(raw.Endpoint)
    if err != nil {
        return Config{}, err
    }

    return Config{Endpoint: endpoint}, nil
}`,
      },
    ],
    references: ['Parse, Don’t Validate: convert uncertain input into precise data.'],
  },
  {
    id: 'smallest-trustworthy-verification',
    title: 'Smallest Trustworthy Verification',
    summary:
      'Run the cheapest check that can catch the likely failure before claiming the change is done.',
    status: 'stable',
    tags: ['workflow', 'testing', 'agents', 'review'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['rust', 'js'],
    problems: ['A change is marked done after either no check or an expensive unfocused check.'],
    concepts: ['observable-behavior', 'agent-guidance'],
    related: ['observable-behavior-tests', 'separate-structure-from-behavior'],
    useWhen: [
      'The likely failure mode is narrower than the full test suite.',
      'A fast local check can prove the changed surface still works.',
      'An agent or reviewer needs a credible completion signal.',
    ],
    guidance: [
      'Choose the check based on what changed: format, typecheck, unit test, route build, or smoke test.',
      'Run broader checks when shared contracts, generated artifacts, or public behavior changed.',
      'Report exactly what passed and what was not run.',
    ],
    tradeoffs: [
      'The cheapest check is not always trustworthy.',
      'Broad refactors may need full suites even when local tests pass.',
      'Manual visual checks matter for UI work after automated checks pass.',
    ],
    agentInstruction:
      'Before calling work complete, run the smallest check that can catch the likely failure. State what ran and do not imply broader verification than you performed.',
    examples: [
      {
        title: 'Rust targeted check before broader CI',
        path: 'justfile',
        language: 'bash',
        code: `cargo test parser::tests::finds_problem_terms
cargo fmt --check
cargo clippy --workspace --all-targets -- -D warnings`,
      },
      {
        title: 'Site smoke check',
        path: 'package.json',
        language: 'json',
        code: `"scripts": {
  "build": "astro build",
  "check:content": "astro sync && astro check"
}`,
      },
    ],
    references: ['Software Change Preferences: use the strongest cheap behavior-preservation check.'],
  },
  {
    id: 'repo-local-instructions-win',
    title: 'Repo-Local Instructions Win',
    summary:
      'Apply local project instructions before general preferences, pattern catalogs, or agent defaults.',
    status: 'stable',
    tags: ['agent-guidance', 'workflow', 'review'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['rust', 'ts'],
    problems: ['A general style preference conflicts with explicit repository guidance.'],
    concepts: ['agent-guidance'],
    related: ['avoid-premature-agent-architecture', 'smallest-trustworthy-verification'],
    useWhen: [
      'A repo has AGENTS.md, CONTRIBUTING, local style docs, or established patterns.',
      'A general best practice conflicts with local compatibility or maintainer preference.',
      'An agent is about to apply global defaults to an unfamiliar codebase.',
    ],
    guidance: [
      'Read local instructions first and treat them as the default authority.',
      'Prefer established local helpers, naming, routes, and workflows.',
      'Escalate only when local guidance is unsafe, contradictory, or impossible.',
    ],
    tradeoffs: [
      'Local style can be stale; do not preserve broken patterns blindly.',
      'Security, correctness, and explicit user requests can override local taste.',
      'When guidance conflicts, name the conflict rather than silently choosing.',
    ],
    agentInstruction:
      'Follow repo-local instructions first. Use TidySrc only when the project is silent or when a local pattern matches the same guidance.',
    examples: [
      {
        title: 'Agent instruction precedence',
        path: 'AGENTS.md',
        language: 'md',
        code: `Follow this repository's instructions first.

When the repository is silent, prefer concise changes, observable behavior tests,
and source code that reduces the reader's live mental stack.`,
      },
      {
        title: 'Local helper before generic utility',
        path: 'src/url.ts',
        language: 'ts',
        code: `// Prefer the local route builder so generated URLs match the app.
const href = patternHref(pattern.slug);

// Avoid introducing a generic URL helper for one local convention.`,
      },
    ],
    references: ['Agent guidance: local project guidance overrides general defaults.'],
  },
  {
    id: 'avoid-premature-agent-architecture',
    title: 'Avoid Premature Agent Architecture',
    summary:
      'Do not introduce broad architecture from one or two local examples, especially in agent-written code.',
    status: 'draft',
    tags: ['agent-guidance', 'architecture', 'review'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['ts', 'java', 'rust'],
    problems: ['A small feature grows a framework, registry, provider layer, or generic abstraction too soon.'],
    concepts: ['agent-guidance', 'cognitive-burden'],
    related: ['reader-locality', 'repo-local-instructions-win', 'separate-structure-from-behavior'],
    useWhen: [
      'A proposed abstraction has only one caller or two weakly similar callers.',
      'The abstraction hides mutation, ordering, or ownership that reviewers need to see.',
      'The change adds broad extension points without a concrete near-term user.',
    ],
    guidance: [
      'Implement the local behavior directly first.',
      'Extract only when duplication is real, semantic, and lowering reader burden.',
      'Prefer boring names and local helpers over architecture vocabulary.',
    ],
    tradeoffs: [
      'Some frameworks require early structure; follow the framework when it is the local idiom.',
      'Public APIs may need more deliberate shape before release.',
      'Do not use this pattern to reject all abstraction; reject abstractions that do not pay rent.',
    ],
    agentInstruction:
      'Do not create broad architecture from one local duplication. Prefer direct code and small local helpers until a real repeated concept appears.',
    examples: [
      {
        title: 'Local function before provider layer',
        path: 'src/catalog.ts',
        language: 'ts',
        code: `export function stablePatterns(patterns: Pattern[]) {
  return patterns.filter((pattern) => pattern.status === 'stable');
}

// Do not add PatternProvider, PatternStrategy, and PatternRegistry for this alone.`,
      },
      {
        title: 'Rust direct mapping before trait hierarchy',
        path: 'src/language.rs',
        language: 'rust',
        code: `pub fn language_label(language: &str) -> &str {
    match language {
        "ts" => "TypeScript",
        "js" => "JavaScript",
        "rs" | "rust" => "Rust",
        other => other,
    }
}`,
      },
    ],
    references: ['Software Change Preferences: extract concepts only with semantic coherence.'],
  },
];

export const concepts: Concept[] = [
  {
    id: 'reader-locality',
    title: 'Reader Locality',
    summary:
      'Put the next useful idea where the reader needs it, especially when the abstraction is weak.',
    tags: ['readability', 'organization'],
    relatedPatterns: ['reader-locality', 'chunk-statements', 'explaining-variable'],
    sections: [
      {
        title: 'Why it matters',
        body: [
          'Readers skim code under time pressure. Every jump to a weak helper, distant type, or generic abstraction consumes part of the reader’s live mental stack.',
          'Strong abstractions can live farther away because their contract carries meaning. Weak abstractions should either stay near their caller or disappear.',
        ],
      },
      {
        title: 'How to apply it',
        body: [
          'Open files with the central item when there is one. Arrange weak helpers in the order the reader naturally encounters them. Keep related types and inherent methods close.',
          'Prefer local names that explain the domain fact over generic names such as target, item, handler, processor, or context unless nearby words make the boundary clear.',
        ],
      },
    ],
  },
  {
    id: 'observable-behavior',
    title: 'Observable Behavior',
    summary:
      'Treat outputs, errors, persisted state, and visible side effects as the behavior tests should protect.',
    tags: ['testing', 'legacy-code'],
    relatedPatterns: ['observable-behavior-tests', 'characterize-before-changing'],
    sections: [
      {
        title: 'Why it matters',
        body: [
          'Refactors should be able to change private shape without breaking tests. Behavior tests should fail when callers would see a meaningful difference.',
          'In legacy code, characterization tests first document what happens today. Later changes can decide which quirks to preserve or intentionally change.',
        ],
      },
      {
        title: 'What counts',
        body: [
          'Useful observable surfaces include return values, errors, logs at boundaries, events, files, network calls, persisted records, generated HTML, and public API behavior.',
          'Private helper calls are observable only when the helper is itself a contract or integration seam.',
        ],
      },
    ],
  },
  {
    id: 'structure-vs-behavior',
    title: 'Structure Versus Behavior',
    summary:
      'Structure changes alter code shape; behavior changes alter what callers can observe.',
    tags: ['workflow', 'review'],
    relatedPatterns: ['separate-structure-from-behavior', 'smallest-trustworthy-verification'],
    sections: [
      {
        title: 'Why it matters',
        body: [
          'A tidy can make behavior work easier to review, but mixing both in one diff hides the risk. Separate them when review, rollback, or verification would be clearer.',
          'Structure changes include renames, moves, extraction, formatting, and local simplification that should preserve behavior.',
        ],
      },
      {
        title: 'How to verify',
        body: [
          'After a structure-only change, run a check that would catch accidental behavior movement. After the behavior change, run the check that targets the new rule.',
        ],
      },
    ],
  },
  {
    id: 'agent-guidance',
    title: 'Agent Guidance',
    summary:
      'Coding agents need concise local rules, explicit precedence, and verification matched to the change.',
    tags: ['agent-guidance', 'workflow'],
    relatedPatterns: ['repo-local-instructions-win', 'avoid-premature-agent-architecture'],
    sections: [
      {
        title: 'Default posture',
        body: [
          'Agents should read local instructions first, make the smallest coherent change, and avoid broad architecture that is not demanded by the current code.',
          'They should state the verification they ran and avoid implying that unrun checks passed.',
        ],
      },
      {
        title: 'Common failure modes',
        body: [
          'Frequent agent mistakes include hiding mutation inside pure-looking expressions, fragmenting code into many weak files, over-extracting from one example, and ignoring repo-local style.',
        ],
      },
    ],
  },
  {
    id: 'cognitive-burden',
    title: 'Cognitive Burden',
    summary:
      'Parameters, fields, jumps, concepts, and hidden side effects all add to what the reader must hold at once.',
    tags: ['readability', 'review'],
    relatedPatterns: ['explaining-variable', 'chunk-statements', 'reader-locality'],
    sections: [
      {
        title: 'Review heuristic',
        body: [
          'Ask whether the change reduces the number of live facts the next maintainer must remember. Line count matters less than the shape of that mental stack.',
          'A good abstraction should remove facts from the reader’s head. If it adds a concept without removing burden, it probably is not paying rent.',
        ],
      },
    ],
  },
];

export const references = [
  {
    title: 'Refactoring.com Catalog',
    href: 'https://refactoring.com/catalog/',
    note: 'Compact refactoring entries with durable names and stable links.',
  },
  {
    title: 'Enterprise Integration Patterns',
    href: 'https://www.enterpriseintegrationpatterns.com/patterns/messaging/toc.html',
    note: 'Classic pattern language structure with problem-oriented entries.',
  },
  {
    title: 'Microservices.io Patterns',
    href: 'https://microservices.io/patterns/index.html',
    note: 'Pattern groups framed by architecture problems and forces.',
  },
  {
    title: 'Rust API Guidelines Checklist',
    href: 'https://rust-lang.github.io/api-guidelines/checklist.html',
    note: 'Rust API naming, trait, conversion, and interoperability checklist.',
  },
  {
    title: 'Microsoft Pragmatic Rust Guidelines',
    href: 'https://microsoft.github.io/rust-guidelines/guidelines/checklist/index.html',
    note: 'Pragmatic Rust checklist emphasizing static verification and maintainability.',
  },
  {
    title: 'epage Rust Style',
    href: 'https://epage.github.io/dev/rust-style/',
    note: 'Reader-oriented Rust style guidance including caller-before-callee and central item first.',
  },
  {
    title: 'Rust Style Guide',
    href: 'https://doc.rust-lang.org/style-guide/',
    note: 'Default Rust formatting principles focused on readability and diff friendliness.',
  },
];

export const rustfmtToml = `edition = "2024"
use_field_init_shorthand = true
wrap_comments = true
comment_width = 100
format_code_in_doc_comments = true
normalize_doc_attributes = true
group_imports = "StdExternalCrate"
imports_granularity = "Module"
format_macro_matchers = true`;

export const clippyToml = `avoid-breaking-exported-api = false`;

export const markdownlintYaml = `config:
  MD013:
    line_length: 100
    heading_line_length: 100
    code_block_line_length: 100
    tables: false`;
