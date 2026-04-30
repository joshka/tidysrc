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
  narrative: string;
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
  examples?: CodeExample[];
  sections: {
    title: string;
    body: string[];
  }[];
};

export type Problem = {
  id: string;
  title: string;
  summary: string;
  impact: string;
  signals: string[];
  diagnosticQuestions: string[];
  approach: string[];
  relatedPatterns: string[];
  relatedConcepts: string[];
};

export const patterns: Pattern[] = [
  {
    id: 'reader-locality',
    title: 'Reader Locality',
    summary:
      'Keep related concepts close to the code that needs them, especially when the abstraction is weak.',
    narrative:
      'Reader Locality is about reducing the number of jumps a maintainer must make to understand one change. A helper, type, or module earns distance only when its name and contract carry enough meaning on their own. When an abstraction is weak, keeping it near the caller is often clearer than moving it into a shared layer that forces every reader to reconstruct the context.',
    status: 'stable',
    tags: ['readability', 'organization', 'rust', 'review'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['rust', 'ts'],
    problems: ['The reader has to jump between weak helpers to understand one change.'],
    concepts: ['reader-locality', 'cognitive-burden'],
    related: ['chunk-statements', 'explaining-variable', 'avoid-premature-agent-architecture'],
    useWhen: [
      'A helper, type, or module only makes sense beside one caller, and moving it away would make the caller harder to read.',
      'A review requires jumping across files to understand one local behavior, especially when the destination file does not expose a durable domain concept.',
      'A proposed extraction reduces line count but increases the reader’s live mental stack by adding names, files, or ordering rules they must remember.',
    ],
    guidance: [
      'Put the central item first, then place weak helpers near the caller that gives them meaning so the reader can follow the workflow top to bottom.',
      'Extract only concepts that have semantic coherence and can be understood locally from their name, inputs, outputs, and surrounding module.',
      'Keep small repetition when it leaves less review work than a distant abstraction.',
    ],
    tradeoffs: [
      'Strong reusable concepts can live farther away if their contract is clear enough that callers do not need to inspect the implementation.',
      'Generated code and framework conventions may impose a different file shape; respect those boundaries when fighting them would make the project less idiomatic.',
      'Do not use locality as an excuse to leave unrelated responsibilities fused together; locality should reduce reader burden, not hide missing design boundaries.',
    ],
    agentInstruction:
      'Before extracting or moving code, check whether the new location reduces the reader’s live context. Keep weak helpers near their caller and prefer repo-local organization over generic architecture.',
    examples: [
      {
        title: 'Keep the helper beside the workflow it explains',
        path: 'src/report.rs',
        language: 'rust',
        note:
          'The helper functions are not broad abstractions; they explain the phases of this report workflow and stay close to the caller that gives them meaning.',
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
        note:
          'The search text formatter belongs to the catalog page, so keeping it local avoids a generic utility for one behavior.',
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
      'Ed Page’s Rust Style: put the central item first and order helpers caller-before-callee.',
    ],
  },
  {
    id: 'guard-clause',
    title: 'Use a Guard Clause',
    summary:
      'Exit early when a boring precondition would otherwise indent or obscure the main path.',
    narrative:
      'A guard clause makes the exceptional or uninteresting path pay its cost up front. Instead of wrapping the main behavior in conditionals, it handles empty input, invalid state, unsupported modes, or no-op cases and then gets out of the way. The result should make the normal behavior more prominent, not merely replace one confusing branch shape with another.',
    status: 'stable',
    tags: ['readability', 'control-flow', 'refactoring', 'review'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['rust', 'js', 'go'],
    problems: ['The normal case is buried under validation, empty cases, or unsupported modes.'],
    concepts: ['reader-locality'],
    related: ['chunk-statements', 'parse-dont-validate', 'make-invalid-states-hard-to-express'],
    useWhen: [
      'The branch handles an empty case, invalid input, unsupported mode, or no-op that is less important than the behavior that follows.',
      'Continuing would make the main path more indented than the edge case, forcing readers to carry a condition while reading the real work.',
      'The early return does not skip cleanup or required behavior; ownership, locks, transactions, and deferred work are still explicit.',
    ],
    guidance: [
      'Put boring preconditions at the top of the function in the order a reader must rule them out before trusting the main path.',
      'Keep the main behavior visually prominent after the guards so the function reads as “reject invalid cases, then do the work.”',
      'Use domain-specific return values or errors so the guard states why execution stops.',
    ],
    tradeoffs: [
      'Too many guards can hide a missing input type or parser; repeated validation may belong at a construction boundary instead.',
      'In languages with manual cleanup, make cleanup ownership explicit before returning so the tidy does not introduce lifetime or resource bugs.',
      'A domain-relevant alternative path may deserve a named branch if both paths carry behavior a reader must compare.',
    ],
    agentInstruction:
      'Use a guard clause when an empty case, validation failure, unsupported mode, or no-op would otherwise indent the main path. Keep the normal behavior visually prominent.',
    examples: [
      {
        title: 'Before: hide the valid path behind a branch',
        path: 'src/parser.rs',
        language: 'rust',
        note:
          'This version is correct, but the useful parsing result sits inside the branch while the empty-input case controls the shape of the function.',
        code: `pub fn parse_name(input: &str) -> Option<Name> {
    let trimmed = input.trim();

    if !trimmed.is_empty() {
        Some(Name::new(trimmed))
    } else {
        None
    }
}`,
      },
      {
        title: 'After: guard invalid input before parsing',
        path: 'src/parser.rs',
        language: 'rust',
        note:
          'The parser rejects blank input before constructing a name, leaving the valid parsing path flat.',
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
        note:
          'The UI hook may run before both elements exist, so the guard avoids nesting the real event binding under a defensive check.',
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
        note:
          'The empty report case needs no allocation or summarization, so returning early keeps the normal report construction direct.',
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
      'Group nearby statements into visible logic paragraphs so each workflow phase is visible.',
    narrative:
      'Chunking statements uses whitespace to show the shape of a small algorithm. Each blank line should mark a change in intent such as setup, filtering, mutation, verification, or return assembly. A reviewer can read the function as a sequence of phases before reading each line closely.',
    status: 'draft',
    tags: ['readability', 'formatting', 'review'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['rust', 'ts', 'go'],
    problems: ['A function is technically short but reads as one uninterrupted wall of work.'],
    concepts: ['reader-locality', 'cognitive-burden'],
    related: ['reader-locality', 'explaining-variable', 'smallest-trustworthy-verification'],
    useWhen: [
      'A function has setup, decision, mutation, and return phases that are currently pressed together into one visual block.',
      'The statements are correct but the reader cannot see the workflow shape without simulating the whole function line by line.',
      'A blank line would communicate a real change in intent, such as moving from collecting data to mutating state or assembling the response.',
    ],
    guidance: [
      'Use blank lines as algorithm paragraphs, with each paragraph answering one local question for the reader.',
      'Keep each paragraph focused on one phase or side effect so mutation, validation, and return construction do not blur together.',
      'Name intermediate values when a following paragraph depends on them; the name becomes the bridge between phases.',
    ],
    tradeoffs: [
      'Blank lines should reveal structure, not decorate every statement; too much whitespace makes the function feel fragmented.',
      'If every paragraph needs a heading comment, a function or concept may be missing and the code may need a stronger extraction.',
      'Do not split a dense expression when the local idiom already reads as one thought.',
    ],
    agentInstruction:
      'When a function is correct but hard to scan, group statements into logic paragraphs. Use blank lines only where the reader crosses a real phase boundary.',
    examples: [
      {
        title: 'Show phases with blank lines',
        path: 'src/import.ts',
        language: 'ts',
        note:
          'The blank lines separate parsing, filtering, indexing, and return assembly so reviewers can see the workflow before reading each expression.',
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
        title: 'Rust setup, decision, and return paragraphs',
        path: 'src/import.rs',
        language: 'rust',
        note:
          'Each paragraph has one job: parse the files, reject invalid records, build the index, then assemble the return value.',
        code: `pub fn import_patterns(files: Vec<SourceFile>) -> Result<Catalog, ImportError> {
    let parsed = files
        .into_iter()
        .map(parse_pattern_file)
        .collect::<Result<Vec<_>, _>>()?;

    let valid = parsed
        .into_iter()
        .filter(|pattern| pattern.status != Status::Rejected)
        .collect::<Vec<_>>();

    let index = build_search_index(&valid);

    Ok(Catalog { patterns: valid, index })
}`,
      },
      {
        title: 'Mutation gets its own paragraph',
        path: 'internal/cache/cache.go',
        language: 'go',
        note:
          'The new map is prepared before the lock is taken, and the mutation is isolated in its own paragraph to highlight the side effect.',
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
    references: [],
  },
  {
    id: 'explaining-variable',
    title: 'Use an Explaining Variable',
    summary:
      'Name an intermediate value when it lowers the reader’s burden more than another inline expression would.',
    narrative:
      'An explaining variable turns an operation into a domain fact. It helps when the reader needs to know why a value matters before they care how it is computed. Spend a local name when that name makes the following branch, call, or return read in domain terms.',
    status: 'draft',
    tags: ['readability', 'naming', 'refactoring'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['rust', 'js', 'java'],
    problems: ['The important call is hidden inside nested expressions or repeated conditions.'],
    concepts: ['cognitive-burden'],
    related: ['chunk-statements', 'reader-locality', 'parse-dont-validate'],
    useWhen: [
      'A boolean condition combines several domain facts and the reader needs a name for the decision before evaluating the mechanics.',
      'A nested expression makes the important call hard to scan because setup, transformation, and decision logic are all inline.',
      'The name can express intent better than the operations alone, especially when the operations are generic but the result has domain meaning.',
    ],
    guidance: [
      'Name the domain fact, not the implementation detail, so the following line reads in terms of the behavior being decided.',
      'Prefer a local variable over a helper when the value belongs only to this caller and extraction would create a weak distant abstraction.',
      'Keep the named value close to its use so the reader does not have to remember the definition across unrelated work.',
    ],
    tradeoffs: [
      'Do not introduce a name that repeats the expression; the variable should add intent, grouping, or a review handle.',
      'If the same concept appears in many places, promote it to a real API instead of copying local names with subtly different meanings.',
      'Avoid stale names when the expression changes, because an inaccurate explaining variable is worse than an inline expression.',
    ],
    agentInstruction:
      'Introduce an explaining variable when a local name makes the following line easier to read. Do not extract a helper unless the concept has meaning beyond this local use.',
    examples: [
      {
        title: 'Name the local condition',
        path: 'src/retry.rs',
        language: 'rust',
        note:
          'The branch depends on two separate domain facts, so naming them lets the final condition read like a retry decision.',
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
        note:
          'The session checks are mechanical, but the branch is about whether the stored session can be reused for this request.',
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
        note:
          'The stream pipeline is still local, but naming its result tells the reader what role those filtered rules play.',
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
    narrative:
      'Structure and behavior fail in different ways. A rename, move, extraction, or formatting pass should be reviewable as behavior-preserving when no output, error, or side effect changes. A behavior change should expose the new rule. Separate units give reviewers a smaller diff, tests a clearer job, and rollback a narrower target.',
    status: 'stable',
    tags: ['workflow', 'review', 'refactoring', 'legacy-code'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['rust', 'ts'],
    problems: ['A diff mixes renames, moves, formatting, and behavior changes in one review unit.'],
    concepts: ['structure-vs-behavior'],
    related: ['characterize-before-changing', 'smallest-trustworthy-verification'],
    useWhen: [
      'The structural change can be verified independently, such as a rename, move, extraction, or formatting change that should preserve behavior.',
      'The behavior change is easier to review after a small tidy because the tidy removes incidental noise around the real rule.',
      'Rollback would be risky if cleanup and logic are fused, especially when a bug fix might need to be reverted without losing valuable structure.',
    ],
    guidance: [
      'Make pure structure changes first when they lower risk for the behavior change and can be checked without understanding the new behavior.',
      'Keep the behavior-preserving change mechanically reviewable by avoiding opportunistic edits outside the changed path.',
      'Run the smallest trustworthy check after each unit so accidental behavior movement is caught before the behavioral diff starts.',
    ],
    tradeoffs: [
      'Tiny local cleanups can stay with behavior if separation would add process noise and the cleanup is plainly inseparable from the changed lines.',
      'Do not tidy unrelated areas because a behavior change is nearby; that expands review scope without lowering risk.',
      'Legacy code may need characterization tests before either change is safe, because “structure-only” is hard to prove without a behavior signal.',
    ],
    agentInstruction:
      'If a requested behavior change needs tidying, separate the behavior-preserving structure change from the behavior change unless the cleanup is tiny and local. Verify each unit independently.',
    examples: [
      {
        title: 'Structure-only rename before logic',
        path: 'src/change.ts',
        language: 'ts',
        note:
          'The rename can be reviewed as a behavior-preserving step before the rule changes from “not archived” to “stable.”',
        code: `// Change 1: rename "items" to "activePatterns" everywhere.
const activePatterns = patterns.filter((pattern) => pattern.status !== 'archived');

// Change 2: update the active-pattern rule after the rename is reviewable.
const activePatterns = patterns.filter((pattern) => pattern.status === 'stable');`,
      },
      {
        title: 'Rust workflow split',
        path: 'src/migrate.rs',
        language: 'rust',
        note:
          'Moving parsing behind a named function is one change; adding the new validation rule is a separate behavior change.',
        code: `// Change 1: move parsing into parse_record without changing behavior.
let record = parse_record(line)?;

// Change 2: add the new validation rule.
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
    narrative:
      'Characterization is a safety move before it is a design move. In unfamiliar or under-tested code, the first job is to learn what callers can observe today, including behavior that looks accidental. Once that behavior is pinned, the team can decide what to preserve, what to fix, and which change actually moved the system.',
    status: 'draft',
    tags: ['legacy-code', 'testing', 'workflow'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['rust', 'java', 'go'],
    problems: ['Nobody is sure which quirks are bugs and which are depended-on behavior.'],
    concepts: ['observable-behavior'],
    related: ['observable-behavior-tests', 'find-the-seam', 'separate-structure-from-behavior'],
    useWhen: [
      'The code is hard to understand and lacks reliable tests, so a refactor would otherwise depend on the editor’s confidence alone.',
      'Consumers may depend on surprising behavior, including strange defaults, formatting quirks, or edge-case outputs that are not documented.',
      'A refactor or bug fix could accidentally change public output, error shape, persistence, or integration behavior while appearing local.',
    ],
    guidance: [
      'Write tests around inputs and outputs that callers can observe, not around private helper calls that the refactor is allowed to change.',
      'Name the test after the behavior, not the implementation, so future readers understand what contract is being protected.',
      'Pin the behavior, make one focused change, and rerun the characterization test to separate discovery from change.',
    ],
    tradeoffs: [
      'Characterization tests can preserve bugs; mark suspicious behavior clearly so the test records today’s contract without declaring it desirable.',
      'Do not overfit tests to private helper calls or exact formatting unless that detail is truly part of the external contract.',
      'Tiny obvious changes may only need a narrow check; risky legacy areas need a behavior pin before structure moves.',
    ],
    agentInstruction:
      'Before changing risky legacy code, add or identify a behavior-level test that would fail if callers see a different result. Preserve suspicious behavior first, then change it deliberately.',
    examples: [
      {
        title: 'Pin current Java behavior',
        path: 'LegacyInvoiceTest.java',
        language: 'java',
        note:
          'The test records today’s externally visible discount behavior before changing legacy pricing internals.',
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
        note:
          'The test captures the parser’s current empty-field output so a parser refactor cannot silently change that boundary.',
        code: `#[test]
fn preserves_legacy_empty_field_behavior() {
    let record = parse_record("name,,active").unwrap();

    assert_eq!(record.middle_name, Some(String::new()));
}`,
      },
      {
        title: 'Go test captures the legacy discount rule',
        path: 'pricing_test.go',
        language: 'go',
        note:
          'The test records a surprising expired-coupon behavior before the pricing code is reorganized.',
        code: `func TestExpiredCouponKeepsLegacyDiscount(t *testing.T) {
    invoice := Invoice{
        Subtotal: Money(100),
        Coupon:  Coupon{Code: "SPRING", Expired: true},
    }

    got := Price(invoice)

    require.Equal(t, Money(90), got.Total)
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
    narrative:
      'Observable behavior tests protect the contract a caller would notice: returned values, errors, rendered output, persisted state, events, or boundary side effects. They leave room to rename helpers, move code, and simplify internals without rewriting tests. The test should fail when behavior changes, not when the private route to that behavior changes.',
    status: 'stable',
    tags: ['testing', 'review', 'legacy-code'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['rust', 'ts', 'go'],
    problems: ['Tests fail after harmless refactors because they assert private calls or structure.'],
    concepts: ['observable-behavior'],
    related: ['characterize-before-changing', 'smallest-trustworthy-verification'],
    useWhen: [
      'A test exists mainly to protect behavior through future refactors, so it should describe the stable boundary instead of the current implementation path.',
      'Private helper assertions make safe structure changes expensive by failing when a call graph changes even though callers see the same result.',
      'The API or user-visible output is the real contract, including errors, events, files, network calls, persistence, and generated UI.',
    ],
    guidance: [
      'Assert outputs, persisted state, events, errors, and side effects the caller can observe at the cheapest boundary that still catches likely regressions.',
      'Use fixtures, snapshots, or golden files when the observable result is structured, but keep them focused enough that intentional changes remain reviewable.',
      'Keep private helper tests only when the helper is a real concept with its own contract, not a temporary decomposition detail.',
    ],
    tradeoffs: [
      'Some low-level algorithms need direct tests for edge cases because the algorithm itself is the contract being maintained.',
      'Observable tests can be broader and slower; choose the cheapest trustworthy boundary instead of defaulting to end-to-end coverage.',
      'Treat logs, diagnostics, and API errors as observable contracts when callers depend on them.',
    ],
    agentInstruction:
      'When adding or updating tests, prefer assertions against observable behavior. Avoid tests that only prove a private helper was called unless that helper owns a real contract.',
    examples: [
      {
        title: 'Test the rendered result',
        path: 'src/render.test.ts',
        language: 'ts',
        note:
          'The assertion checks what the rendered catalog exposes instead of pinning which helper sorted the patterns.',
        code: `it('shows stable patterns first', () => {
  const html = renderCatalog([draftPattern, stablePattern]);

  expect(html.indexOf('Stable Pattern')).toBeLessThan(html.indexOf('Draft Pattern'));
});`,
      },
      {
        title: 'Assert behavior at the Rust boundary',
        path: 'tests/search.rs',
        language: 'rust',
        note:
          'The test protects search behavior through the public search boundary, leaving internal indexing free to change.',
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
        note:
          'The test checks the returned pattern slugs instead of asserting how the search implementation walks its data.',
        code: `func TestSearchFindsProblemTerms(t *testing.T) {
    results := Search(patterns, "mutation inside expressions")

    require.Contains(t, slugs(results), "avoid-premature-agent-architecture")
}`,
      },
    ],
    references: ['Working Effectively with Legacy Code: characterize behavior before refactoring.'],
  },
  {
    id: 'make-invalid-states-hard-to-express',
    title: 'Make Invalid States Hard to Express',
    summary:
      'Move checks into types, constructors, or parsing boundaries so the rest of the code handles valid states.',
    narrative:
      'This pattern moves repeated “remember to check” work into a representation that carries the invariant. A precise type, constructor, or parser can make invalid values difficult or impossible to pass downstream. The payoff is highest when many callers repeat the same defensive checks or when one missed check can create a bug.',
    status: 'draft',
    tags: ['correctness', 'api-design', 'rust', 'testing'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['rust', 'ts', 'java'],
    problems: ['Every caller must remember the same validation rule before using a value.'],
    concepts: ['observable-behavior'],
    related: ['parse-dont-validate', 'guard-clause', 'observable-behavior-tests'],
    useWhen: [
      'The same invalid case is checked repeatedly, and each caller has to remember the rule before using the value safely.',
      'A function accepts values that make no sense for its operation, such as empty identifiers, unparsed URLs, or states that violate the domain model.',
      'The type system can carry an invariant without excessive ceremony, making valid code shorter than invalid code.',
    ],
    guidance: [
      'Create a more precise type at the boundary where uncertainty enters so downstream code receives a value it can trust.',
      'Expose constructors that validate once and return an actionable error with enough context for the caller to report or recover.',
      'Make downstream functions accept the precise type, not raw input, so the invariant is visible in signatures instead of comments.',
    ],
    tradeoffs: [
      'Do not wrap values that are constructed and immediately destructured; that adds ceremony without reducing the reader’s live facts.',
      'Avoid parameter-bag types that only rename a long argument list without enforcing a real relationship between the fields.',
      'For one local branch, a guard clause may be simpler than a new type because the invariant has not proven it needs a reusable representation.',
    ],
    agentInstruction:
      'When repeated checks protect the same invariant, consider moving the check into a precise type or construction path. Avoid new wrapper types that do not reduce downstream reasoning.',
    examples: [
      {
        title: 'Rust constructor owns the invariant',
        path: 'src/email.rs',
        language: 'rust',
        note:
          'The constructor validates once and returns an Email value that downstream functions can trust without repeating the same check.',
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
        note:
          'The parser converts an uncertain string into a branded Email so downstream APIs can ask for the precise value.',
        code: `type Email = string & { readonly kind: unique symbol };

export function parseEmail(input: string): Email | null {
  return input.includes('@') ? (input as Email) : null;
}`,
      },
      {
        title: 'Java value object replaces repeated checks',
        path: 'Email.java',
        language: 'java',
        note:
          'The static factory is the only place raw strings become Email values, so callers stop repeating the same validation before sending mail.',
        code: `public record Email(String value) {
    public static Email parse(String input) {
        if (!input.contains("@")) {
            throw new IllegalArgumentException("email must contain @");
        }

        return new Email(input);
    }
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
    narrative:
      'Parsing is validation plus a change in representation. Check raw input once, then convert it into a shape that encodes what is now known. This reduces repeated checks and makes downstream code read as if it operates on trusted domain values.',
    status: 'draft',
    tags: ['correctness', 'api-design', 'rust'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['rust', 'ts', 'go'],
    problems: ['Code validates raw input repeatedly but still passes the raw input around.'],
    concepts: ['observable-behavior'],
    related: ['make-invalid-states-hard-to-express', 'guard-clause', 'explaining-variable'],
    useWhen: [
      'A value crosses a trust boundary such as user input, config, environment variables, files, or wire data.',
      'Downstream code needs a stronger promise than raw strings or maps can provide, and that promise should be visible in the type or data shape.',
      'Validation and use are separated far enough that the reader must remember the check or wonder whether it already happened.',
    ],
    guidance: [
      'Parse at the boundary and return either a precise value or an actionable error, keeping uncertain input from leaking inward.',
      'Pass the parsed value through downstream APIs so callers do not need to repeat defensive validation.',
      'Preserve enough error context for the caller to act, especially when input came from users, config, or external systems.',
    ],
    tradeoffs: [
      'Do not introduce a parser for a one-off local condition when a guard clause or explaining variable communicates the rule directly.',
      'Parsing can reveal behavior changes; characterize risky legacy input first if callers may depend on loose acceptance.',
      'Keep parser errors intentional; low-level implementation details make the boundary harder to evolve.',
    ],
    agentInstruction:
      'When raw input is validated and then reused, prefer parsing it into a precise type at the boundary. Downstream code should accept the parsed representation.',
    examples: [
      {
        title: 'Rust parse boundary',
        path: 'src/config.rs',
        language: 'rust',
        note:
          'Raw configuration is converted at load time, so the rest of the app receives Endpoint and RetryPolicy values instead of loose fields.',
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
        note:
          'The request schema handles unknown input once and returns a normalized request object for the rest of the route.',
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
        note:
          'The raw endpoint string is parsed before Config is built, so callers cannot receive a Config with an unchecked endpoint.',
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
    narrative:
      'Verification should match the risk of the change. A focused unit test, typecheck, build, route smoke test, or visual check can catch the changed surface better than an expensive suite that misses it. Choose a check that could fail for the mistake the change is likely to introduce.',
    status: 'stable',
    tags: ['workflow', 'testing', 'agents', 'review'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['rust', 'js'],
    problems: ['A change is marked done after either no check or an expensive unfocused check.'],
    concepts: ['observable-behavior', 'agent-guidance'],
    related: ['observable-behavior-tests', 'separate-structure-from-behavior'],
    useWhen: [
      'The likely failure mode is narrower than the full test suite, such as a parser edge case, route render, type error, or formatting regression.',
      'A local check can prove the changed surface still works before broad CI runs.',
      'An agent or reviewer needs a credible completion signal that distinguishes checked work from plausible but unverified edits.',
    ],
    guidance: [
      'Choose the check based on what changed: format for formatting, typecheck for signatures, unit tests for logic, build for routes, and smoke tests for rendered UI.',
      'Run broader checks when shared contracts, generated artifacts, public behavior, or cross-module assumptions changed.',
      'Report exactly what passed and what was not run so the next person can judge residual risk without decoding your workflow.',
    ],
    tradeoffs: [
      'A cheap check is not trustworthy when it would pass despite the likely bug.',
      'Broad refactors may need full suites even when local tests pass because the risk is distributed across many callers.',
      'Manual visual checks matter for UI work after automated checks pass, because layout, contrast, and interaction can fail outside type systems.',
    ],
    agentInstruction:
      'Before calling work complete, run the smallest check that can catch the likely failure. State what ran and do not imply broader verification than you performed.',
    examples: [
      {
        title: 'Rust check aimed at the changed parser branch',
        path: 'src/parser.rs',
        language: 'rust',
        note:
          'The narrow test is trustworthy because it exercises the parser branch the change touched, before broader CI runs.',
        code: `#[test]
fn rejects_blank_pattern_names() {
    let error = parse_pattern_name("   ").unwrap_err();

    assert_eq!(error.kind(), ParseErrorKind::BlankName);
}`,
      },
      {
        title: 'JavaScript route smoke check',
        path: 'catalog.test.js',
        language: 'js',
        note:
          'The route-level assertion is cheaper than a full browser suite but still catches a broken pattern index render.',
        code: `test('pattern index renders stable entries', async () => {
  const response = await app.fetch('/patterns/');
  const html = await response.text();

  expect(response.status).toBe(200);
  expect(html).toContain('Use a Guard Clause');
});`,
      },
    ],
    references: ['Tidy First: behavior-preserving changes should stay small and easy to verify.'],
  },
  {
    id: 'repo-local-instructions-win',
    title: 'Repo-Local Instructions Win',
    summary:
      'Apply local project instructions before general preferences, pattern catalogs, or agent defaults.',
    narrative:
      'Repository instructions, existing helpers, naming schemes, test workflows, and maintainer preferences carry context that a generic pattern catalog cannot know. Agents and reviewers should preserve deliberate local coherence instead of replacing it with generic guidance.',
    status: 'stable',
    tags: ['agent-guidance', 'workflow', 'review'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['rust', 'ts', 'md'],
    problems: ['A general style preference conflicts with explicit repository guidance.'],
    concepts: ['agent-guidance'],
    related: ['avoid-premature-agent-architecture', 'smallest-trustworthy-verification'],
    useWhen: [
      'A repo has AGENTS.md, CONTRIBUTING, local style docs, or established patterns that define how work should be done there.',
      'General guidance conflicts with local compatibility, release constraints, or maintainer preference.',
      'An agent is about to apply global defaults to an unfamiliar codebase without first checking the repo’s own conventions.',
    ],
    guidance: [
      'Read local instructions first and treat them as the default authority unless the user explicitly overrides them.',
      'Prefer established local helpers, naming, routes, and workflows because consistency lowers review and maintenance cost.',
      'Escalate only when local guidance is unsafe, contradictory, or impossible, and make the conflict explicit instead of silently choosing.',
    ],
    tradeoffs: [
      'Local style can be stale; do not preserve broken patterns blindly when they conflict with correctness or clear maintainability.',
      'Security, correctness, and explicit user requests can override local taste, but the reason should be visible in the change or handoff.',
      'When guidance conflicts, name the conflict so the maintainer can correct the rule or approve the exception.',
    ],
    agentInstruction:
      'Follow repo-local instructions first. Use TidySrc only when the project is silent or when a local pattern matches the same guidance.',
    examples: [
      {
        title: 'Agent instruction precedence',
        path: 'AGENTS.md',
        language: 'md',
        note:
          'The instruction states precedence directly so an agent knows when local guidance overrides broader TidySrc defaults.',
        code: `Follow this repository's instructions first.

When the repository is silent, prefer concise changes, observable behavior tests,
and source code that reduces the reader's live mental stack.`,
      },
      {
        title: 'Local helper before generic utility',
        path: 'src/url.ts',
        language: 'ts',
        note:
          'The route builder already encodes local URL conventions, so it avoids another generic helper.',
        code: `// Prefer the local route builder so generated URLs match the app.
const href = patternHref(pattern.slug);

// Avoid introducing a generic URL helper for one local convention.`,
      },
      {
        title: 'Rust local constructor before generic conversion layer',
        path: 'src/config.rs',
        language: 'rust',
        note:
          'The project already constructs Config through this local helper, so new callers should keep the same boundary instead of adding a generic conversion framework.',
        code: `impl Config {
    pub fn from_env(env: &Env) -> Result<Self, ConfigError> {
        Ok(Self {
            endpoint: Endpoint::parse(env.required("ENDPOINT")?)?,
            timeout: Timeout::from_seconds(env.optional("TIMEOUT_SECONDS")?)?,
        })
    }
}`,
      },
    ],
    references: ['Agent guidance: local project guidance overrides general defaults.'],
  },
  {
    id: 'avoid-premature-agent-architecture',
    title: 'Avoid Premature Agent Architecture',
    summary:
      'Do not introduce broad architecture from one or two local examples, especially in agent-written code.',
    narrative:
      'Premature architecture often looks tidy in isolation: providers, registries, strategies, factories, and extension points can make a small change appear organized. Readers pay the cost when they must understand concepts that do not yet carry their weight. Use direct code until repetition is real, semantic, and reduces the number of facts a maintainer must hold.',
    status: 'draft',
    tags: ['agent-guidance', 'architecture', 'review'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['ts', 'java', 'rust'],
    problems: ['A small feature grows a framework, registry, provider layer, or generic abstraction too soon.'],
    concepts: ['agent-guidance', 'cognitive-burden'],
    related: ['reader-locality', 'repo-local-instructions-win', 'separate-structure-from-behavior'],
    useWhen: [
      'A proposed abstraction has only one caller or two weakly similar callers, so the shared concept is not yet proven.',
      'The abstraction hides mutation, ordering, or ownership that reviewers need to see to judge correctness.',
      'The change adds broad extension points without a concrete near-term user.',
    ],
    guidance: [
      'Implement the local behavior directly first so the real shape of the problem is visible before naming a framework around it.',
      'Extract only when duplication is real, semantic, and lowers reader burden instead of only reducing line count.',
      'Prefer boring names and local helpers over architecture vocabulary until the codebase has enough examples to justify stronger concepts.',
    ],
    tradeoffs: [
      'Some frameworks require early structure; follow the framework when it is the local idiom and readers expect that shape.',
      'Public APIs may need a deliberate shape before release because compatibility costs can make future extraction harder.',
      'Do not use this pattern to reject all abstraction; reject abstractions that do not pay rent in clarity, safety, or changeability.',
    ],
    agentInstruction:
      'Do not create broad architecture from one local duplication. Prefer direct code and small local helpers until a real repeated concept appears.',
    examples: [
      {
        title: 'Local function before provider layer',
        path: 'src/catalog.ts',
        language: 'ts',
        note:
          'The stable-pattern filter has one concrete use, so a local function solves the problem without inventing provider architecture.',
        code: `export function stablePatterns(patterns: Pattern[]) {
  return patterns.filter((pattern) => pattern.status === 'stable');
}

// Do not add PatternProvider, PatternStrategy, and PatternRegistry for this alone.`,
      },
      {
        title: 'Rust direct mapping before trait hierarchy',
        path: 'src/language.rs',
        language: 'rust',
        note:
          'A direct match exposes the supported labels; a trait hierarchy would hide a tiny mapping behind extension points.',
        code: `pub fn language_label(language: &str) -> &str {
    match language {
        "ts" => "TypeScript",
        "js" => "JavaScript",
        "rs" | "rust" => "Rust",
        other => other,
    }
}`,
      },
      {
        title: 'Java local helper before registry',
        path: 'PatternFilters.java',
        language: 'java',
        note:
          'The filtering rule is still one concrete behavior, so a local helper is clearer than a registry and strategy interface.',
        code: `static List<Pattern> stablePatterns(List<Pattern> patterns) {
    return patterns.stream()
        .filter(pattern -> pattern.status() == Status.STABLE)
        .toList();
}

// Do not introduce PatternProvider, PatternStrategy, and PatternRegistry
// until there are real extension points to name.`,
      },
    ],
    references: [],
  },
  {
    id: 'make-side-effects-visible',
    title: 'Make Side Effects Visible',
    summary:
      'Keep mutation, I/O, time, and external calls obvious at the point where a reader evaluates behavior.',
    narrative:
      'Hidden side effects make code look easier to reason about than it is. A function that reads like a pure calculation but writes state, sends events, mutates arguments, or reads time forces the reader to distrust every call. Make the effect visible in the name, return type, boundary, or surrounding statement shape.',
    status: 'draft',
    tags: ['correctness', 'readability', 'side-effects', 'review'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['go', 'rust', 'ts'],
    problems: ['A call that looks like a calculation also mutates state, performs I/O, or depends on ambient time.'],
    concepts: ['side-effect-visibility', 'cognitive-burden'],
    related: ['chunk-statements', 'smallest-trustworthy-verification', 'reader-locality'],
    useWhen: [
      'A reader cannot tell whether a call mutates input, writes global state, sends a message, reads the clock, or touches storage.',
      'A review depends on knowing when an external call happens, but that call is buried inside a helper or expression.',
      'Tests need awkward setup because behavior depends on ambient process state instead of explicit inputs.',
    ],
    guidance: [
      'Move side effects into their own statement or named boundary so the reader can see when the world changes.',
      'Name effectful functions with verbs that reveal the effect, such as save, publish, refresh, persist, lock, or notify.',
      'Pass clocks, random sources, clients, or stores explicitly when ambient access hides a behavior dependency.',
    ],
    tradeoffs: [
      'Some frameworks hide effects behind callbacks or lifecycle hooks; follow the local idiom but keep the hook name and boundary clear.',
      'Do not split every tiny assignment into ceremonial wrappers; the goal is to reveal behavior that changes review risk.',
      'Rust ownership can make mutation visible through signatures, while JavaScript and Go often need naming and statement structure to carry the same signal.',
    ],
    agentInstruction:
      'When a change adds mutation, I/O, time, randomness, or external calls, make the effect visible in the name, boundary, or statement shape. Do not hide it inside a pure-looking helper.',
    examples: [
      {
        title: 'Name the effectful boundary',
        path: 'src/session.ts',
        language: 'ts',
        note:
          'The write is visible in the function name and isolated after the decision, so the reader can separate calculation from persistence.',
        code: `export async function refreshSession(session: Session, store: SessionStore) {
  const refreshed = session.extend(clock.now());

  await store.saveSession(refreshed);

  return refreshed;
}`,
      },
      {
        title: 'Rust return value exposes mutation',
        path: 'src/cache.rs',
        language: 'rust',
        note:
          'The mutable receiver and returned status make the cache update visible at the call boundary.',
        code: `pub fn refresh_entry(&mut self, key: CacheKey, value: Value) -> RefreshStatus {
    let replaced = self.entries.insert(key, value).is_some();

    RefreshStatus { replaced }
}`,
      },
      {
        title: 'Go separates calculation from publish',
        path: 'internal/orders/complete.go',
        language: 'go',
        note:
          'The event publish is not hidden inside CompleteOrder, so retry and failure behavior are reviewable.',
        code: `order := CompleteOrder(command, clock.Now())

if err := repository.Save(ctx, order); err != nil {
    return err
}

return events.Publish(ctx, OrderCompleted{ID: order.ID})`,
      },
    ],
    references: [],
  },
  {
    id: 'cap-change-radius',
    title: 'Cap the Change Radius',
    summary:
      'Keep a change inside the smallest coherent set of files, calls, and concepts that can carry it.',
    narrative:
      'A change radius grows when a small rule forces edits across files, tests, builders, configs, and docs that do not own the behavior. Some radius is real coupling. Some is accidental shape. Before broadening a patch, ask which boundary should own the rule and which edits only exist because the current shape leaks it.',
    status: 'draft',
    tags: ['workflow', 'architecture', 'review'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['java', 'rust', 'ts'],
    problems: ['A small behavior change requires touching many distant files that do not own the behavior.'],
    concepts: ['change-radius', 'reader-locality'],
    related: ['reader-locality', 'separate-structure-from-behavior', 'parse-dont-validate'],
    useWhen: [
      'One rule change touches several layers because the rule is represented as loose data or repeated conditionals.',
      'A review has many mechanical edits that hide the file where the behavior actually lives.',
      'A caller needs to know too many downstream implementation details before it can make a small change safely.',
    ],
    guidance: [
      'Find the boundary that owns the rule and move the rule there before copying updates through callers.',
      'Separate mechanical call-site changes from the behavior change when the radius cannot be avoided.',
      'Use a precise type, policy object, or named helper only when it reduces the number of future edit sites.',
    ],
    tradeoffs: [
      'Large radii can be legitimate for public API changes; make that compatibility cost explicit instead of hiding it as cleanup.',
      'Do not create a central dumping ground just to reduce touched files; the new boundary must own the concept.',
      'Rust often exposes radius through type changes, while dynamic languages can hide radius until runtime or tests execute the path.',
    ],
    agentInstruction:
      'Before editing many files for one rule, identify the boundary that should own the rule. Keep the patch radius small or explain why the wider radius is a real contract change.',
    examples: [
      {
        title: 'Move the rule to the policy boundary',
        path: 'src/policy.ts',
        language: 'ts',
        note:
          'Callers stop repeating the stable-status rule; future changes edit the policy instead of every catalog view.',
        code: `export function canPublish(pattern: Pattern): boolean {
  return pattern.status === 'stable' && pattern.examples.length > 0;
}`,
      },
      {
        title: 'Rust type carries the rule through callers',
        path: 'src/publish.rs',
        language: 'rust',
        note:
          'Callers that receive PublishablePattern no longer repeat the same readiness checks before publishing.',
        code: `pub struct PublishablePattern(Pattern);

impl TryFrom<Pattern> for PublishablePattern {
    type Error = PublishError;

    fn try_from(pattern: Pattern) -> Result<Self, Self::Error> {
        pattern.ensure_ready()?;
        Ok(Self(pattern))
    }
}`,
      },
      {
        title: 'Java service narrows the edited surface',
        path: 'PublishPolicy.java',
        language: 'java',
        note:
          'Controllers ask the policy for the rule instead of repeating the same publish checks across endpoints.',
        code: `final class PublishPolicy {
    boolean canPublish(Pattern pattern) {
        return pattern.status() == Status.STABLE && !pattern.examples().isEmpty();
    }
}`,
      },
    ],
    references: [],
  },
  {
    id: 'make-state-transitions-explicit',
    title: 'Make State Transitions Explicit',
    summary:
      'Represent lifecycle changes as named transitions instead of scattered field writes and flag checks.',
    narrative:
      'State bugs often come from code that edits flags directly. A record can be draft, queued, published, archived, failed, and retried, but the allowed movement between those states is nowhere named. Explicit transitions give reviewers a place to check invariants, side effects, and invalid movements.',
    status: 'draft',
    tags: ['correctness', 'state', 'api-design'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['java', 'rust', 'ts'],
    problems: ['Lifecycle state changes happen through scattered flags, nullable fields, or direct property writes.'],
    concepts: ['state-space', 'observable-behavior'],
    related: ['make-invalid-states-hard-to-express', 'observable-behavior-tests'],
    useWhen: [
      'A value has a lifecycle and only some transitions are valid.',
      'Different callers update status fields directly and disagree about side effects or required timestamps.',
      'Tests need to build impossible states to exercise ordinary behavior.',
    ],
    guidance: [
      'Name transitions with verbs that describe the lifecycle move, such as submit, publish, archive, retry, or cancel.',
      'Keep invariant checks, timestamps, and transition events inside the transition boundary.',
      'Prefer enums or sealed variants over independent booleans when the states are mutually exclusive.',
    ],
    tradeoffs: [
      'A tiny two-state value may only need a boolean if the states are obvious and no transition logic exists.',
      'State machines can become ceremonial when the domain has no real transition rules; use them when they reduce impossible states.',
      'Java and TypeScript often need discipline or sealed unions; Rust enums can encode invalid transitions more directly.',
    ],
    agentInstruction:
      'When lifecycle state changes through scattered field writes, introduce a named transition boundary. Keep invariant checks and transition side effects together.',
    examples: [
      {
        title: 'TypeScript transition owns timestamp and event',
        path: 'src/patternStatus.ts',
        language: 'ts',
        note:
          'Publishing is a named transition, so the status change, timestamp, and event stay together.',
        code: `export function publish(pattern: DraftPattern, now: Date): PublishedPattern {
  return {
    ...pattern,
    status: 'published',
    publishedAt: now,
    events: [...pattern.events, { type: 'published', at: now }],
  };
}`,
      },
      {
        title: 'Rust enum rejects impossible states',
        path: 'src/job.rs',
        language: 'rust',
        note:
          'The retry transition exists only for failed jobs, so queued jobs cannot accidentally carry failure data.',
        code: `pub enum JobState {
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
}`,
      },
      {
        title: 'Java transition method owns the lifecycle move',
        path: 'PatternStatus.java',
        language: 'java',
        note:
          'Direct status assignment is replaced with a method that owns the allowed movement and timestamp.',
        code: `Pattern publish(Clock clock) {
    if (status != Status.DRAFT) {
        throw new InvalidTransition(status, Status.PUBLISHED);
    }

    return withStatus(Status.PUBLISHED, clock.instant());
}`,
      },
    ],
    references: [],
  },
  {
    id: 'replace-boolean-flag-with-choice',
    title: 'Replace Boolean Flag With a Choice',
    summary:
      'Turn ambiguous boolean parameters and fields into named options when the two states carry domain meaning.',
    narrative:
      'A boolean is cheap until a reader has to remember what true means at each call site. When a flag selects behavior, encodes a lifecycle state, or travels across module boundaries, a named choice can make the call read in domain terms and make future states possible without boolean drift.',
    status: 'draft',
    tags: ['api-design', 'naming', 'readability'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['java', 'rust', 'ts'],
    problems: ['Call sites pass true or false and the reader must inspect the function to know what behavior was selected.'],
    concepts: ['state-space', 'reader-locality'],
    related: ['make-invalid-states-hard-to-express', 'explaining-variable'],
    useWhen: [
      'The boolean crosses a function boundary and controls behavior rather than carrying a local fact.',
      'Several booleans combine into states that should be named directly.',
      'A third state is likely or already represented through null, comments, or another flag.',
    ],
    guidance: [
      'Replace the flag with an enum, union, options object, or named constructor that exposes the behavior at the call site.',
      'Keep local booleans when they name a nearby fact and do not leak into an API.',
      'Update tests to assert the behavior selected by the named choice, not the implementation branch.',
    ],
    tradeoffs: [
      'A local boolean condition can be clearer than a tiny enum when the name is visible and no API boundary is involved.',
      'Public API changes require migration care; introduce overloads or adapters when callers cannot move at once.',
      'Go lacks enums in the same shape as Rust or Java, so constants and small named types often carry this pattern.',
    ],
    agentInstruction:
      'When a boolean parameter selects domain behavior, replace it with a named choice at the boundary. Keep local boolean facts only when the meaning is visible beside the branch.',
    examples: [
      {
        title: 'TypeScript call site names the behavior',
        path: 'src/render.ts',
        language: 'ts',
        note:
          'The call no longer asks the reader to remember what true means for the second argument.',
        code: `type RenderMode = 'preview' | 'publish';

renderPattern(pattern, { mode: 'preview' });`,
      },
      {
        title: 'Java enum replaces paired booleans',
        path: 'NotificationMode.java',
        language: 'java',
        note:
          'The mode names the delivery behavior directly instead of combining flags at each call site.',
        code: `enum NotificationMode {
    SILENT,
    EMAIL,
    EMAIL_AND_SMS
}

notifier.send(message, NotificationMode.EMAIL);`,
      },
      {
        title: 'Rust enum names the render mode',
        path: 'src/render.rs',
        language: 'rust',
        note:
          'The call site chooses Preview or Publish explicitly instead of passing a boolean whose meaning lives in the callee.',
        code: `pub enum RenderMode {
    Preview,
    Publish,
}

render_pattern(pattern, RenderMode::Preview);`,
      },
    ],
    references: [],
  },
  {
    id: 'return-structured-errors',
    title: 'Return Structured Errors',
    summary:
      'Give callers error shape they can inspect instead of forcing them to parse strings or lose context.',
    narrative:
      'Errors are part of the observable contract when callers branch, retry, report, or recover from them. A string can explain a failure to a person, but it is weak program structure. Structured errors keep the stable kind, recoverable context, and human message in separate places.',
    status: 'draft',
    tags: ['errors', 'api-design', 'observable-behavior'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['go', 'rust', 'ts'],
    problems: ['Callers branch on error text or lose the context needed to recover, retry, or report the failure.'],
    concepts: ['observable-behavior', 'boundary-trust'],
    related: ['observable-behavior-tests', 'parse-dont-validate'],
    useWhen: [
      'A caller needs to distinguish retryable, validation, authorization, not-found, or conflict failures.',
      'Error messages contain data that tests or callers parse with string matching.',
      'A boundary has to preserve enough context for logs, UI copy, or recovery decisions.',
    ],
    guidance: [
      'Expose a stable error kind or variant for program behavior and keep human text separate.',
      'Attach context that helps recovery, such as field names, resource ids, retry hints, or upstream status.',
      'Test the stable error shape when it is part of the public contract.',
    ],
    tradeoffs: [
      'Do not over-model errors that are logged and returned only as opaque internal failures.',
      'Changing error shape can be a behavior change; characterize callers that depend on existing strings before replacing them.',
      'Rust and Go can make error typing visible through return signatures; JavaScript often needs explicit discriminated objects.',
    ],
    agentInstruction:
      'When callers need to inspect an error, return a structured kind and context instead of relying on message text. Preserve human messages as messages, not program control flow.',
    examples: [
      {
        title: 'Rust error kind carries program behavior',
        path: 'src/import_error.rs',
        language: 'rust',
        note:
          'The caller can branch on the error kind without parsing the display message.',
        code: `pub enum ImportError {
    MissingField { field: &'static str },
    DuplicateId { id: PatternId },
}`,
      },
      {
        title: 'TypeScript error object separates kind from message',
        path: 'src/errors.ts',
        language: 'ts',
        note:
          'The UI can render the message while retry logic uses the stable kind.',
        code: `type CatalogError =
  | { kind: 'not-found'; id: string; message: string }
  | { kind: 'invalid-filter'; field: string; message: string };`,
      },
      {
        title: 'Go typed error exposes retry behavior',
        path: 'errors.go',
        language: 'go',
        note:
          'The caller can inspect the error type for retry behavior while the message remains human-readable.',
        code: `type RateLimitError struct {
    RetryAfter time.Duration
}

func (e RateLimitError) Error() string {
    return "rate limit exceeded"
}`,
      },
    ],
    references: [],
  },
  {
    id: 'inject-time-and-randomness',
    title: 'Inject Time and Randomness',
    summary:
      'Pass clocks, timers, and random sources through boundaries when ambient access makes behavior hard to test.',
    narrative:
      'Time and randomness are inputs even when the code reads them from globals. Hiding them makes tests flaky, makes retries hard to reason about, and makes behavior depend on process state. Pass them explicitly at the boundary that owns the policy.',
    status: 'draft',
    tags: ['testing', 'determinism', 'side-effects'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['go', 'java', 'rust'],
    problems: ['Tests are flaky or awkward because code reads ambient time, timers, or randomness inside business logic.'],
    concepts: ['side-effect-visibility', 'temporal-coupling'],
    related: ['make-side-effects-visible', 'observable-behavior-tests'],
    useWhen: [
      'Business logic calls system time, sleeps, timers, UUID generation, or random number generators directly.',
      'Tests need waits, sleeps, or broad timing tolerances to pass.',
      'Retry, expiration, scheduling, or ordering behavior depends on time policy that should be visible.',
    ],
    guidance: [
      'Pass a clock, random source, or id generator into the boundary that owns the time-dependent decision.',
      'Keep framework-level time access at the edge and pass ordinary values inward when a full clock abstraction would be unnecessary.',
      'Write tests with fixed clocks or deterministic generators to protect the behavior without sleeping.',
    ],
    tradeoffs: [
      'Do not thread a clock through every function when only one boundary needs the current instant.',
      'Very low-level performance code may need direct time reads; isolate the effect and benchmark the real path.',
      'Go and Java commonly use interfaces for clocks; Rust can pass traits or concrete test clocks depending on ownership needs.',
    ],
    agentInstruction:
      'If business behavior depends on time or randomness, make that dependency explicit at the boundary and test with deterministic inputs. Do not add sleeps as verification.',
    examples: [
      {
        title: 'Go expiration check takes a clock',
        path: 'session.go',
        language: 'go',
        note:
          'Tests can pass a fixed clock instead of sleeping until a token expires.',
        code: `func (s Session) IsExpired(clock Clock) bool {
    return !clock.Now().Before(s.ExpiresAt)
}`,
      },
      {
        title: 'Java constructor receives the generated id',
        path: 'OrderService.java',
        language: 'java',
        note:
          'The service owns id generation policy, while Order construction stays deterministic.',
        code: `var orderId = idGenerator.nextOrderId();
var order = Order.create(orderId, request.items());`,
      },
      {
        title: 'Rust fixed clock makes expiry deterministic',
        path: 'src/session.rs',
        language: 'rust',
        note:
          'The test passes the instant directly, so expiration behavior does not depend on wall-clock timing.',
        code: `pub fn is_expired(&self, now: Instant) -> bool {
    now >= self.expires_at
}`,
      },
    ],
    references: [],
  },
  {
    id: 'keep-async-boundaries-explicit',
    title: 'Keep Async Boundaries Explicit',
    summary:
      'Make awaits, tasks, callbacks, and cancellation points visible where ordering and ownership matter.',
    narrative:
      'Async code fails when a reader cannot tell what runs now, what runs later, and what can be cancelled. A hidden task spawn or callback can detach ownership from the caller. Make the boundary visible and name the ordering contract.',
    status: 'draft',
    tags: ['async', 'correctness', 'review'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['go', 'rust', 'ts'],
    problems: ['A function starts background work or crosses an async boundary without making ordering, cancellation, or ownership clear.'],
    concepts: ['temporal-coupling', 'side-effect-visibility'],
    related: ['make-side-effects-visible', 'smallest-trustworthy-verification'],
    useWhen: [
      'A helper spawns background work, registers a callback, or starts a goroutine/task that outlives the caller.',
      'The caller needs to know whether work is complete before reading state or returning a response.',
      'Cancellation, timeout, or error propagation is part of the behavior being reviewed.',
    ],
    guidance: [
      'Keep awaits and spawns visible at the call site that owns ordering.',
      'Return handles, results, or cancellation paths when work outlives the current function.',
      'Use names that reveal detached work, such as start, spawn, enqueue, subscribe, or schedule.',
    ],
    tradeoffs: [
      'Framework handlers often impose async shape; keep the effect clear inside the handler even when the framework owns scheduling.',
      'Over-wrapping async calls can hide the same boundary under another name; expose the contract the caller needs.',
      'Rust forces more ownership choices at compile time, while JavaScript and Go need extra care around unawaited promises and goroutines.',
    ],
    agentInstruction:
      'When adding async work, make the await, spawn, callback, cancellation, and error path visible. Do not hide detached work in a helper that looks synchronous.',
    examples: [
      {
        title: 'TypeScript names the detached work',
        path: 'src/reindex.ts',
        language: 'ts',
        note:
          'The caller can see that indexing is scheduled, not completed, before the response returns.',
        code: `await repository.save(pattern);

await indexQueue.enqueueRebuild(pattern.id);

return { status: 'queued' };`,
      },
      {
        title: 'Go goroutine receives cancellation',
        path: 'worker.go',
        language: 'go',
        note:
          'The background worker is tied to context cancellation instead of leaking beyond the request lifecycle.',
        code: `go func() {
    if err := worker.Run(ctx, job); err != nil {
        logger.Error("worker failed", "err", err)
    }
}()`,
      },
      {
        title: 'Rust task returns a join handle',
        path: 'src/indexer.rs',
        language: 'rust',
        note:
          'The caller receives a handle, making detached work and error handling visible instead of hiding the spawn.',
        code: `pub fn spawn_reindex(job: ReindexJob) -> JoinHandle<Result<(), IndexError>> {
    tokio::spawn(async move {
        reindex(job).await
    })
}`,
      },
    ],
    references: [],
  },
  {
    id: 'name-cross-layer-contracts',
    title: 'Name Cross-Layer Contracts',
    summary:
      'Give data crossing layers a contract name instead of passing persistence, transport, or UI shapes everywhere.',
    narrative:
      'Layer leaks make every part of the system know about every other part. A database row travels to the UI, an HTTP payload becomes a domain object, or a component receives storage flags. Naming the contract at the boundary keeps the layer-specific shape from becoming everyone’s shared language.',
    status: 'draft',
    tags: ['architecture', 'api-design', 'boundaries'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['java', 'rust', 'ts'],
    problems: ['Database rows, API payloads, UI props, or framework types leak across boundaries that should own their own language.'],
    concepts: ['boundary-trust', 'reader-locality'],
    related: ['parse-dont-validate', 'reader-locality', 'cap-change-radius'],
    useWhen: [
      'A persistence record, wire payload, or UI-specific type is used in logic that should not know that layer exists.',
      'A field is named for storage mechanics rather than the domain decision the caller needs.',
      'Changing one layer forces unrelated layers to change because they share the same shape.',
    ],
    guidance: [
      'Create a boundary type or mapper where the layer changes language.',
      'Keep layer-specific names inside their layer and pass domain or view contracts across the next boundary.',
      'Map only when the contract changes; do not add translation objects that mirror fields without changing meaning.',
    ],
    tradeoffs: [
      'Small applications can tolerate some shared shapes when the boundary has not earned its cost.',
      'Public API and database compatibility may require separate shapes even when they look similar today.',
      'Java often uses DTOs here, Rust often uses explicit conversion types, and TypeScript needs care not to let structural typing blur boundaries again.',
    ],
    agentInstruction:
      'When data crosses persistence, transport, domain, or UI boundaries, name the contract at the boundary. Do not pass layer-specific shapes through unrelated code.',
    examples: [
      {
        title: 'TypeScript maps wire data to a view contract',
        path: 'src/patternView.ts',
        language: 'ts',
        note:
          'The component receives the view contract instead of depending on API field names.',
        code: `export function toPatternCard(pattern: PatternResponse): PatternCard {
  return {
    title: pattern.display_name,
    summary: pattern.short_summary,
    href: \`/patterns/\${pattern.slug}/\`,
  };
}`,
      },
      {
        title: 'Rust conversion marks the boundary',
        path: 'src/pattern.rs',
        language: 'rust',
        note:
          'The database row stops at the conversion boundary; domain code receives Pattern.',
        code: `impl TryFrom<PatternRow> for Pattern {
    type Error = PatternError;

    fn try_from(row: PatternRow) -> Result<Self, Self::Error> {
        Ok(Self {
            id: PatternId::parse(&row.slug)?,
            title: row.title,
        })
    }
}`,
      },
      {
        title: 'Java DTO stops at the controller boundary',
        path: 'PatternController.java',
        language: 'java',
        note:
          'The controller translates transport shape into a command before domain code sees it.',
        code: `CreatePattern command = new CreatePattern(
    request.slug(),
    request.displayName(),
    request.summary()
);

service.create(command);`,
      },
    ],
    references: [],
  },
  {
    id: 'centralize-configuration-policy',
    title: 'Centralize Configuration Policy',
    summary:
      'Parse and name configuration policy once so callers do not rediscover defaults, precedence, and magic values.',
    narrative:
      'Configuration drift happens when defaults, environment names, feature flags, and precedence rules spread through the code. A caller should receive the policy it needs, not a bag of raw config values plus unwritten rules about how to combine them.',
    status: 'draft',
    tags: ['configuration', 'correctness', 'boundaries'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['go', 'rust', 'ts'],
    problems: ['Defaults, feature flags, environment variables, and magic values are interpreted differently across callers.'],
    concepts: ['boundary-trust', 'change-radius'],
    related: ['parse-dont-validate', 'cap-change-radius', 'make-invalid-states-hard-to-express'],
    useWhen: [
      'Several modules read the same environment variable, config key, or feature flag directly.',
      'Callers apply defaults or precedence rules slightly differently.',
      'A magic number or string appears in logic that should receive a named policy.',
    ],
    guidance: [
      'Parse raw config once and pass named policy values inward.',
      'Put defaults and precedence rules in the config boundary that has enough context to explain them.',
      'Document surprising values with the domain reason, not only the value itself.',
    ],
    tradeoffs: [
      'Do not create a global config object that every module can reach; pass the narrow policy each caller needs.',
      'Some framework config must remain framework-shaped; adapt it at the edge before business code uses it.',
      'Rust and Go make narrow config structs cheap; TypeScript needs care to avoid passing loosely typed config objects everywhere.',
    ],
    agentInstruction:
      'When a change touches config, parse raw values at one boundary and pass narrow named policy inward. Do not scatter environment reads, defaults, or magic values across callers.',
    examples: [
      {
        title: 'Rust config boundary names retry policy',
        path: 'src/config.rs',
        language: 'rust',
        note:
          'Business code receives RetryPolicy, not loose integers and strings from the environment.',
        code: `pub struct AppConfig {
    pub retry_policy: RetryPolicy,
}

pub fn load_config(env: &Env) -> Result<AppConfig, ConfigError> {
    Ok(AppConfig {
        retry_policy: RetryPolicy::from_env(env)?,
    })
}`,
      },
      {
        title: 'Go passes narrow policy',
        path: 'config.go',
        language: 'go',
        note:
          'The worker receives only the timeout policy it needs, not the full raw configuration.',
        code: `type WorkerPolicy struct {
    Timeout time.Duration
    Retries int
}

worker := NewWorker(config.WorkerPolicy)`,
      },
      {
        title: 'TypeScript config parser owns defaults',
        path: 'src/config.ts',
        language: 'ts',
        note:
          'Callers receive a named retry policy instead of reading raw environment values and repeating defaults.',
        code: `export function loadRetryPolicy(env: Env): RetryPolicy {
  return {
    attempts: Number(env.RETRY_ATTEMPTS ?? 3),
    timeoutMs: Number(env.RETRY_TIMEOUT_MS ?? 500),
  };
}`,
      },
    ],
    references: [],
  },
];

export const concepts: Concept[] = [
  {
    id: 'reader-locality',
    title: 'Reader Locality',
    summary:
      'Put related ideas where the reader needs them, especially when the abstraction is weak.',
    tags: ['readability', 'organization'],
    relatedPatterns: ['reader-locality', 'chunk-statements', 'explaining-variable'],
    examples: [
      {
        title: 'Low locality: weak facts split across files',
        path: 'src/process.ts',
        language: 'ts',
        code: `// config.ts
export const APPROVAL_THRESHOLD = 42;

// score.ts
export function score(user: User) {
  return user.activity + user.reputation;
}

// process.ts
import { APPROVAL_THRESHOLD } from './config';
import { score } from './score';

export function process(user: User) {
  if (score(user) > APPROVAL_THRESHOLD) {
    approve(user);
  }
}`,
        note: 'The reader has to chase two weak abstractions before understanding one branch.',
      },
      {
        title: 'High locality: name the decision near use',
        path: 'src/process.ts',
        language: 'ts',
        code: `export function process(user: User) {
  if (isEligibleForApproval(user)) {
    approve(user);
  }
}

function isEligibleForApproval(user: User) {
  const approvalThreshold = 42;
  const score = user.activity + user.reputation;

  return score > approvalThreshold;
}`,
        note: 'The helper carries the domain decision and keeps the weak facts near the caller.',
      },
    ],
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
          'Refactors should be able to change private shape without breaking tests. Behavior tests should fail when callers would see a different result, error, event, or side effect.',
          'In legacy code, characterization tests document what happens today. Follow-up changes can decide which quirks to preserve or intentionally change.',
        ],
      },
      {
        title: 'What counts',
        body: [
          'Observable surfaces include return values, errors, logs at boundaries, events, files, network calls, persisted records, generated HTML, and public API behavior.',
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
          'An abstraction should remove facts from the reader’s head. If it adds a concept without removing burden, it does not pay rent.',
        ],
      },
    ],
  },
  {
    id: 'change-radius',
    title: 'Change Radius',
    summary:
      'The set of files, concepts, call sites, tests, and contracts that must move for one source change.',
    tags: ['workflow', 'architecture', 'review'],
    relatedPatterns: ['cap-change-radius', 'separate-structure-from-behavior', 'reader-locality'],
    sections: [
      {
        title: 'What expands it',
        body: [
          'A change radius grows when one rule is copied across callers, when raw data leaks through boundaries, or when tests assert private shape. Some radius is real compatibility cost; some is accidental structure.',
          'Large radius is not automatically wrong. It becomes a problem when many touched files do not own the behavior being changed.',
        ],
      },
      {
        title: 'How to reason about it',
        body: [
          'Find the boundary that should own the rule. If the radius is still large after that, split mechanical movement from behavior so review can isolate the risk.',
          'In Rust, type changes often reveal the radius at compile time. In TypeScript, JavaScript, Go, and Java, tests and call-site search often reveal it later.',
        ],
      },
    ],
  },
  {
    id: 'side-effect-visibility',
    title: 'Side Effect Visibility',
    summary:
      'A reader should be able to see where code mutates state, touches I/O, reads time, or starts work.',
    tags: ['side-effects', 'readability', 'testing'],
    relatedPatterns: [
      'make-side-effects-visible',
      'inject-time-and-randomness',
      'keep-async-boundaries-explicit',
    ],
    sections: [
      {
        title: 'Why it matters',
        body: [
          'Side effects change the review question. Pure calculation can be checked locally, while mutation, I/O, time, randomness, and background work require ordering and failure reasoning.',
          'A pure-looking helper with hidden effects makes every caller suspicious. The reader has to inspect implementation before trusting the call.',
        ],
      },
      {
        title: 'Language pressure',
        body: [
          'Rust signatures expose some effects through ownership and mutability, but I/O, time, and task spawning still need clear boundaries. Go, Java, TypeScript, and JavaScript rely more on names, return types, and statement shape.',
        ],
      },
    ],
  },
  {
    id: 'state-space',
    title: 'State Space',
    summary:
      'The set of states a program can represent, including impossible combinations the code accidentally permits.',
    tags: ['correctness', 'api-design', 'state'],
    relatedPatterns: [
      'make-state-transitions-explicit',
      'replace-boolean-flag-with-choice',
      'make-invalid-states-hard-to-express',
    ],
    sections: [
      {
        title: 'Review heuristic',
        body: [
          'Ask which states the code can represent, not only which states the developer intended. Invalid combinations are bugs waiting for the right call path.',
          'Independent booleans, nullable fields, and loose strings expand the state space. Enums, variants, constructors, and transition functions can reduce it.',
        ],
      },
      {
        title: 'Language pressure',
        body: [
          'Rust enums can encode mutually exclusive states directly. TypeScript discriminated unions can do the same when callers preserve the tag. Java sealed types and enums help when the domain has named states. Go often uses small typed constants plus constructors.',
        ],
      },
    ],
  },
  {
    id: 'boundary-trust',
    title: 'Boundary Trust',
    summary:
      'A boundary earns trust when it converts uncertain external shape into data the next layer can rely on.',
    tags: ['boundaries', 'api-design', 'correctness'],
    relatedPatterns: [
      'parse-dont-validate',
      'return-structured-errors',
      'name-cross-layer-contracts',
      'centralize-configuration-policy',
    ],
    sections: [
      {
        title: 'Boundary job',
        body: [
          'A boundary should translate uncertainty into a contract. Raw request data, database rows, environment variables, and third-party responses should not keep their raw shape after code has enough context to parse them.',
          'The next layer should receive a value it can trust or a structured error it can handle.',
        ],
      },
      {
        title: 'Failure mode',
        body: [
          'When boundaries only pass data through, validation, defaults, error handling, and layer vocabulary spread across callers. That creates drift and makes small rules expensive to change.',
        ],
      },
    ],
  },
  {
    id: 'temporal-coupling',
    title: 'Temporal Coupling',
    summary:
      'Code is temporally coupled when correctness depends on hidden ordering, timing, or lifecycle assumptions.',
    tags: ['async', 'testing', 'state'],
    relatedPatterns: [
      'keep-async-boundaries-explicit',
      'inject-time-and-randomness',
      'make-state-transitions-explicit',
    ],
    sections: [
      {
        title: 'What to look for',
        body: [
          'Hidden ordering appears as unawaited promises, goroutines without cancellation, callbacks that outlive their owner, sleeps in tests, and state that must be written before another method is called.',
          'Temporal coupling is hard to review because the relevant facts are often outside the lines being changed.',
        ],
      },
      {
        title: 'How to reduce it',
        body: [
          'Name lifecycle transitions, make async boundaries visible, pass clocks explicitly, and return handles or results when work continues after the current function.',
        ],
      },
    ],
  },
];

export const problems: Problem[] = [
  {
    id: 'hard-to-scan-control-flow',
    title: 'Hard-to-scan control flow',
    summary:
      'The normal path is buried under validation, branching, dense expressions, or incidental sequencing.',
    impact:
      'Readers spend their attention reconstructing execution order instead of judging whether the behavior is correct. That makes small reviews feel larger than they are and encourages agents to rewrite more code than the change requires.',
    signals: [
      'The function starts with the important work hidden several indentation levels deep.',
      'A reviewer has to keep several conditions in memory while reading the main behavior.',
      'A technically short function still feels like a wall because setup, decisions, mutation, and return assembly are visually blended.',
      'Dense expressions combine naming, calculation, branching, and side effects in one place.',
    ],
    diagnosticQuestions: [
      'What is the one path a maintainer should understand first?',
      'Which branches are preconditions, empty cases, or unsupported modes?',
      'Where does the function change from setup to decision to mutation to result assembly?',
      'Would naming one intermediate value remove a mental calculation from the reader?',
    ],
    approach: [
      'Make the main path visible. Use guard clauses for boring preconditions and keep the valid behavior unindented.',
      'Chunk nearby statements into logic paragraphs so phase changes are visible before a reader studies each line.',
      'Name intermediate decisions when the name carries domain meaning or removes repeated expression parsing.',
      'Stop before extracting broad architecture; a clearer local shape often solves the problem.',
    ],
    relatedPatterns: ['guard-clause', 'chunk-statements', 'explaining-variable'],
    relatedConcepts: ['reader-locality', 'cognitive-burden'],
  },
  {
    id: 'weak-abstractions-hide-context',
    title: 'Weak abstractions hide context',
    summary:
      'A helper, provider, strategy, registry, or module boundary makes readers jump without carrying enough meaning.',
    impact:
      'The code looks more organized but is harder to understand locally. Each extra name and file adds a live fact the reader must remember, and agents often multiply these abstractions when repo-local guidance is absent.',
    signals: [
      'A helper is used once and only makes sense beside its caller.',
      'The name describes mechanics, not a durable domain concept.',
      'A review requires opening several files to understand one small behavior.',
      'A proposed extraction reduces line count while increasing navigation and indirection.',
    ],
    diagnosticQuestions: [
      'Can the new name be understood from its signature and local module context?',
      'Does the abstraction remove a concept or add one?',
      'Is there a real second caller, or only a speculative one?',
      'Would keeping the code nearby make the workflow easier to verify?',
    ],
    approach: [
      'Keep weak helpers near the caller that gives them meaning.',
      'Promote code only when the extracted concept has a clear contract beyond mechanical reuse.',
      'Prefer a small amount of repetition over a premature shared layer when the repetition is easier to read and test.',
      'For agent work, state the boundary explicitly: do not add framework-shaped architecture unless the current change needs it.',
    ],
    relatedPatterns: ['reader-locality', 'avoid-premature-agent-architecture'],
    relatedConcepts: ['reader-locality', 'agent-guidance', 'cognitive-burden'],
  },
  {
    id: 'risky-legacy-change',
    title: 'Risky legacy change',
    summary:
      'The existing behavior is unclear, under-tested, or coupled to callers that a small edit can break.',
    impact:
      'The danger comes from uncertainty about intentional behavior. Without characterization, a tidy can silently become a product change.',
    signals: [
      'The code has few tests or tests that only cover internal helpers.',
      'A small edit changes parsing, error handling, ordering, or public output at the same time.',
      'Callers rely on behavior that is not written down anywhere.',
      'The reviewer needs to ask “what changed?” and the diff does not make that question answerable.',
    ],
    diagnosticQuestions: [
      'What observable behavior would prove the current system still works?',
      'Which outputs, errors, logs, side effects, or calls are part of the public contract?',
      'Can the structure be improved without changing behavior first?',
      'What is the smallest verification that would catch the likely regression?',
    ],
    approach: [
      'Characterize the current behavior before changing it, especially around edge cases and public boundaries.',
      'Separate structural cleanup from behavior changes so review can answer one question at a time.',
      'Protect observable behavior instead of private implementation shape.',
      'Use the smallest trustworthy verification loop before broadening tests or refactoring further.',
    ],
    relatedPatterns: [
      'characterize-before-changing',
      'separate-structure-from-behavior',
      'observable-behavior-tests',
      'smallest-trustworthy-verification',
    ],
    relatedConcepts: ['observable-behavior', 'structure-vs-behavior'],
  },
  {
    id: 'tests-freeze-private-shape',
    title: 'Tests freeze private shape',
    summary:
      'A test fails when internals move even though the user-visible behavior has not changed.',
    impact:
      'These tests make code harder to improve. They turn harmless refactors into test rewrites, train developers to avoid cleanup, and give agents false confidence because the suite is sensitive to the wrong thing.',
    signals: [
      'Tests assert private helper calls, exact internal ordering, or intermediate data that users never observe.',
      'A pure extraction or rename requires widespread test changes.',
      'Mocks encode implementation details instead of collaborator behavior.',
      'The test suite is noisy during structural changes but misses real output regressions.',
    ],
    diagnosticQuestions: [
      'What behavior would a user, caller, or downstream system actually observe?',
      'Could the same behavior be produced by a different internal shape?',
      'Is the mock verifying a contract or only the current implementation path?',
      'Would this assertion survive a legitimate refactor?',
    ],
    approach: [
      'Move assertions toward outputs, errors, side effects, persisted state, or collaborator contracts.',
      'Keep private-shape assertions only when the shape itself is the contract, such as ordering guarantees or performance-sensitive calls.',
      'When replacing brittle tests, keep enough coverage to protect the behavior before deleting the old assertions.',
      'For agents, make the verification target explicit so they do not satisfy the suite by preserving accidental internals.',
    ],
    relatedPatterns: ['observable-behavior-tests', 'smallest-trustworthy-verification'],
    relatedConcepts: ['observable-behavior'],
  },
  {
    id: 'raw-input-leaks-inward',
    title: 'Raw input leaks inward',
    summary:
      'Strings, maps, nullable values, or unchecked data move through the system after the boundary should have parsed them.',
    impact:
      'Every caller has to remember the same validation rules. That spreads defensive code, creates inconsistent edge handling, and makes invalid states look like normal application data.',
    signals: [
      'The same null, empty, format, or enum checks appear in multiple places.',
      'A type says string or boolean when the domain has a narrower set of valid states.',
      'Errors are discovered far from the input boundary that introduced them.',
      'A function accepts raw data even though every successful caller already validated it.',
    ],
    diagnosticQuestions: [
      'Where is the first point that has enough context to parse this input?',
      'What type would make the invalid state impossible or at least uncommon?',
      'Which checks are boundary validation and which are real business rules?',
      'Can callers receive a parsed value instead of being trusted to repeat the rule?',
    ],
    approach: [
      'Parse raw input at the boundary and pass domain values inward.',
      'Use guard clauses for local preconditions, but avoid repeated guards that signal a missing parsed type.',
      'Prefer constructors, enums, refined types, or result-bearing parsers that encode the successful state.',
      'Keep error messages and failure modes observable while improving the internal shape.',
    ],
    relatedPatterns: ['parse-dont-validate', 'make-invalid-states-hard-to-express', 'guard-clause'],
    relatedConcepts: ['observable-behavior', 'reader-locality'],
  },
  {
    id: 'mixed-diff-risk',
    title: 'Mixed diff risk',
    summary:
      'A single change mixes formatting, movement, renaming, behavior, tests, and cleanup until review cannot isolate the risk.',
    impact:
      'Mixed diffs make reviewers compare too many possible causes at once. Even when the final code is better, the diff hides behavioral changes and makes regressions harder to blame.',
    signals: [
      'A diff contains both pure movement and changed conditionals.',
      'Formatting churn surrounds a small behavior change.',
      'Test updates, renames, and production behavior changes are all needed to understand one patch.',
      'Reviewers cannot tell whether a failure came from cleanup or the intended behavior change.',
    ],
    diagnosticQuestions: [
      'Can the structural change be reviewed as behavior-preserving first?',
      'Which lines are supposed to alter observable behavior?',
      'Would a smaller verification pass prove the cleanup stayed neutral?',
      'Is this change easier to review as two stacked changes?',
    ],
    approach: [
      'Make behavior-preserving structure changes separately from behavior changes.',
      'Keep renames, movement, and formatting narrow enough that review can recognize them as neutral.',
      'Run focused verification after the structural step before changing behavior.',
      'Use source control to keep the stack honest instead of asking a reviewer to mentally split the diff.',
    ],
    relatedPatterns: [
      'separate-structure-from-behavior',
      'smallest-trustworthy-verification',
      'characterize-before-changing',
    ],
    relatedConcepts: ['structure-vs-behavior', 'observable-behavior'],
  },
  {
    id: 'agent-overbuilds',
    title: 'Agent overbuilds',
    summary:
      'Agent-written code adds broad architecture, generic frameworks, or non-local conventions for a narrow request.',
    impact:
      'The output may look polished while increasing maintenance cost. Extra files, providers, registries, and abstractions make human changes slower and can conflict with the repo’s existing design language.',
    signals: [
      'A small feature introduces a new architecture vocabulary.',
      'The implementation is organized around generic patterns instead of local code shape.',
      'The agent ignores nearby examples or repo-specific instructions.',
      'Verification proves the happy path but not the actual risk introduced by the abstraction.',
    ],
    diagnosticQuestions: [
      'What is the smallest local change that satisfies the request?',
      'Which existing repo pattern should the implementation imitate?',
      'Does the abstraction reduce concepts for the reader or add them?',
      'What instruction would prevent the agent from widening scope again?',
    ],
    approach: [
      'Read repo-local instructions and nearby code before applying generic guidance.',
      'Constrain the agent to the narrow behavior and explicit non-goals.',
      'Reject architecture whose main benefit is hypothetical future reuse.',
      'Ask for verification tied to the risk of the change, not only a broad test run.',
    ],
    relatedPatterns: [
      'repo-local-instructions-win',
      'avoid-premature-agent-architecture',
      'smallest-trustworthy-verification',
    ],
    relatedConcepts: ['agent-guidance', 'reader-locality', 'cognitive-burden'],
  },
  {
    id: 'unclear-done-signal',
    title: 'Unclear done signal',
    summary:
      'The change is considered complete without evidence that the relevant behavior still works.',
    impact:
      'A passing command matters only when it exercises the risk. Without a clear done signal, teams either over-test everything or accept shallow verification that misses the bug the change could realistically introduce.',
    signals: [
      'The final note says tests passed but does not say what behavior they protect.',
      'A broad suite is run because nobody knows the smallest relevant check.',
      'Manual inspection substitutes for an executable signal even when a targeted test is available.',
      'The verification step ignores the highest-risk branch or integration point.',
    ],
    diagnosticQuestions: [
      'What could this change realistically break?',
      'Which command, test, screenshot, or manual check would catch that break?',
      'Is a narrower check trustworthy enough, or does the change touch shared behavior?',
      'What evidence should a reviewer see in the final handoff?',
    ],
    approach: [
      'Choose the smallest verification that genuinely exercises the risk.',
      'Broaden verification when the change touches shared behavior, contracts, rendering, or integration points.',
      'State what was checked and what was not checked in the handoff.',
      'When no trustworthy check exists, say so directly and prefer adding characterization before larger edits.',
    ],
    relatedPatterns: ['smallest-trustworthy-verification', 'observable-behavior-tests'],
    relatedConcepts: ['observable-behavior', 'agent-guidance'],
  },
  {
    id: 'repeated-validation-rules',
    title: 'Repeated validation rules',
    summary:
      'Multiple callers repeat the same rules because the valid domain shape is not represented once.',
    impact:
      'Repeated validation looks defensive but often marks a weak domain boundary. Over time the rules drift, edge cases differ, and callers can pass values that should never exist inside the system.',
    signals: [
      'Several functions check the same string format, range, enum value, or nullability.',
      'Validation happens after data has already crossed multiple module boundaries.',
      'Callers disagree about what error to return for the same invalid input.',
      'The type system allows impossible combinations that every consumer has to reject.',
    ],
    diagnosticQuestions: [
      'What is the canonical place where this value becomes trusted?',
      'Can the validated value be named as its own type?',
      'Which callers should receive an error and which should never see raw input?',
      'Will this representation make common valid states easier to construct?',
    ],
    approach: [
      'Create a parsed or refined value at the boundary and pass that value inward.',
      'Move repeated validation rules into a constructor or parser with explicit failure behavior.',
      'Use invalid-state-resistant types where they reduce caller burden without over-modeling the domain.',
      'Keep behavior-visible error messages covered while consolidating the rule.',
    ],
    relatedPatterns: ['make-invalid-states-hard-to-express', 'parse-dont-validate'],
    relatedConcepts: ['observable-behavior', 'reader-locality'],
  },
  {
    id: 'hidden-side-effects',
    title: 'Hidden side effects',
    summary:
      'A call reads like a calculation but mutates state, performs I/O, reads time, or starts external work.',
    impact:
      'Hidden effects make review depend on implementation inspection. A maintainer cannot judge ordering, retries, or failure behavior from the call site, and tests often become broad because the real input or output is invisible.',
    signals: [
      'A helper named like a formatter, mapper, or calculator writes to storage or mutates its arguments.',
      'A code path reads the clock, random source, process environment, or global state from inside business logic.',
      'A review comment asks whether a call is safe to move, repeat, or skip.',
      'Tests need extensive setup because a pure-looking function depends on process state.',
    ],
    diagnosticQuestions: [
      'What does this call change outside its return value?',
      'Can the effect be seen from the function name, receiver, return type, or statement shape?',
      'Should the effect be passed in as a dependency or moved to a boundary?',
      'What verification would catch the effect happening at the wrong time?',
    ],
    approach: [
      'Separate calculation from mutation or I/O when the ordering matters.',
      'Rename or reshape effectful boundaries so the side effect is visible at the call site.',
      'Pass time, randomness, clients, stores, or publishers explicitly when ambient access hides behavior.',
      'Test the observable effect at the smallest boundary that can catch ordering or failure regressions.',
    ],
    relatedPatterns: [
      'make-side-effects-visible',
      'inject-time-and-randomness',
      'keep-async-boundaries-explicit',
    ],
    relatedConcepts: ['side-effect-visibility', 'temporal-coupling', 'observable-behavior'],
  },
  {
    id: 'boolean-flag-maze',
    title: 'Boolean flag maze',
    summary:
      'Booleans carry domain choices across function boundaries until call sites no longer explain themselves.',
    impact:
      'The reader has to remember what true and false mean in each position. As more flags appear, impossible combinations become representable and behavior changes hide inside argument order.',
    signals: [
      'Call sites pass true, false, false without local names.',
      'Two or more booleans combine into a lifecycle or mode.',
      'A third state appears as null, comments, or another flag.',
      'Tests name the boolean arrangement instead of the behavior selected by that arrangement.',
    ],
    diagnosticQuestions: [
      'What domain choice does this flag represent?',
      'Would an enum, union, named options object, or constructor make the call readable?',
      'Are these states mutually exclusive?',
      'Can invalid combinations be made harder to express?',
    ],
    approach: [
      'Replace boundary booleans with named choices when the flag selects behavior.',
      'Keep local boolean facts when the name is visible beside the branch.',
      'Move lifecycle choices into transition functions if the flag represents state movement.',
      'Update tests to assert the behavior selected by the named choice.',
    ],
    relatedPatterns: [
      'replace-boolean-flag-with-choice',
      'make-state-transitions-explicit',
      'make-invalid-states-hard-to-express',
    ],
    relatedConcepts: ['state-space', 'reader-locality'],
  },
  {
    id: 'ambiguous-state-transitions',
    title: 'Ambiguous state transitions',
    summary:
      'Lifecycle state changes happen through direct field writes, loose status strings, or scattered flag updates.',
    impact:
      'No single place owns the invariants of the transition. Callers can skip timestamps, events, validation, or cleanup because changing state looks like ordinary assignment.',
    signals: [
      'Several modules assign status fields directly.',
      'A state change should emit an event or timestamp, but that side effect is optional at call sites.',
      'Tests build impossible state combinations to reach common behavior.',
      'The code has multiple booleans that describe one lifecycle.',
    ],
    diagnosticQuestions: [
      'What states can this value occupy?',
      'Which transitions are legal, and which should be rejected?',
      'What side effects must happen with the transition?',
      'Can the type system or a named transition function reject invalid movement?',
    ],
    approach: [
      'Name lifecycle transitions and put invariant checks inside them.',
      'Use enums, sealed variants, or typed constants for mutually exclusive states.',
      'Keep transition side effects, timestamps, and events beside the state change.',
      'Characterize current transition behavior before changing legacy lifecycles.',
    ],
    relatedPatterns: [
      'make-state-transitions-explicit',
      'make-invalid-states-hard-to-express',
      'characterize-before-changing',
    ],
    relatedConcepts: ['state-space', 'temporal-coupling', 'observable-behavior'],
  },
  {
    id: 'error-context-lost',
    title: 'Error context lost',
    summary:
      'Failures cross a boundary as strings, generic exceptions, or dropped causes that callers cannot inspect.',
    impact:
      'Callers cannot recover, retry, report, or test failure behavior without parsing text or relying on logs. Error messages become accidental APIs while useful context disappears.',
    signals: [
      'Code checks error.message or string contents to choose behavior.',
      'A low-level error is wrapped without the field, id, status, or retry hint that explains recovery.',
      'Tests assert vague failure text instead of a stable error kind.',
      'The UI cannot show useful feedback without duplicating parser logic.',
    ],
    diagnosticQuestions: [
      'Which part of this error is stable program behavior?',
      'Which context would help the caller recover or report the failure?',
      'Does changing this error shape affect public behavior?',
      'Can the human message remain separate from the machine-readable kind?',
    ],
    approach: [
      'Return structured errors with stable kinds and recovery context.',
      'Preserve causes when they matter for debugging, but do not force callers to parse cause text.',
      'Test public error shape when callers depend on it.',
      'Characterize legacy string errors before replacing them if callers may already parse them.',
    ],
    relatedPatterns: [
      'return-structured-errors',
      'observable-behavior-tests',
      'characterize-before-changing',
    ],
    relatedConcepts: ['observable-behavior', 'boundary-trust'],
  },
  {
    id: 'time-dependent-tests',
    title: 'Time-dependent tests',
    summary:
      'Tests sleep, wait, or depend on the wall clock because time is hidden inside the code under test.',
    impact:
      'The suite becomes slow and flaky, and failures are hard to diagnose. The test is checking scheduler luck instead of the behavior that should change when time advances.',
    signals: [
      'Tests call sleep or use wide timing tolerances.',
      'Business logic reads Date.now, Instant.now, time.Now, or random identifiers directly.',
      'Expiration, retry, or ordering behavior cannot be tested without waiting.',
      'A failure disappears when the timeout is increased.',
    ],
    diagnosticQuestions: [
      'What time value or random source is part of the behavior?',
      'Which boundary owns the policy that reads time?',
      'Can the test pass a fixed clock or generated id?',
      'Would a deterministic test catch the same regression without sleeping?',
    ],
    approach: [
      'Pass time and randomness through the boundary that owns the policy.',
      'Use fixed clocks, deterministic id generators, or explicit instants in tests.',
      'Keep direct wall-clock access at edges that truly own scheduling.',
      'Avoid sleeps as verification unless the behavior being tested is the scheduler itself.',
    ],
    relatedPatterns: [
      'inject-time-and-randomness',
      'make-side-effects-visible',
      'smallest-trustworthy-verification',
    ],
    relatedConcepts: ['temporal-coupling', 'side-effect-visibility'],
  },
  {
    id: 'unclear-async-ownership',
    title: 'Unclear async ownership',
    summary:
      'Async work starts without a clear owner for ordering, cancellation, errors, or lifetime.',
    impact:
      'Work can outlive the request, fail silently, race with subsequent reads, or leak resources. Reviewers cannot tell whether returning from a function means the work finished or was only scheduled.',
    signals: [
      'Promises are created without awaits or returned handles.',
      'Goroutines, tasks, callbacks, or subscriptions have no cancellation path.',
      'Errors from background work are logged inconsistently or lost.',
      'A caller reads state immediately after scheduling work and assumes it is complete.',
    ],
    diagnosticQuestions: [
      'Who owns this async work after the current function returns?',
      'What happens if the caller is cancelled or times out?',
      'Where do errors go?',
      'Does the caller need completion, scheduling, or a handle?',
    ],
    approach: [
      'Make awaits, spawns, callbacks, and queues visible at the boundary that owns ordering.',
      'Return a result, handle, or queued status when work continues after the current function.',
      'Pass cancellation or context through detached work.',
      'Test the observable ordering or cancellation behavior instead of only the happy path.',
    ],
    relatedPatterns: [
      'keep-async-boundaries-explicit',
      'make-side-effects-visible',
      'observable-behavior-tests',
    ],
    relatedConcepts: ['temporal-coupling', 'side-effect-visibility'],
  },
  {
    id: 'layer-language-leaks',
    title: 'Layer language leaks',
    summary:
      'Database rows, API payloads, UI props, or framework objects become the shared language of unrelated layers.',
    impact:
      'A change in one layer forces distant code to change because the boundary never translated the shape. Readers must understand storage, transport, and UI details to review domain behavior.',
    signals: [
      'Domain logic depends on database column names or HTTP payload fields.',
      'UI components receive persistence flags that should have been converted into view state.',
      'A storage migration changes application logic that does not own persistence.',
      'Mapping code exists, but it only copies fields without naming the contract change.',
    ],
    diagnosticQuestions: [
      'Which layer owns this field name and shape?',
      'What contract does the next layer need?',
      'Does mapping change meaning or only mirror fields?',
      'Would a named boundary type reduce future change radius?',
    ],
    approach: [
      'Name the contract where data crosses layer language.',
      'Map persistence, transport, domain, and UI shapes only when the next layer needs a different contract.',
      'Keep raw external shape from leaking inward after the boundary has enough context to parse it.',
      'Avoid empty DTO churn that mirrors fields without changing meaning.',
    ],
    relatedPatterns: [
      'name-cross-layer-contracts',
      'parse-dont-validate',
      'cap-change-radius',
    ],
    relatedConcepts: ['boundary-trust', 'change-radius', 'reader-locality'],
  },
  {
    id: 'configuration-drift',
    title: 'Configuration drift',
    summary:
      'Defaults, feature flags, environment variables, and magic values are interpreted differently across callers.',
    impact:
      'The running system can behave differently depending on which path read the config. A small policy change becomes a search-and-edit task with hidden edge cases.',
    signals: [
      'Multiple modules read the same environment variable or feature flag directly.',
      'Defaults are repeated as literals in business logic.',
      'A config key is parsed in several places with different error handling.',
      'Changing a timeout, retry count, or mode requires edits outside the config boundary.',
    ],
    diagnosticQuestions: [
      'Which boundary owns this config value and its default?',
      'What named policy should callers receive?',
      'Are precedence rules documented in code or recreated at call sites?',
      'Can the raw value be parsed once and passed inward as a precise type?',
    ],
    approach: [
      'Parse raw config at one boundary and pass narrow policy values inward.',
      'Name defaults and magic values by their domain role.',
      'Keep framework-shaped config at the framework edge.',
      'Test surprising precedence or default behavior as observable behavior.',
    ],
    relatedPatterns: [
      'centralize-configuration-policy',
      'parse-dont-validate',
      'cap-change-radius',
    ],
    relatedConcepts: ['boundary-trust', 'change-radius'],
  },
  {
    id: 'wide-change-radius',
    title: 'Wide change radius',
    summary:
      'A small rule change spreads across files, tests, and callers that do not own the rule.',
    impact:
      'The review becomes larger than the behavior. More files mean more merge risk, more verification burden, and more chances for an agent to modify unrelated code.',
    signals: [
      'One condition is copied across views, handlers, tests, and helpers.',
      'A small wording or policy change touches many unrelated files.',
      'Reviewers cannot find the one file that owns the behavior.',
      'A type or config change creates mechanical edits mixed with behavior edits.',
    ],
    diagnosticQuestions: [
      'Which boundary should own this rule?',
      'Which touched files are mechanical fallout?',
      'Can structural changes be stacked before the behavior change?',
      'Would a precise type or policy object reduce future edit sites?',
    ],
    approach: [
      'Move the rule to the boundary that owns it before updating every caller.',
      'Separate mechanical radius from behavior radius when both are needed.',
      'Use targeted verification after each unit of the change.',
      'Avoid centralizing unrelated rules only to reduce file count.',
    ],
    relatedPatterns: [
      'cap-change-radius',
      'separate-structure-from-behavior',
      'smallest-trustworthy-verification',
    ],
    relatedConcepts: ['change-radius', 'structure-vs-behavior'],
  },
  {
    id: 'silent-failure-paths',
    title: 'Silent failure paths',
    summary:
      'The code swallows errors, returns empty results, or logs and continues when callers need to know work failed.',
    impact:
      'Failures become harder to diagnose and can corrupt downstream assumptions. The system appears to succeed while skipping behavior that callers or users depend on.',
    signals: [
      'Catch blocks log errors and return defaults without telling the caller.',
      'A failed write or publish produces the same return shape as success.',
      'Tests only cover the happy path and one generic failure.',
      'Operational logs show errors that user-visible state never reports.',
    ],
    diagnosticQuestions: [
      'Who needs to know that this work failed?',
      'Is an empty result a valid domain outcome or a hidden error?',
      'What context would help recovery or reporting?',
      'Should the failure be represented as a structured error, event, or state transition?',
    ],
    approach: [
      'Return structured failures when callers can recover or report them.',
      'Use domain-specific empty states only when absence is valid behavior.',
      'Test failure behavior at the boundary where callers observe it.',
      'Keep logging as diagnostics, not as the only behavior signal.',
    ],
    relatedPatterns: [
      'return-structured-errors',
      'observable-behavior-tests',
      'make-state-transitions-explicit',
    ],
    relatedConcepts: ['observable-behavior', 'boundary-trust'],
  },
  {
    id: 'concurrency-assumptions-hidden',
    title: 'Concurrency assumptions hidden',
    summary:
      'Shared state, ordering, locks, or idempotency assumptions are implicit in code that may run concurrently.',
    impact:
      'The code can pass local tests while failing under real scheduling. Reviewers cannot tell which data is protected, which operations can repeat, or which order must be preserved.',
    signals: [
      'Shared mutable state is updated without an obvious lock or ownership boundary.',
      'Retry code is added without making the operation idempotent.',
      'A background task reads data that another path mutates.',
      'Tests rely on a single-threaded execution order that production does not guarantee.',
    ],
    diagnosticQuestions: [
      'What owns this shared state?',
      'Can this operation run twice or out of order?',
      'Where is cancellation or retry handled?',
      'What test or review evidence would catch the likely race?',
    ],
    approach: [
      'Make ownership, locking, and async boundaries visible.',
      'Name idempotency and transition rules where retries happen.',
      'Keep mutation in one place when possible, and expose the effect in the return value or state transition.',
      'Use focused tests for ordering-sensitive behavior, but do not pretend they prove all scheduler interleavings.',
    ],
    relatedPatterns: [
      'make-side-effects-visible',
      'keep-async-boundaries-explicit',
      'make-state-transitions-explicit',
    ],
    relatedConcepts: ['temporal-coupling', 'side-effect-visibility', 'state-space'],
  },
  {
    id: 'naming-drift',
    title: 'Naming drift',
    summary:
      'Names keep their old words after behavior, ownership, or domain meaning changes.',
    impact:
      'Stale names mislead readers and agents. The code compiles, but every review requires reconciling what the name claims with what the implementation actually does.',
    signals: [
      'A helper name describes an old implementation instead of its current domain role.',
      'Two names refer to the same concept with slightly different wording.',
      'A variable called active, valid, enabled, or ready carries a narrower rule than its name suggests.',
      'Tests repeat stale vocabulary and hide the new behavior.',
    ],
    diagnosticQuestions: [
      'What domain fact should this name communicate now?',
      'Does the name describe mechanics or meaning?',
      'Are there nearby names for the same concept?',
      'Would renaming be a structure-only change or part of a behavior change?',
    ],
    approach: [
      'Rename to the current domain fact before changing behavior when the rename is behavior-preserving.',
      'Use explaining variables for local decisions instead of generic condition names.',
      'Keep terminology consistent across tests, examples, and user-facing errors when they describe the same contract.',
      'Avoid broad vocabulary rewrites while a behavior change is in progress.',
    ],
    relatedPatterns: [
      'explaining-variable',
      'separate-structure-from-behavior',
      'reader-locality',
    ],
    relatedConcepts: ['reader-locality', 'structure-vs-behavior', 'cognitive-burden'],
  },
  {
    id: 'cache-invalidation-unclear',
    title: 'Cache invalidation unclear',
    summary:
      'The code updates cached data without naming freshness rules, invalidation triggers, or stale-read behavior.',
    impact:
      'Readers cannot tell whether stale data is acceptable, whether writes update the cache, or which path owns invalidation. Bugs often appear as rare ordering problems rather than obvious logic errors.',
    signals: [
      'A write path updates storage but not the cache, with no stated freshness contract.',
      'Several callers clear the same cache for different reasons.',
      'Tests assert current values without covering stale-read policy.',
      'A cache key is built from loose strings or partial request data.',
    ],
    diagnosticQuestions: [
      'What freshness guarantee does this caller need?',
      'Which operation owns invalidation?',
      'Can the cache key be represented as a parsed value?',
      'Is stale data a valid state or a failure?',
    ],
    approach: [
      'Name the freshness policy and keep invalidation beside the write or transition that requires it.',
      'Represent cache keys as precise values when loose strings cause drift.',
      'Test the observable stale-read behavior at the boundary callers use.',
      'Keep background refreshes and async invalidation explicit.',
    ],
    relatedPatterns: [
      'make-state-transitions-explicit',
      'parse-dont-validate',
      'keep-async-boundaries-explicit',
    ],
    relatedConcepts: ['temporal-coupling', 'state-space', 'observable-behavior'],
  },
  {
    id: 'data-migration-risk',
    title: 'Data migration risk',
    summary:
      'A schema or data-shape change alters stored meaning without clear compatibility, fallback, or verification.',
    impact:
      'Data changes are hard to roll back and easy to under-test. The code may work for new records while old records, partial migrations, or mixed-version deployments fail.',
    signals: [
      'New code assumes every stored record already has the new shape.',
      'Migration, parser, and behavior changes land in one patch.',
      'Fallback behavior is implicit or differs by caller.',
      'Tests only use newly constructed records.',
    ],
    diagnosticQuestions: [
      'What old shapes can still exist when this code runs?',
      'Is the migration compatible with mixed versions or rollback?',
      'Which parser or boundary should normalize old and new data?',
      'What behavior proves old records still work?',
    ],
    approach: [
      'Parse stored data at a boundary that can normalize old and new shapes.',
      'Separate migration mechanics from behavior changes when review would otherwise mix risks.',
      'Characterize behavior with representative old records before changing the shape.',
      'Return structured errors when incompatible data must be rejected.',
    ],
    relatedPatterns: [
      'parse-dont-validate',
      'characterize-before-changing',
      'separate-structure-from-behavior',
    ],
    relatedConcepts: ['boundary-trust', 'observable-behavior', 'change-radius'],
  },
  {
    id: 'observability-noise',
    title: 'Observability noise',
    summary:
      'Logs, metrics, and events are emitted without a stable contract for what changed or who should act.',
    impact:
      'Noisy signals make real failures harder to find. They also become accidental behavior when downstream dashboards, alerts, or support workflows depend on unstable names and fields.',
    signals: [
      'Several code paths log similar failures with different field names.',
      'Metrics count implementation branches rather than user-visible outcomes.',
      'Events lack stable identifiers or failure context.',
      'Tests ignore diagnostics even though callers or operators depend on them.',
    ],
    diagnosticQuestions: [
      'Who consumes this signal?',
      'Is the signal part of observable behavior or only local debugging?',
      'Which fields are stable enough to rely on?',
      'Does this signal identify the outcome, the cause, or both?',
    ],
    approach: [
      'Name diagnostic events around observable outcomes and stable context.',
      'Keep debug logs separate from signals that operators or callers depend on.',
      'Treat relied-on logs, metrics, and events as observable contracts in tests.',
      'Use structured errors and events instead of parsing message text downstream.',
    ],
    relatedPatterns: [
      'return-structured-errors',
      'observable-behavior-tests',
      'make-side-effects-visible',
    ],
    relatedConcepts: ['observable-behavior', 'side-effect-visibility'],
  },
  {
    id: 'cross-cutting-policy-scattered',
    title: 'Cross-cutting policy scattered',
    summary:
      'Authorization, retries, rate limits, logging, validation, or formatting rules are copied across unrelated paths.',
    impact:
      'Each copy can drift. Reviewers must inspect every path to know whether the policy still applies consistently, and a small policy change turns into a wide edit.',
    signals: [
      'Several handlers repeat the same permission check or retry condition.',
      'A policy change requires edits in many feature files.',
      'Tests cover the policy in one path but not the copies.',
      'A helper exists but has a weak name or lives far from the boundary that owns the policy.',
    ],
    diagnosticQuestions: [
      'Which boundary should own this policy?',
      'Is the repeated code a real shared concept or just similar mechanics?',
      'What context must remain visible at each call site?',
      'Would centralizing the policy reduce future change radius without hiding behavior?',
    ],
    approach: [
      'Move real policies to the boundary that owns the decision.',
      'Keep call sites explicit about the domain action being protected.',
      'Avoid generic policy frameworks when one or two local helpers would explain the rule.',
      'Test the policy through observable behavior on representative paths.',
    ],
    relatedPatterns: [
      'cap-change-radius',
      'reader-locality',
      'avoid-premature-agent-architecture',
    ],
    relatedConcepts: ['change-radius', 'reader-locality', 'observable-behavior'],
  },
  {
    id: 'tooling-contract-implicit',
    title: 'Tooling contract implicit',
    summary:
      'Build, format, lint, generation, or release steps depend on unwritten local knowledge.',
    impact:
      'Humans and agents run the wrong checks, edit generated files by hand, or miss required regeneration. The repo becomes harder to change because the done signal is tribal knowledge.',
    signals: [
      'A change requires generated files, but the command is not documented near the workflow.',
      'Agents run broad or irrelevant checks because the narrow verification path is unclear.',
      'Formatting or lint rules differ between local edits and CI.',
      'Release or build steps depend on environment assumptions not encoded in config.',
    ],
    diagnosticQuestions: [
      'What command proves this kind of change is complete?',
      'Where should that command be documented for humans and agents?',
      'Are generated artifacts owned by source or by a build step?',
      'Can repo-local instructions state the precedence and verification path?',
    ],
    approach: [
      'Capture repo-local workflow in AGENTS, CONTRIBUTING, scripts, or config where agents and maintainers will look.',
      'Prefer narrow commands that match the changed surface over broad unfocused checks.',
      'Make generated-file ownership explicit.',
      'Keep tooling guidance local to the repo instead of relying on general preferences.',
    ],
    relatedPatterns: [
      'repo-local-instructions-win',
      'smallest-trustworthy-verification',
      'separate-structure-from-behavior',
    ],
    relatedConcepts: ['agent-guidance', 'structure-vs-behavior'],
  },
  {
    id: 'domain-rule-buried-in-ui',
    title: 'Domain rule buried in UI',
    summary:
      'A business rule lives inside component rendering or presentation code where other callers cannot reuse or verify it.',
    impact:
      'The rule becomes easy to miss and hard to test without rendering the UI. Other surfaces may implement a different version because the actual policy has no named boundary.',
    signals: [
      'A component filters, authorizes, validates, or prices data inline.',
      'The same rule appears in an API handler and a UI component.',
      'Tests need a browser or component harness to check a domain decision.',
      'Changing UI layout risks changing business behavior.',
    ],
    diagnosticQuestions: [
      'Is this branch a presentation choice or a domain decision?',
      'Which non-UI caller also needs the rule?',
      'Can the component receive a view model or policy result instead?',
      'What observable behavior should protect the rule?',
    ],
    approach: [
      'Move domain decisions to a policy, parser, or view-model boundary before rendering.',
      'Keep presentation-specific formatting in the UI.',
      'Test the rule at the boundary that owns it, then smoke test the rendered path if needed.',
      'Name cross-layer contracts so the UI receives the shape it needs.',
    ],
    relatedPatterns: [
      'name-cross-layer-contracts',
      'cap-change-radius',
      'observable-behavior-tests',
    ],
    relatedConcepts: ['boundary-trust', 'change-radius', 'observable-behavior'],
  },
  {
    id: 'performance-fix-without-evidence',
    title: 'Performance fix without evidence',
    summary:
      'A change adds caching, concurrency, allocation tricks, or broad rewrites without a measured bottleneck.',
    impact:
      'Performance work can add state, invalidation, timing, and concurrency risks. Without evidence, the code may get harder to change while the real bottleneck remains elsewhere.',
    signals: [
      'A patch adds caching or parallelism without a benchmark, profile, or production signal.',
      'The optimization changes data shape or ownership before proving a bottleneck.',
      'A micro-optimization obscures the main path.',
      'Tests prove correctness but not the performance claim that justified the complexity.',
    ],
    diagnosticQuestions: [
      'What measurement shows this path is the bottleneck?',
      'What behavior or contract could the optimization change?',
      'Can the performance-sensitive boundary be isolated?',
      'What verification proves both correctness and the intended performance property?',
    ],
    approach: [
      'Measure before adding complexity, and keep the measurement close to the claim.',
      'Prefer local improvements that preserve reader locality before adding cache or concurrency state.',
      'Treat cache, async, and allocation changes as behavior-risking when they alter ordering or ownership.',
      'Keep the fallback or original behavior easy to compare during review.',
    ],
    relatedPatterns: [
      'smallest-trustworthy-verification',
      'make-side-effects-visible',
      'cap-change-radius',
    ],
    relatedConcepts: ['side-effect-visibility', 'change-radius', 'cognitive-burden'],
  },
  {
    id: 'review-comment-lacks-pattern-name',
    title: 'Review comment lacks a pattern name',
    summary:
      'A reviewer can see a problem but cannot name the move clearly enough for the author or an agent to apply it.',
    impact:
      'Unnamed feedback becomes taste. Authors may make broad rewrites, agents may overbuild, and future reviews repeat the same explanation without a stable link or shared vocabulary.',
    signals: [
      'Comments say “this feels hard to read” without naming the change pressure.',
      'The same review advice is rewritten differently in each pull request.',
      'An agent receives vague feedback and changes more code than requested.',
      'The author fixes one symptom but misses the underlying pattern.',
    ],
    diagnosticQuestions: [
      'What source-change problem is visible in the diff?',
      'Which small pattern would work the problem down?',
      'What tradeoff should the author watch for?',
      'Would a review snippet with a stable link reduce ambiguity?',
    ],
    approach: [
      'Name the problem first, then link to the pattern that fits the local code.',
      'Use the pattern’s review snippet when the comment should be concise and repeatable.',
      'Avoid turning the comment into a broad rewrite request unless the scope is genuinely larger.',
      'Point agents to the operational instruction, not only the human explanation.',
    ],
    relatedPatterns: [
      'reader-locality',
      'guard-clause',
      'avoid-premature-agent-architecture',
    ],
    relatedConcepts: ['agent-guidance', 'cognitive-burden'],
  },
];

export const references = [
  {
    title: 'Laws of UX',
    href: 'https://lawsofux.com/',
    note: 'Human-centered UX principles presented as concise laws with examples and references.',
  },
  {
    title: 'Ed Page’s Rust Style',
    href: 'https://epage.github.io/dev/rust-style/',
    note:
      'Rust style notes from Ed Page (epage), including item ordering and caller-before-callee organization.',
  },
  {
    title: 'Laws of Software Engineering',
    href: 'https://lawsofsoftwareengineering.com/',
    note: 'A compact law-style framing of software engineering heuristics and tradeoffs.',
  },
  {
    title: 'Refactoring.com',
    href: 'https://refactoring.com/',
    note: 'Martin Fowler’s refactoring home base, including articles and catalog links.',
  },
  {
    title: 'Refactoring.com Catalog',
    href: 'https://refactoring.com/catalog/',
    note: 'Compact refactoring entries with durable names and stable links.',
  },
  {
    title: 'Refactoring Guru Catalog',
    href: 'https://refactoring.guru/refactoring/catalog',
    note: 'Illustrated refactoring catalog with mechanics, motivation, and before-after examples.',
  },
  {
    title: 'SourceMaking Code Smells',
    href: 'https://sourcemaking.com/refactoring/smells',
    note: 'Code smell catalog organized around symptoms that often point to refactoring moves.',
  },
  {
    title: 'Patterns.dev',
    href: 'https://www.patterns.dev/',
    note: 'Web development pattern catalog with examples and visual explanations.',
  },
  {
    title: 'Interface Refactoring Catalog',
    href: 'https://interface-refactoring.github.io/',
    note: 'Catalog focused on interface-level refactorings and API design improvements.',
  },
  {
    title: 'Hillside Patterns',
    href: 'https://hillside.net/patterns',
    note: 'Pattern language archive and community hub for pattern-writing traditions.',
  },
  {
    title: 'Portland Pattern Repository',
    href: 'https://c2.com/ppr/wiki/',
    note: 'Early wiki archive for pattern language, design patterns, and adjacent software design writing.',
  },
  {
    title: 'Understand Legacy Code Articles',
    href: 'https://understandlegacycode.com/all-articles/',
    note: 'Legacy-code articles focused on characterization, refactoring, and concrete change tactics.',
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
