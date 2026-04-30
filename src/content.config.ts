import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

import { concepts, patterns, problems } from './data/catalog';
import { validateCatalog } from './lib/validateCatalog';

validateCatalog({ concepts, patterns, problems });

const exampleSchema = z.object({
  title: z.string(),
  path: z.string(),
  language: z.string(),
  code: z.string(),
  note: z.string().optional(),
});

const patternSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  narrative: z.string(),
  status: z.enum(['seed', 'draft', 'reviewed', 'stable']),
  tags: z.array(z.string()),
  audiences: z.array(z.enum(['reviewers', 'agents', 'learners'])),
  languages: z.array(z.string()),
  problems: z.array(z.string()),
  concepts: z.array(z.string()),
  related: z.array(z.string()),
  useWhen: z.array(z.string()),
  guidance: z.array(z.string()),
  tradeoffs: z.array(z.string()),
  agentInstruction: z.string(),
  examples: z.array(exampleSchema),
  references: z.array(z.string()),
});

const conceptSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  status: z.enum(['seed', 'draft', 'reviewed', 'stable']),
  tags: z.array(z.string()),
  relatedPatterns: z.array(z.string()),
  examples: z.array(exampleSchema).optional(),
  sections: z.array(
    z.object({
      title: z.string(),
      body: z.array(z.string()),
    }),
  ),
});

const problemSchema = z.object({
  title: z.string(),
  summary: z.string(),
  status: z.enum(['seed', 'draft', 'reviewed', 'stable']),
  category: z.enum([
    'agent-workflow',
    'architecture',
    'async',
    'boundaries',
    'change-risk',
    'readability',
    'side-effects',
    'state',
    'testing',
    'tooling',
  ]),
  topics: z.array(z.string()),
  relatedPatterns: z.array(z.string()),
  relatedConcepts: z.array(z.string()),
});

const patternCollection = defineCollection({
  loader: () => patterns,
  schema: patternSchema,
});

const conceptCollection = defineCollection({
  loader: () => concepts,
  schema: conceptSchema,
});

const problemCollection = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/problems' }),
  schema: problemSchema,
});

export const collections = {
  patterns: patternCollection,
  concepts: conceptCollection,
  problems: problemCollection,
};
