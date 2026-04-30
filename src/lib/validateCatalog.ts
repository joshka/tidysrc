import type { Concept, Pattern, Problem } from '../data/catalog';

type CatalogData = {
  concepts: Concept[];
  patterns: Pattern[];
  problems: Problem[];
};

function duplicateValues(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }

  return [...duplicates];
}

function reportMissing(
  errors: string[],
  owner: string,
  field: string,
  values: string[],
  allowed: Set<string>,
) {
  for (const value of values) {
    if (!allowed.has(value)) {
      errors.push(`${owner}.${field} references missing id "${value}"`);
    }
  }
}

function reportDuplicates(errors: string[], owner: string, field: string, values: string[]) {
  for (const value of duplicateValues(values)) {
    errors.push(`${owner}.${field} contains duplicate value "${value}"`);
  }
}

export function validateCatalog({ concepts, patterns, problems }: CatalogData) {
  const errors: string[] = [];
  const patternIds = patterns.map((pattern) => pattern.id);
  const conceptIds = concepts.map((concept) => concept.id);
  const problemIds = problems.map((problem) => problem.id);
  const patternIdSet = new Set(patternIds);
  const conceptIdSet = new Set(conceptIds);

  reportDuplicates(errors, 'patterns', 'id', patternIds);
  reportDuplicates(errors, 'concepts', 'id', conceptIds);
  reportDuplicates(errors, 'problems', 'id', problemIds);

  for (const pattern of patterns) {
    const owner = `pattern:${pattern.id}`;
    reportDuplicates(errors, owner, 'tags', pattern.tags);
    reportDuplicates(errors, owner, 'languages', pattern.languages);
    reportDuplicates(errors, owner, 'audiences', pattern.audiences);
    reportMissing(errors, owner, 'related', pattern.related, patternIdSet);
    reportMissing(errors, owner, 'concepts', pattern.concepts, conceptIdSet);

    for (const example of pattern.examples) {
      if (!pattern.languages.includes(example.language)) {
        errors.push(
          `${owner}.examples includes ${example.path} with language "${example.language}" not listed in languages`,
        );
      }
    }
  }

  for (const concept of concepts) {
    const owner = `concept:${concept.id}`;
    reportDuplicates(errors, owner, 'tags', concept.tags);
    reportMissing(errors, owner, 'relatedPatterns', concept.relatedPatterns, patternIdSet);
  }

  for (const problem of problems) {
    const owner = `problem:${problem.id}`;
    reportMissing(errors, owner, 'relatedPatterns', problem.relatedPatterns, patternIdSet);
    reportMissing(errors, owner, 'relatedConcepts', problem.relatedConcepts, conceptIdSet);
  }

  if (errors.length > 0) {
    throw new Error(`Catalog validation failed:\n${errors.map((error) => `- ${error}`).join('\n')}`);
  }
}
