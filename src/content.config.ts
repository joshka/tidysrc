import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

import { concepts, patterns } from './data/catalog';

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
  sections: z.array(
    z.object({
      title: z.string(),
      body: z.array(z.string()),
    }),
  ),
});

const patternCollection = defineCollection({
  loader: () => patterns,
  schema: patternSchema,
});

const conceptCollection = defineCollection({
  loader: () => concepts,
  schema: conceptSchema,
});

export const collections = {
  patterns: patternCollection,
  concepts: conceptCollection,
};
