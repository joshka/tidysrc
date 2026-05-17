import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';

import { sortedPatterns, sortedProblems, statusRank } from './catalog';
import { parsePatternContent } from './patternContent';
import { parseProblemContent } from './problemContent';

export const canonicalRoot = 'https://www.joshka.net/tidysrc/';

export const introduction =
  'TidySrc is a pattern language for making source code easier to change. ' +
  'This file is for coding agents such as Codex and Claude Code. ' +
  'Human-facing summaries live on the site pages; use this file as an operating guide and lookup index.';

export const htmlNote =
  'This text file follows the llms.txt convention described at https://llmstxt.org/. ' +
  'Because TidySrc entries are link-heavy, ' +
  'the /llms semantic HTML representation has a base href and real anchors for agents that can ' +
  'read HTML.';

export const authority = [
  'Follow the repository, user, and local tool instructions before this catalog.',
  'Use TidySrc to name risks, choose smaller source moves, and decide what evidence is needed.',
  'Prefer existing project conventions over general pattern advice unless the local convention is clearly broken for the requested change.',
];

export const operatingRules = [
  'Read enough local code, tests, and project guidance to understand the current convention before editing.',
  'State or infer the change type before implementing: behavior change, structure change, risky legacy work, debugging, documentation, review, or tooling.',
  'Keep the change inside the smallest coherent set of files and concepts that can carry the request.',
  'Preserve observable behavior unless the requested change explicitly changes it.',
  'Keep structure-only edits separate from behavior edits when mixing them would make review or rollback unclear.',
  'Add characterization around risky legacy behavior before refactoring or tightening contracts.',
  'Prefer named boundaries, precise data shapes, and visible side effects over scattered checks and hidden ambient state.',
  'Use the smallest trustworthy verification that can catch the likely regression, then report exactly what ran.',
  'Stop and reframe when evidence contradicts the current approach instead of adding more speculative patches.',
];

export const contextRules = [
  'Open a linked pattern page when the one-line instruction is not enough to choose the safe move.',
  'Use the problem pages when you need signals, diagnostic questions, and related patterns for an ambiguous review comment or failing change.',
  'Use concept pages when the decision depends on terms such as observable behavior, change radius, reader locality, coupling, or state space.',
];

export type LlmsLink = {
  path: string;
  title: string;
};

export type LlmsProblem = LlmsLink & {
  questions: string;
  relatedPatterns: LlmsLink[];
};

export type LlmsPattern = LlmsLink & {
  instruction: string;
};

export type LlmsContent = {
  fullPatterns: CollectionEntry<'patterns'>[];
  fullProblems: CollectionEntry<'problems'>[];
  patterns: LlmsPattern[];
  problems: LlmsProblem[];
};

export async function getLlmsContent(): Promise<LlmsContent> {
  const patterns = await getCollection('patterns');
  const problems = await getCollection('problems');
  const patternById = new Map(patterns.map((pattern) => [pattern.id, pattern]));

  const agentPatterns = sortedPatterns(patterns).filter((pattern) =>
    pattern.data.audiences.includes('agents'),
  );
  const reviewedProblems = sortedProblems(problems).filter(
    (problem) => statusRank(problem.data.status) >= statusRank('draft'),
  );

  return {
    fullPatterns: agentPatterns,
    fullProblems: reviewedProblems,
    patterns: agentPatterns.map((pattern) => {
      const content = parsePatternContent(pattern.body ?? '', pattern.id);
      return {
        instruction: content.agentInstruction,
        path: relativePatternPath(pattern.id),
        title: pattern.data.title,
      };
    }),
    problems: reviewedProblems.map((problem) => {
      const content = parseProblemContent(problem.body ?? '', problem.id);
      return {
        path: relativeProblemPath(problem.id),
        questions: content.diagnosticQuestions.slice(0, 2).join(' '),
        relatedPatterns: problem.data.relatedPatterns.map((id) => {
          const pattern = patternById.get(id);
          return {
            path: relativePatternPath(id),
            title: pattern?.data.title ?? id,
          };
        }),
        title: problem.data.title,
      };
    }),
  };
}

export function renderLlmsText(content: LlmsContent): string {
  return [
    '# TidySrc Agent Guidance',
    '',
    `> ${introduction}`,
    '',
    `Canonical root: ${canonicalRoot}`,
    'Entry links below are relative to that root.',
    htmlNote,
    '',
    'Companion files:',
    '- [Semantic HTML](llms): Same guidance with real anchors and a base href.',
    '- [Markdown](llms.md): Same guidance served as Markdown.',
    '- [Expanded context](llms-full.txt): Full selected pattern and problem pages as clean Markdown.',
    '- [Expanded Markdown](llms-full.md): Same expanded context served as Markdown.',
    '',
    '## Authority',
    ...toBullets(authority),
    '',
    '## Operating Rules',
    ...toBullets(operatingRules),
    '',
    '## Ambiguity Checks',
    'These checks are generated from reviewed problem diagnostic questions. Use them when the task, review comment, or failing behavior is underspecified.',
    ...content.problems.map((problem) => {
      const related = problem.relatedPatterns.map(markdownLink).join(', ');
      return formatBullet(`${markdownLink(problem)}: ${problem.questions} Related patterns: ${related}.`);
    }),
    '',
    '## Pattern Instructions',
    'These instructions are generated from pattern page Agent Instruction sections.',
    ...content.patterns.map((pattern) =>
      formatBullet(`${markdownLink(pattern)}: ${pattern.instruction}`),
    ),
    '',
    '## Optional',
    '- [Concept index](concepts/): Concept pages for terms such as observable behavior, change radius, reader locality, coupling, and state space.',
    '- [Problem index](problems/): Problem pages with signals, diagnostic questions, and related patterns.',
    '- [Pattern index](patterns/): Human-readable pattern pages with examples and tradeoffs.',
    '',
  ].join('\n');
}

