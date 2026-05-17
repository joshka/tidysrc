import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';

import { canonicalRoot, relativePatternPath, rewriteSiteLinks } from '../../lib/llmsContent';

type Props = {
  pattern: CollectionEntry<'patterns'>;
};

export async function getStaticPaths() {
  const patterns = await getCollection('patterns');
  return patterns.map((pattern) => ({ params: { id: pattern.id }, props: { pattern } }));
}

export async function GET({ props }: { props: Props }) {
  const { pattern } = props;
  const body = [
    `# ${pattern.data.title}`,
    '',
    `Canonical URL: ${new URL(relativePatternPath(pattern.id), canonicalRoot).toString()}`,
    '',
    pattern.data.summary,
    '',
    `Status: ${pattern.data.status}`,
    `Tags: ${pattern.data.tags.join(', ')}`,
    `Audiences: ${pattern.data.audiences.join(', ')}`,
    `Languages: ${pattern.data.languages.join(', ')}`,
    '',
    rewriteSiteLinks(pattern.body ?? ''),
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
