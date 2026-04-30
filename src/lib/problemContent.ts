import type { CodeExample } from '../data/catalog';

export type ProblemContent = {
  approach: string[];
  diagnosticQuestions: string[];
  examples?: CodeExample[];
  impact: string;
  signals: string[];
};

export function parseProblemContent(source: string, id: string): ProblemContent {
  const sections = new Map<string, string>();
  const matches = [...source.matchAll(/^##\s+(.+)$/gm)];

  for (const [index, match] of matches.entries()) {
    const title = match[1].trim().toLowerCase();
    const start = (match.index ?? 0) + match[0].length;
    const end =
      index + 1 < matches.length ? (matches[index + 1].index ?? source.length) : source.length;
    sections.set(title, source.slice(start, end).trim());
  }

  const impact = requireSection(sections, 'impact', id);
  return {
    approach: parseListSection(requireSection(sections, 'approach', id)),
    diagnosticQuestions: parseListSection(requireSection(sections, 'diagnostic questions', id)),
    examples: parseExamples(sections.get('examples') ?? '', id),
    impact: parseParagraph(impact),
    signals: parseListSection(requireSection(sections, 'signals', id)),
  };
}

function requireSection(sections: Map<string, string>, key: string, id: string): string {
  const section = sections.get(key);
  if (!section) {
    throw new Error(`Problem "${id}" is missing required section "## ${key}".`);
  }
  return section;
}

function parseParagraph(section: string): string {
  return (
    section
      .split(/\n{2,}/)
      .at(0)
      ?.replace(/\s*\n\s*/g, ' ')
      .trim() ?? ''
  );
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

function parseExamples(section: string, id: string): CodeExample[] | undefined {
  if (!section.trim()) {
    return undefined;
  }

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
    throw new Error(`Problem "${id}" has "## Examples" but no "###" example blocks.`);
  }

  return examples;
}

function parseExampleBlock(title: string, body: string, id: string): CodeExample {
  const codeMatch = body.match(/```([A-Za-z0-9_-]+)([^\n]*)\n([\s\S]*?)\n```/);

  if (!codeMatch) {
    throw new Error(
      `Problem "${id}" example "${title}" must include a fenced code block with language metadata.`,
    );
  }

  const path = parseFenceTitle(codeMatch[2]);
  if (!path) {
    throw new Error(
      `Problem "${id}" example "${title}" must include title="path/to/file" on its code fence.`,
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
