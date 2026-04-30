export type Audience = 'reviewers' | 'agents' | 'learners';
export type Status = 'seed' | 'draft' | 'reviewed' | 'stable';

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
  status: Status;
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
  status: Status;
  category?: string;
  topics?: string[];
  impact: string;
  signals: string[];
  diagnosticQuestions: string[];
  approach: string[];
  examples?: CodeExample[];
  relatedPatterns: string[];
  relatedConcepts: string[];
};

export const patterns: Pattern[] = [];

export const concepts: Concept[] = [
  {
    id: 'reader-locality',
    title: 'Reader Locality',
    summary:
      'Put related ideas where the reader needs them, especially when the abstraction is weak.',
    status: 'draft',
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
    status: 'draft',
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
    status: 'draft',
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
    status: 'draft',
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
    status: 'draft',
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
    status: 'draft',
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
    status: 'draft',
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
    status: 'draft',
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
    status: 'draft',
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
    status: 'draft',
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

export const problems: Problem[] = [];
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
