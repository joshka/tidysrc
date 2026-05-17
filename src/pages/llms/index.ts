import { getLlmsContent, renderLlmsHtml } from '../../lib/llmsContent';

export async function GET() {
  const content = await getLlmsContent();

  return new Response(renderLlmsHtml(content), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
