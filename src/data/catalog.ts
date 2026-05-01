export type Audience = 'reviewers' | 'agents' | 'learners';
export type Status = 'seed' | 'draft' | 'reviewed';

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

export const concepts: Concept[] = [];

export const references: { href: string; note: string; title: string }[] = [];

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
