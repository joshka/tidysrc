import { getLlmsContent, renderLlmsFullText } from '../lib/llmsContent';

export async function GET() {
  const content = await getLlmsContent();

  return new Response(renderLlmsFullText(content), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
