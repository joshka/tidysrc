import type { CodeExample } from '../data/catalog';

export type PatternContent = {
  agentInstruction: string;
  examples: CodeExample[];
  guidance: string[];
  narrative: string[];
  references: string[];
  tradeoffs: string[];
  useWhen: string[];
};

export function parsePatternContent(source: string, id: string): PatternContent {
  const sections = new Map<string, string>();
  const matches = [...source.matchAll(/^##\s+(.+)$/gm)];

  for (const [index, match] of matches.entries()) {
    const title = match[1].trim().toLowerCase();
    const start = (match.index ?? 0) + match[0].length;
    const end =
      index + 1 < matches.length ? (matches[index + 1].index ?? source.length) : source.length;
    sections.set(title, source.slice(start, end).trim());
  }

  return {
    agentInstruction: parseParagraph(requireSection(sections, 'agent instruction', id)),
    examples: parseExamples(requireSection(sections, 'examples', id), id),
    guidance: parseListSection(requireSection(sections, 'guidance', id)),
    narrative: parseParagraphs(requireSection(sections, 'core idea', id)),
    references: parseReferences(requireSection(sections, 'references', id)),
    tradeoffs: parseListSection(requireSection(sections, 'tradeoffs', id)),
    useWhen: parseListSection(requireSection(sections, 'use when', id)),
  };
}

function requireSection(sections: Map<string, string>, key: string, id: string): string {
  const section = sections.get(key);
  if (!section) {
    throw new Error(`Pattern "${id}" is missing required section "## ${key}".`);
  }
  return section;
}

function parseParagraph(section: string): string {
  return parseParagraphs(section)[0] ?? '';
}

function parseParagraphs(section: string): string[] {
  return section
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
}

function parseListSection(section: string): string[] {
  const items: string[] = [];
  let current: string | undefined;

  for (const line of section.split('\n')) {
    const item = line.match(/^-\s+(.+)$/);
    if (item) {
      if (current) {
        items.push(current.trim());
      }
      current = item[1].trim();
      continue;
    }

    if (current && line.match(/^\s{2,}\S/)) {
      current = `${current} ${line.trim()}`;
    }
  }

  if (current) {
    items.push(current.trim());
  }

  return items;
}

function parseReferences(section: string): string[] {
  return parseListSection(section).filter((reference) => reference !== 'None yet.');
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
    throw new Error(`Pattern "${id}" has "## Examples" but no "###" example blocks.`);
  }

  return examples;
}

function parseExampleBlock(title: string, body: string, id: string): CodeExample {
  const codeMatch = body.match(/```([A-Za-z0-9_+#-]+)([^\n]*)\n([\s\S]*?)\n```/);

  if (!codeMatch) {
    throw new Error(
      `Pattern "${id}" example "${title}" must include a fenced code block with language metadata.`,
    );
  }

  const path = parseFenceTitle(codeMatch[2]);
  if (!path) {
    throw new Error(
      `Pattern "${id}" example "${title}" must include title="path/to/file" on its code fence.`,
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