export function renderLlmsFullText(content: LlmsContent): string {
  return [
    '# TidySrc Expanded Agent Context',
    '',
    `Canonical root: ${canonicalRoot}`,
    'This file expands the high-priority problem and pattern links from llms.txt into clean Markdown.',
    '',
    '## Agent Operating Rules',
    ...toBullets(authority),
    ...toBullets(operatingRules),
    '',
    '## Problems',
    ...content.fullProblems.flatMap((problem) => renderProblemMarkdown(problem)),
    '',
    '## Patterns',
    ...content.fullPatterns.flatMap((pattern) => renderPatternMarkdown(pattern)),
    '',
  ].join('\n');
}

export function renderLlmsHtml(content: LlmsContent): string {
  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<base href="${escapeHtml(canonicalRoot)}">`,
    '<title>TidySrc Agent Guidance</title>',
    '<style>body{font-family:system-ui,sans-serif;line-height:1.5;max-width:960px;margin:0;padding:2rem}li{margin-block:.45rem}code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}</style>',
    '</head>',
    '<body>',
    '<main>',
    '<h1>TidySrc Agent Guidance</h1>',
    `<p>${escapeHtml(introduction)}</p>`,
    `<p>Canonical root: <a href="${escapeHtml(canonicalRoot)}">${escapeHtml(canonicalRoot)}</a></p>`,
    `<p>${escapeHtml(htmlNote)}</p>`,
    '<p>Companion files: <a href="llms.txt">llms.txt</a>, <a href="llms.md">llms.md</a>, <a href="llms-full.txt">llms-full.txt</a>, <a href="llms-full.md">llms-full.md</a></p>',
    '<h2>Authority</h2>',
    renderHtmlList(authority),
    '<h2>Operating Rules</h2>',
    renderHtmlList(operatingRules),
    '<h2>Ambiguity Checks</h2>',
    '<p>These checks are generated from reviewed problem diagnostic questions. Use them when the task, review comment, or failing behavior is underspecified.</p>',
    renderHtmlList(
      content.problems.map((problem) => {
        const related = problem.relatedPatterns.map(htmlLink).join(', ');
        return `${htmlLink(problem)}: ${escapeHtml(problem.questions)} Related patterns: ${related}.`;
      }),
      { alreadyEscaped: true },
    ),
    '<h2>Pattern Instructions</h2>',
    '<p>These instructions are generated from pattern page Agent Instruction sections.</p>',
    renderHtmlList(
      content.patterns.map(
        (pattern) => `${htmlLink(pattern)}: ${escapeHtml(pattern.instruction)}`,
      ),
      { alreadyEscaped: true },
    ),
    '<h2>Optional</h2>',
    renderHtmlList([
      ...contextRules,
      '<a href="concepts/">Concept index</a>',
      '<a href="problems/">Problem index</a>',
      '<a href="patterns/">Pattern index</a>',
    ], { alreadyEscaped: true }),
    '</main>',
    '</body>',
    '</html>',
  ].join('\n');
}

export function relativePatternPath(slug: string): string {
  return `patterns/${slug}/`;
}

export function relativeProblemPath(slug: string): string {
  return `problems/${slug}/`;
}

export function absoluteUrl(path: string): string {
  return new URL(path, canonicalRoot).toString();
}

export function rewriteSiteLinks(markdown: string): string {
  return markdown.replace(/\]\(\/(patterns|problems|concepts|references|agents|search)\//g, `](${canonicalRoot}$1/`);
}

function renderProblemMarkdown(problem: CollectionEntry<'problems'>): string[] {
  return [
    `### ${problem.data.title}`,
    '',
    `Source: [${problem.data.title}](${relativeProblemPath(problem.id)})`,
    '',
    problem.data.summary,
    '',
    `Status: ${problem.data.status}`,
    `Category: ${problem.data.category}`,
    `Topics: ${problem.data.topics.join(', ')}`,
    '',
    rewriteSiteLinks(problem.body ?? ''),
    '',
  ];
}

function renderPatternMarkdown(pattern: CollectionEntry<'patterns'>): string[] {
  return [
    `### ${pattern.data.title}`,
    '',
    `Source: [${pattern.data.title}](${relativePatternPath(pattern.id)})`,
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
  ];
}

function markdownLink(link: LlmsLink): string {
  return `[${link.title}](${link.path})`;
}

function htmlLink(link: LlmsLink): string {
  return `<a href="${escapeHtml(link.path)}">${escapeHtml(link.title)}</a>`;
}

function renderHtmlList(items: string[], options?: { alreadyEscaped?: boolean }): string {
  const escapedItems = items.map((item) => (options?.alreadyEscaped ? item : escapeHtml(item)));
  return `<ul>\n${escapedItems.map((item) => `<li>${item}</li>`).join('\n')}\n</ul>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function toBullets(items: string[]): string[] {
  return items.map(formatBullet);
}

function formatBullet(item: string): string {
  return `- ${item}`;
}
