import type { CollectionEntry } from 'astro:content';

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
  return [...problems].sort((left, right) => left.data.title.localeCompare(right.data.title));
}

export function statusRank(status: PatternEntry['data']['status']): number {
  switch (status) {
    case 'stable':
      return 3;
    case 'draft':
      return 2;
    case 'seed':
      return 1;
  }
}

export function allTags(patterns: PatternEntry[]): string[] {
  return [...new Set(patterns.flatMap((pattern) => pattern.data.tags))].sort();
}

export function allLanguages(patterns: PatternEntry[]): string[] {
  return [...new Set(patterns.flatMap((pattern) => pattern.data.languages))].sort();
}

export function patternSearchText(pattern: PatternEntry): string {
  return [
    pattern.data.title,
    pattern.data.summary,
    pattern.data.status,
    pattern.data.tags.join(' '),
    pattern.data.audiences.join(' '),
    pattern.data.languages.join(' '),
    pattern.data.problems.join(' '),
    pattern.data.concepts.join(' '),
  ]
    .join(' ')
    .toLowerCase();
}

export function problemSearchText(problem: ProblemEntry): string {
  return [
    problem.data.title,
    problem.data.summary,
    problem.data.impact,
    problem.data.signals.join(' '),
    problem.data.diagnosticQuestions.join(' '),
    problem.data.approach.join(' '),
    problem.data.relatedPatterns.join(' '),
    problem.data.relatedConcepts.join(' '),
  ]
    .join(' ')
    .toLowerCase();
}
