import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';

import { canonicalRoot, relativeProblemPath, rewriteSiteLinks } from '../../lib/llmsContent';

type Props = {
  problem: CollectionEntry<'problems'>;
};

export async function getStaticPaths() {
  const problems = await getCollection('problems');
  return problems.map((problem) => ({ params: { id: problem.id }, props: { problem } }));
}

export async function GET({ props }: { props: Props }) {
  const { problem } = props;
  const body = [
    `# ${problem.data.title}`,
    '',
    `Canonical URL: ${new URL(relativeProblemPath(problem.id), canonicalRoot).toString()}`,
    '',
    problem.data.summary,
    '',
    `Status: ${problem.data.status}`,
    `Category: ${problem.data.category}`,
    `Topics: ${problem.data.topics.join(', ')}`,
    '',
    rewriteSiteLinks(problem.body ?? ''),
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
