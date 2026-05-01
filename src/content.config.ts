import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const patternSchema = z.object({
  title: z.string(),
  summary: z.string(),
  status: z.enum(['seed', 'draft', 'reviewed']),
  exampleStyle: z.enum(['code', 'narrative']).optional(),
  tags: z.array(z.string()),
  audiences: z.array(z.enum(['reviewers', 'agents', 'learners'])),
  languages: z.array(z.string()),
  problems: z.array(z.string()),
  concepts: z.array(z.string()),
  related: z.array(z.string()),
});

const conceptSchema = z.object({
  title: z.string(),
  summary: z.string(),
  status: z.enum(['seed', 'draft', 'reviewed']),
  tags: z.array(z.string()),
  relatedPatterns: z.array(z.string()),
});

const problemSchema = z.object({
  title: z.string(),
  summary: z.string(),
  status: z.enum(['seed', 'draft', 'reviewed']),
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
  loader: glob({ pattern: '*.md', base: './src/content/patterns' }),
  schema: patternSchema,
});

const conceptCollection = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/concepts' }),
  schema: conceptSchema,
});

const problemCollection = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/problems' }),
  schema: problemSchema,
});

const referenceCollection = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/references' }),
  schema: z.object({
    title: z.string(),
    href: z.string().startsWith('https://'),
  }),
});

export const collections = {
  patterns: patternCollection,
  concepts: conceptCollection,
  problems: problemCollection,
  references: referenceCollection,
};
