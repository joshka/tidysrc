import { getCollection } from 'astro:content';

export async function GET() {
  const patterns = await getCollection('patterns');
  const concepts = await getCollection('concepts');
  const problems = await getCollection('problems');

  const body = [
    '# TidySrc',
    '',
    'TidySrc is a pattern language for making source code easier to change.',
    '',
    'Follow existing project conventions first. When the repo is silent, prefer small source changes that reduce reader burden, protect observable behavior, avoid premature architecture, and run the smallest trustworthy verification.',
    '',
    '## Problems',
    ...problems.map((problem) => `- ${problem.data.title}: ${problem.data.summary}`),
    '',
    '## Patterns',
    ...patterns.map((pattern) => `- ${pattern.data.title}: ${pattern.data.summary}`),
    '',
    '## Concepts',
    ...concepts.map((concept) => `- ${concept.data.title}: ${concept.data.summary}`),
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
