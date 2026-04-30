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
      'Keep the next useful concept close to the code that needs it, especially when the abstraction is weak.',
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
      'A helper, type, or module only makes sense beside one caller, and moving it away would make the caller harder to read rather than more focused.',
      'A review requires jumping across files to understand one local behavior, especially when the destination file does not expose a durable domain concept.',
      'A proposed extraction reduces line count but increases the reader’s live mental stack by adding names, files, or ordering rules they must remember.',
    ],
    guidance: [
      'Put the central item first, then place weak helpers near the caller that gives them meaning so the reader can follow the workflow top to bottom.',
      'Extract only concepts that have semantic coherence and can be understood locally from their name, inputs, outputs, and surrounding module.',
      'Prefer a little repetition over a distant abstraction when the repetition is easier to verify than a new indirection path.',
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
          'The search text formatter is specific to this page, so keeping it local avoids sending readers to a generic utility for a one-use behavior.',
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
      'Internal TidySrc note: optimize for reducing the reader’s live mental stack.',
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
      'The early return does not skip meaningful cleanup or later behavior; ownership, locks, transactions, and deferred work are still explicit.',
    ],
    guidance: [
      'Put boring preconditions at the top of the function in the order a reader must rule them out before trusting the main path.',
      'Keep the main behavior visually prominent after the guards so the function reads as “reject invalid cases, then do the work.”',
      'Use domain-specific return values or errors rather than vague booleans, because the guard is also documentation for why execution stops.',
    ],
    tradeoffs: [
      'Too many guards can hide a missing input type or parser; repeated validation may belong at a construction boundary instead.',
      'In languages with manual cleanup, make cleanup ownership explicit before returning so the tidy does not introduce lifetime or resource bugs.',
      'A meaningful alternative path may deserve a named branch rather than a guard if both paths carry domain behavior a reader must compare.',
    ],
    agentInstruction:
      'Use a guard clause when an empty case, validation failure, unsupported mode, or no-op would otherwise indent the main path. Keep the normal behavior visually prominent.',
    examples: [
      {
        title: 'Guard invalid input before parsing',
        path: 'src/parser.rs',
        language: 'rust',
        note:
          'The parser rejects blank input before constructing a name, leaving the valid parsing path flat and easy to inspect.',
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
      'Group nearby statements into visible logic paragraphs so each phase of the workflow is easy to scan.',
    narrative:
      'Chunking statements uses whitespace to show the shape of a small algorithm. It is not decoration; each blank line should mark a change in intent such as setup, filtering, mutation, verification, or return assembly. Good chunks let a reviewer skim the function as a sequence of phases before reading each line closely.',
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
      'Name intermediate values when the next paragraph depends on them, because the name becomes the bridge between phases.',
    ],
    tradeoffs: [
      'Blank lines should reveal structure, not decorate every statement; too much whitespace makes the function feel fragmented.',
      'If every paragraph needs a heading comment, a function or concept may be missing and the code may need a stronger extraction.',
      'Do not split a dense expression if a single idiom is clearer to the local audience and the expression already reads as one thought.',
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
    references: ['Internal TidySrc note: use blank lines as logic paragraphs.'],
  },
  {
    id: 'explaining-variable',
    title: 'Use an Explaining Variable',
    summary:
      'Name an intermediate value when it lowers the reader’s burden more than another inline expression would.',
    narrative:
      'An explaining variable turns an operation into a domain fact. It is most useful when the reader needs to understand why a value matters before they care how it is computed. The goal is not to add names everywhere, but to spend one local name when that name makes the next branch, call, or return read naturally.',
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
      'Name the domain fact, not the implementation detail, so the next line reads in terms of the behavior being decided.',
      'Prefer a local variable over a helper when the value is only meaningful here and extraction would create a weak distant abstraction.',
      'Keep the named value close to its use so the reader does not have to remember the definition across unrelated work.',
    ],
    tradeoffs: [
      'Do not introduce a name that merely repeats the expression; the variable should add intent, grouping, or a meaningful review handle.',
      'If the same concept appears in many places, promote it to a real API instead of copying local names with subtly different meanings.',
      'Avoid stale names when the expression changes, because an inaccurate explaining variable is worse than an inline expression.',
    ],
    agentInstruction:
      'Introduce an explaining variable when a local name makes the next line easier to read. Do not extract a helper unless the concept has meaning beyond this local use.',
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
      'Structure and behavior fail in different ways. A rename, move, extraction, or formatting pass should usually be reviewable as behavior-preserving, while a behavior change should make the new rule obvious. Keeping those units separate gives reviewers a cleaner diff, gives tests a clearer job, and makes rollback less dangerous.',
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
      'Rollback would be risky if cleanup and logic are fused, especially when a bug fix might need to be reverted without losing useful structure.',
    ],
    guidance: [
      'Make pure structure changes first when they lower risk for the behavior change and can be checked without understanding the new behavior.',
      'Keep the behavior-preserving change mechanically reviewable by avoiding opportunistic edits outside the path needed for the next step.',
      'Run the smallest trustworthy check after each unit so accidental behavior movement is caught before the behavioral diff starts.',
    ],
    tradeoffs: [
      'Tiny local cleanups can stay with behavior if separation would add process noise and the cleanup is plainly inseparable from the changed lines.',
      'Do not tidy unrelated areas just because a behavior change is nearby; that expands review scope without lowering risk.',
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
      'After behavior is pinned, make the smallest change that improves the situation and rerun the characterization test to separate discovery from change.',
    ],
    tradeoffs: [
      'Characterization tests can preserve bugs; mark suspicious behavior clearly so the test records today’s contract without declaring it desirable.',
      'Do not overfit tests to private helper calls or exact formatting unless that detail is truly part of the external contract.',
      'For tiny obvious changes, a cheaper check may be enough, but risky legacy areas deserve a behavior pin before structure starts moving.',
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
          'The test captures the parser’s current empty-field output so a later parser refactor cannot silently change that boundary.',
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
      'A test exists mainly to protect behavior through future refactors, so it should describe the stable boundary rather than the current implementation path.',
      'Private helper assertions make safe structure changes expensive by failing when a call graph changes even though callers see the same result.',
      'The API or user-visible output is the real contract, including errors, events, files, network calls, persistence, and generated UI.',
    ],
    guidance: [
      'Assert outputs, persisted state, events, errors, and side effects the caller can observe at the cheapest boundary that still catches likely regressions.',
      'Use fixtures, snapshots, or golden files when the observable result is structured, but keep them focused enough that intentional changes remain reviewable.',
      'Keep private helper tests only when the helper is a real concept with its own contract rather than a temporary decomposition detail.',
    ],
    tradeoffs: [
      'Some low-level algorithms need direct tests for edge cases because the algorithm itself is the contract being maintained.',
      'Observable tests can be broader and slower; choose the cheapest trustworthy boundary instead of defaulting to end-to-end coverage.',
      'Do not ignore important error context just because it is not user-facing UI; logs, diagnostics, and API errors can be observable contracts too.',
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
          'The test checks the returned pattern slugs rather than asserting how the search implementation walks its data.',
        code: `func TestSearchFindsProblemTerms(t *testing.T) {
    results := Search(patterns, "mutation inside expressions")

    require.Contains(t, slugs(results), "avoid-premature-agent-architecture")
}`,
      },
    ],
    references: ['Internal TidySrc note: tests should protect observable behavior.'],
  },
  {
    id: 'make-invalid-states-hard-to-express',
    title: 'Make Invalid States Hard to Express',
    summary:
      'Move checks into types, constructors, or parsing boundaries so the rest of the code handles valid states.',
    narrative:
      'This pattern moves repeated “remember to check” work into a representation that carries the invariant. A precise type, constructor, or parser can make invalid values difficult or impossible to pass downstream. The payoff is highest when many callers currently repeat the same defensive checks or when one missed check would create a meaningful bug.',
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
      'The type system can carry a useful invariant without excessive ceremony, making valid code easier to write than invalid code.',
    ],
    guidance: [
      'Create a more precise type at the boundary where uncertainty enters so downstream code receives a value it can trust.',
      'Expose constructors that validate once and return a useful error, preserving enough context for the caller to report or recover.',
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
          'The parser converts an uncertain string into a branded Email so later APIs can ask for the precise value.',
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
    narrative:
      'Parsing is validation plus a change in representation. Instead of checking raw input and then continuing to pass raw strings, maps, or untyped values around, parse the input into a shape that encodes what is now known. This reduces repeated checks and makes later code read as if it operates on trusted domain values.',
    status: 'draft',
    tags: ['correctness', 'api-design', 'rust'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['rust', 'ts', 'go'],
    problems: ['Code validates raw input repeatedly but still passes the raw input around.'],
    concepts: ['observable-behavior'],
    related: ['make-invalid-states-hard-to-express', 'guard-clause', 'explaining-variable'],
    useWhen: [
      'A value crosses a trust boundary such as user input, config, environment variables, files, or wire data.',
      'Later code needs a stronger promise than raw strings or maps can provide, and that promise should be visible in the type or data shape.',
      'Validation and use are separated far enough that the reader must remember the check or wonder whether it already happened.',
    ],
    guidance: [
      'Parse at the boundary and return either a precise value or an actionable error, keeping uncertain input from leaking inward.',
      'Pass the parsed value through downstream APIs so later code does not need to repeat defensive validation.',
      'Preserve enough error context for the caller to act, especially when input came from users, config, or external systems.',
    ],
    tradeoffs: [
      'Do not introduce a parser for a one-off local condition when a guard clause or explaining variable would communicate the rule more directly.',
      'Parsing can reveal behavior changes; characterize risky legacy input first if callers may depend on loose acceptance.',
      'Keep parser errors intentional rather than leaking low-level implementation details that make the boundary harder to evolve.',
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
      'Verification should match the risk of the change. A focused unit test, typecheck, build, route smoke test, or visual check can be more useful than either running nothing or running an expensive suite that does not cover the changed surface. The key is to choose a check that could actually fail for the mistake you are likely to have made.',
    status: 'stable',
    tags: ['workflow', 'testing', 'agents', 'review'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['rust', 'js'],
    problems: ['A change is marked done after either no check or an expensive unfocused check.'],
    concepts: ['observable-behavior', 'agent-guidance'],
    related: ['observable-behavior-tests', 'separate-structure-from-behavior'],
    useWhen: [
      'The likely failure mode is narrower than the full test suite, such as a parser edge case, route render, type error, or formatting regression.',
      'A fast local check can prove the changed surface still works and gives quicker feedback than waiting for broad CI.',
      'An agent or reviewer needs a credible completion signal that distinguishes checked work from plausible but unverified edits.',
    ],
    guidance: [
      'Choose the check based on what changed: format for formatting, typecheck for signatures, unit tests for logic, build for routes, and smoke tests for rendered UI.',
      'Run broader checks when shared contracts, generated artifacts, public behavior, or cross-module assumptions changed.',
      'Report exactly what passed and what was not run so the next person can judge residual risk without decoding your workflow.',
    ],
    tradeoffs: [
      'The cheapest check is not always trustworthy; if it would pass despite the likely bug, it is just a ritual.',
      'Broad refactors may need full suites even when local tests pass because the risk is distributed across many callers.',
      'Manual visual checks matter for UI work after automated checks pass, because layout, contrast, and interaction can fail outside type systems.',
    ],
    agentInstruction:
      'Before calling work complete, run the smallest check that can catch the likely failure. State what ran and do not imply broader verification than you performed.',
    examples: [
      {
        title: 'Rust targeted check before broader CI',
        path: 'justfile',
        language: 'bash',
        note:
          'The commands start with the focused parser test and then add formatting and lint checks that match the likely failure modes.',
        code: `cargo test parser::tests::finds_problem_terms
cargo fmt --check
cargo clippy --workspace --all-targets -- -D warnings`,
      },
      {
        title: 'Site smoke check',
        path: 'package.json',
        language: 'json',
        note:
          'For a content site, build and content checks are the quickest trustworthy signal that routes and data still compile.',
        code: `"scripts": {
  "build": "astro build",
  "check:content": "astro sync && astro check"
}`,
      },
    ],
    references: ['Internal TidySrc note: use the strongest cheap behavior-preservation check.'],
  },
  {
    id: 'repo-local-instructions-win',
    title: 'Repo-Local Instructions Win',
    summary:
      'Apply local project instructions before general preferences, pattern catalogs, or agent defaults.',
    narrative:
      'General guidance is useful only after the local project has had its say. Repository instructions, existing helpers, naming schemes, test workflows, and maintainer preferences carry context that a generic pattern catalog cannot know. This pattern keeps agents and reviewers from replacing deliberate local coherence with abstract best practices.',
    status: 'stable',
    tags: ['agent-guidance', 'workflow', 'review'],
    audiences: ['reviewers', 'agents', 'learners'],
    languages: ['rust', 'ts'],
    problems: ['A general style preference conflicts with explicit repository guidance.'],
    concepts: ['agent-guidance'],
    related: ['avoid-premature-agent-architecture', 'smallest-trustworthy-verification'],
    useWhen: [
      'A repo has AGENTS.md, CONTRIBUTING, local style docs, or established patterns that define how work should be done there.',
      'A general best practice conflicts with local compatibility, release constraints, or maintainer preference.',
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
      'When guidance conflicts, name the conflict rather than silently choosing so the maintainer can correct the rule or approve the exception.',
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
          'The route builder already encodes local URL conventions, so using it is clearer than adding a generic helper.',
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
    narrative:
      'Premature architecture often looks tidy in isolation: providers, registries, strategies, factories, and extension points can make a small change appear organized. The cost shows up later when readers must understand concepts that do not yet pay for themselves. Prefer direct code until repetition is real, semantic, and clearly reduces the number of facts a maintainer must hold.',
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
      'The change adds broad extension points without a concrete near-term user, making future flexibility more speculative than useful.',
    ],
    guidance: [
      'Implement the local behavior directly first so the real shape of the problem is visible before naming a framework around it.',
      'Extract only when duplication is real, semantic, and lowering reader burden rather than merely reducing line count.',
      'Prefer boring names and local helpers over architecture vocabulary until the codebase has enough examples to justify stronger concepts.',
    ],
    tradeoffs: [
      'Some frameworks require early structure; follow the framework when it is the local idiom and readers expect that shape.',
      'Public APIs may need more deliberate shape before release because compatibility costs can make later extraction harder.',
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
          'A direct match makes the supported labels obvious; a trait hierarchy would hide a tiny mapping behind premature extension points.',
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
    references: ['Internal TidySrc note: extract concepts only with semantic coherence.'],
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
      'Start by making the main path visible. Use guard clauses for boring preconditions and keep the valid behavior unindented.',
      'Chunk nearby statements into logic paragraphs so phase changes are visible before a reader studies each line.',
      'Name intermediate decisions when the name carries domain meaning or removes repeated expression parsing.',
      'Stop before extracting broad architecture; the first move is often just a clearer local shape.',
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
      'The name describes mechanics rather than a durable domain concept.',
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
      'Promote code only when the extracted concept has a clear contract and more than mechanical reuse.',
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
      'The existing behavior is unclear, under-tested, or coupled to callers that are easy to break accidentally.',
    impact:
      'The danger is not that the edit is large; it is that nobody can tell which behavior is intentional. Without characterization, a tidy can silently become a product change.',
    signals: [
      'The code has few tests or tests that only cover internal helpers.',
      'A small edit changes parsing, error handling, ordering, or public output at the same time.',
      'Callers rely on behavior that is not written down anywhere.',
      'The safest reviewer question is “what changed?” and the diff does not make that easy to answer.',
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
      'Protect observable behavior rather than private implementation shape.',
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
      'Mixed diffs make reviewers compare too many possible causes at once. Even when the final code is better, the route there hides behavioral changes and makes regressions harder to blame.',
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
      'Use source control to keep the stack honest rather than relying on a reviewer to mentally split the diff.',
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
      'The output may look polished while increasing maintenance cost. Extra files, providers, registries, and abstractions make later human changes slower and can conflict with the repo’s existing design language.',
    signals: [
      'A small feature introduces a new architecture vocabulary.',
      'The implementation is organized around generic patterns rather than local code shape.',
      'The agent ignores nearby examples or repo-specific instructions.',
      'Verification proves the happy path but not the actual risk introduced by the abstraction.',
    ],
    diagnosticQuestions: [
      'What is the smallest local change that satisfies the request?',
      'Which existing repo pattern should the implementation imitate?',
      'Does the abstraction reduce concepts for the next reader or add them?',
      'What instruction would prevent the agent from widening scope again?',
    ],
    approach: [
      'Start with repo-local instructions and nearby code before applying general best practices.',
      'Constrain the agent to the narrow behavior and explicit non-goals.',
      'Reject architecture whose main benefit is hypothetical future reuse.',
      'Ask for verification tied to the risk of the change, not just a broad test run.',
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
      'A passing command is useful only when it exercises the risk. Without a clear done signal, teams either over-test everything or accept shallow verification that misses the bug the change could realistically introduce.',
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
      'Repeated validation looks defensive but usually means the domain boundary is weak. Over time the rules drift, edge cases differ, and callers can pass values that should never exist inside the system.',
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
];

export const references = [
  {
    title: 'Laws of UX',
    href: 'https://lawsofux.com/',
    note: 'Human-centered UX principles presented as concise laws with examples and references.',
  },
  {
    title: 'Hacker News: Tidy First?',
    href: 'https://news.ycombinator.com/item?id=38942400',
    note: 'Discussion around tidying, guard clauses, early returns, and behavior-preserving change.',
  },
  {
    title: 'Hacker News: Software design gets worse before it gets better',
    href: 'https://news.ycombinator.com/item?id=40728714',
    note: 'Discussion about software design tradeoffs, temporary worsening, and evolutionary change.',
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
    note: 'Modern web development pattern catalog with practical examples and visual explanations.',
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
    note: 'Legacy-code articles focused on characterization, refactoring, and practical change tactics.',
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
