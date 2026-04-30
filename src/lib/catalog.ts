import type { CollectionEntry } from 'astro:content';

import { parsePatternContent } from './patternContent';
import { parseProblemContent } from './problemContent';

export type PatternEntry = CollectionEntry<'patterns'>;
export type ConceptEntry = CollectionEntry<'concepts'>;
export type ProblemEntry = CollectionEntry<'problems'>;

export function patternHref(pattern: PatternEntry | string): string {
  const slug = typeof pattern === 'string' ? pattern : pattern.id;
  return `/patterns/${slug}/`;
}

export function conceptHref(concept: ConceptEntry | string): string {
  const slug = typeof concept === 'string' ? concept : concept.id;
  return `/concepts/${slug}/`;
}

export function problemHref(problem: ProblemEntry | string): string {
  const slug = typeof problem === 'string' ? problem : problem.id;
  return `/problems/${slug}/`;
}

export function sortedPatterns(patterns: PatternEntry[]): PatternEntry[] {
  return [...patterns].sort((left, right) => {
    const statusWeight = statusRank(right.data.status) - statusRank(left.data.status);
    if (statusWeight !== 0) {
      return statusWeight;
    }

    return left.data.title.localeCompare(right.data.title);
  });
}

export function sortedProblems(problems: ProblemEntry[]): ProblemEntry[] {
  return [...problems].sort((left, right) => {
    const statusWeight = statusRank(right.data.status) - statusRank(left.data.status);
    if (statusWeight !== 0) {
      return statusWeight;
    }

    return left.data.title.localeCompare(right.data.title);
  });
}

export function statusRank(status: PatternEntry['data']['status']): number {
  switch (status) {
    case 'stable':
      return 4;
    case 'reviewed':
      return 3;
    case 'draft':
      return 2;
    case 'seed':
      return 1;
  }
}

const languageOrder = new Map([
  ['c', 0],
  ['cs', 1],
  ['csharp', 1],
  ['cpp', 2],
  ['c++', 2],
  ['go', 3],
  ['java', 4],
  ['js', 5],
  ['javascript', 5],
  ['python', 6],
  ['py', 6],
  ['rust', 7],
  ['rs', 7],
  ['ts', 8],
  ['typescript', 8],
  ['tsx', 8],
  ['md', 9],
  ['markdown', 9],
]);

const languageNames = new Map([
  ['c', 'C'],
  ['cs', 'C#'],
  ['csharp', 'C#'],
  ['cpp', 'C++'],
  ['c++', 'C++'],
  ['go', 'Go'],
  ['java', 'Java'],
  ['js', 'JavaScript'],
  ['javascript', 'JavaScript'],
  ['python', 'Python'],
  ['py', 'Python'],
  ['rs', 'Rust'],
  ['rust', 'Rust'],
  ['ts', 'Typescript'],
  ['typescript', 'Typescript'],
  ['tsx', 'Typescript'],
  ['md', 'Markdown'],
  ['markdown', 'Markdown'],
]);

function languageRank(language: string): number {
  return languageOrder.get(language.toLowerCase()) ?? Number.MAX_SAFE_INTEGER;
}

export function isKnownLanguage(language: string): boolean {
  return languageOrder.has(language.toLowerCase());
}

export function languageLabel(language: string): string {
  return languageNames.get(language.toLowerCase()) ?? language;
}

export function sortedLanguageCodes(languages: string[]): string[] {
  return [...languages].sort((left, right) => {
    const rank = languageRank(left) - languageRank(right);
    if (rank !== 0) {
      return rank;
    }

    return languageLabel(left).localeCompare(languageLabel(right));
  });
}

export function allTags(patterns: PatternEntry[]): string[] {
  return [...new Set(patterns.flatMap((pattern) => pattern.data.tags))].sort();
}

export function allLanguages(patterns: PatternEntry[]): string[] {
  return sortedLanguageCodes([...new Set(patterns.flatMap((pattern) => pattern.data.languages))]);
}

export function allProblemCategories(problems: ProblemEntry[]): string[] {
  return [...new Set(problems.map((problem) => problem.data.category))].sort();
}

export function patternSearchText(pattern: PatternEntry): string {
  const parsed = parsePatternContent(pattern.body ?? '', pattern.id);

  return [
    pattern.data.title,
    pattern.data.summary,
    pattern.data.status,
    pattern.data.tags.join(' '),
    pattern.data.audiences.join(' '),
    pattern.data.languages.join(' '),
    pattern.data.problems.join(' '),
    pattern.data.concepts.join(' '),
    parsed.narrative.join(' '),
    parsed.useWhen.join(' '),
    parsed.guidance.join(' '),
    parsed.tradeoffs.join(' '),
    parsed.examples.map((example) => `${example.title} ${example.note ?? ''}`).join(' '),
  ]
    .join(' ')
    .toLowerCase();
}

export function problemSearchText(problem: ProblemEntry): string {
  const parsed = parseProblemContent(problem.body ?? '', problem.id);

  return [
    problem.data.title,
    problem.data.summary,
    problem.data.status,
    problem.data.category,
    problem.data.topics.join(' '),
    parsed.impact,
    parsed.signals.join(' '),
    parsed.diagnosticQuestions.join(' '),
    parsed.approach.join(' '),
    problem.data.relatedPatterns.join(' '),
    problem.data.relatedConcepts.join(' '),
  ]
    .join(' ')
    .toLowerCase();
}
