import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

import { concepts, patterns, problems } from './data/catalog';

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
  status: z.enum(['seed', 'draft', 'stable']),
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
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  impact: z.string(),
  signals: z.array(z.string()),
  diagnosticQuestions: z.array(z.string()),
  approach: z.array(z.string()),
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
  loader: () => problems,
  schema: problemSchema,
});

export const collections = {
  patterns: patternCollection,
  concepts: conceptCollection,
  problems: problemCollection,
};
