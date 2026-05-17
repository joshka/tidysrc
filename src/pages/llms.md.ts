import { getLlmsContent, renderLlmsText } from '../lib/llmsContent';

export async function GET() {
  const content = await getLlmsContent();

  return new Response(renderLlmsText(content), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
