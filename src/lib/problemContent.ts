import type { CodeExample } from '../data/catalog';

export type InlineMarkdownPart =
  | {
      text: string;
      type: 'text';
    }
  | {
      href: string;
      text: string;
      type: 'link';
    }
  | {
      text: string;
      type: 'code';
    }
  | {
      text: string;
      type: 'strong';
    }
  | {
      text: string;
      type: 'emphasis';
    };

export type ProblemContent = {
  approach: string[];
  codeImpact: string;
  description: string[];
  diagnosticQuestions: string[];
  examples?: CodeExample[];
  impact: string;
  references: string[];
  signals: string[];
  whyItMatters: string;
};

export function parseInlineMarkdown(text: string): InlineMarkdownPart[] {
  const parts: InlineMarkdownPart[] = [];
  const matches = [
    ...text.matchAll(/\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g),
  ];
  let cursor = 0;

  for (const match of matches) {
    const index = match.index ?? 0;
    if (index > cursor) {
      parts.push({ text: text.slice(cursor, index), type: 'text' });
    }
    if (match[1] && match[2]) {
      parts.push({ href: match[2], text: match[1], type: 'link' });
    } else if (match[3]) {
      parts.push({ text: match[3], type: 'code' });
    } else if (match[4]) {
      parts.push({ text: match[4], type: 'strong' });
    } else if (match[5]) {
      parts.push({ text: match[5], type: 'emphasis' });
    }
    cursor = index + match[0].length;
  }

  if (cursor < text.length) {
    parts.push({ text: text.slice(cursor), type: 'text' });
  }

  return parts.length > 0 ? parts : [{ text, type: 'text' }];
}

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

  const description = sections.get('description');
  const whyItMatters = sections.get('why it matters');
  const codeImpact = sections.get('code impact');
  const legacyImpact = sections.get('impact');

  const parsedWhyItMatters = parseParagraph(whyItMatters ?? legacyImpact ?? '');

  return {
    approach: parseListSection(requireSection(sections, 'approach', id)),
    codeImpact: parseParagraph(codeImpact ?? legacyImpact ?? ''),
    description: description ? parseParagraphs(description) : [],
    diagnosticQuestions: parseListSection(requireSection(sections, 'diagnostic questions', id)),
    examples: parseExamples(sections.get('examples') ?? '', id),
    impact: parsedWhyItMatters,
    references: parseReferences(sections.get('references') ?? ''),
    signals: parseListSection(requireSection(sections, 'signals', id)),
    whyItMatters: parsedWhyItMatters,
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
