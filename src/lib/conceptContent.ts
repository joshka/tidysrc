import type { CodeExample } from '../data/catalog';

export type ConceptSection = {
  body: string[];
  title: string;
};

export type ConceptContent = {
  examples?: CodeExample[];
  sections: ConceptSection[];
};

export function parseConceptContent(source: string, id: string): ConceptContent {
  const sections: ConceptSection[] = [];
  let examples: CodeExample[] | undefined;
  const matches = [...source.matchAll(/^##\s+(.+)$/gm)];

  for (const [index, match] of matches.entries()) {
    const title = match[1].trim();
    const start = (match.index ?? 0) + match[0].length;
    const end =
      index + 1 < matches.length ? (matches[index + 1].index ?? source.length) : source.length;
    const body = source.slice(start, end).trim();

    if (title.toLowerCase() === 'examples') {
      examples = parseExamples(body, id);
    } else {
      sections.push({
        body: parseParagraphs(body),
        title,
      });
    }
  }

  if (sections.length === 0) {
    throw new Error(`Concept "${id}" must include at least one "##" section.`);
  }

  return { examples, sections };
}

function parseParagraphs(section: string): string[] {
  return section
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
}

function parseExamples(section: string, id: string): CodeExample[] {
  const examples: CodeExample[] = [];
  const matches = [...section.matchAll(/^###\s+(.+)$/gm)];

  for (const [index, match] of matches.entries()) {
    const title = match[1].trim();
    const start = (match.index ?? 0) + match[0].length;
    const end =
      index + 1 < matches.length ? (matches[index + 1].index ?? section.length) : section.length;
    const body = section.slice(start, end).trim();
    examples.push(parseExampleBlock(title, body, id));
  }

  if (examples.length === 0) {
    throw new Error(`Concept "${id}" has "## Examples" but no "###" example blocks.`);
  }

  return examples;
}

function parseExampleBlock(title: string, body: string, id: string): CodeExample {
  const codeMatch = body.match(/```([A-Za-z0-9_+#-]+)([^\n]*)\n([\s\S]*?)\n```/);

  if (!codeMatch) {
    throw new Error(
      `Concept "${id}" example "${title}" must include a fenced code block with language metadata.`,
    );
  }

  const path = parseFenceTitle(codeMatch[2]);
  if (!path) {
    throw new Error(
      `Concept "${id}" example "${title}" must include title="path/to/file" on its code fence.`,
    );
  }

  const noteEnd = codeMatch.index ?? body.length;
  const note =
    noteEnd === 0
      ? undefined
      : body
          .slice(0, noteEnd)
          .trim()
          .replace(/\s*\n\s*/g, ' ');

  return {
    code: codeMatch[3].trim(),
    language: codeMatch[1],
    note,
    path,
    title,
  };
}

function parseFenceTitle(meta: string): string | undefined {
  return meta.match(/\btitle=(?:"([^"]+)"|'([^']+)'|(\S+))/)?.slice(1).find(Boolean);
}
