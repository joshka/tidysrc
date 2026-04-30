import fs from 'node:fs';
import path from 'node:path';

import {
  ensureDir,
  exampleLanguages,
  formatLanguages,
  headings,
  idFor,
  listItems,
  markdownFiles,
  missingRequiredLanguages,
  paragraphCount,
  parseFrontmatter,
  readJson,
  requiredExampleLanguages,
  reviewDir,
  routeFor,
  section,
  stripFrontmatter,
  writeJson,
} from './review-utils.mjs';

const baseUrl = process.env.TIDYSRC_REVIEW_BASE_URL ?? 'http://localhost:4321';
const briefsDir = path.join(reviewDir, 'briefs');
const notesDir = path.join(reviewDir, 'notes');
const queueFile = path.join(reviewDir, 'queue.json');
const manifestFile = path.join(reviewDir, 'manifest.json');
const currentFile = path.join(reviewDir, 'current.json');
const coverageReportFile = path.join('docs', 'content-coverage-report.md');
const correctionQueueFile = path.join('docs', 'correction-queue.md');
const args = new Set(process.argv.slice(2));
const coreConceptIds = new Set([
  'agent-guidance',
  'cognitive-burden',
  'observable-behavior',
  'reader-locality',
  'side-effect-visibility',
  'state-space',
]);
const pageNarrationPatterns = [
  {
    pattern: /\bthis page (covers|explains|shows|lists|collects|carries|helps)\b/i,
    label: 'Avoid page narration; write about the subject instead.',
  },
  {
    pattern: /\buse this page when\b/i,
    label: 'Avoid telling the reader how to use the page; name the concrete situation.',
  },
  {
    pattern: /\buse this group when\b/i,
    label: 'Avoid interface instructions; describe the content directly.',
  },
  {
    pattern: /\bthe rest of this page\b/i,
    label: 'Avoid page-structure narration; move straight to the content.',
  },
  {
    pattern: /\bthese (concepts|patterns|problems|references|configs|agents) (cover|explain|show|collect)\b/i,
    label: 'Avoid collection narration; state the underlying idea directly.',
  },
  {
    pattern: /\b(concepts|patterns|problems|references) carry the explanation\b/i,
    label: 'Avoid explaining site architecture; write the content claim instead.',
  },
];

const entries = [
  ...contentEntries('problems'),
  ...contentEntries('patterns'),
  ...contentEntries('concepts'),
  ...contentEntries('references'),
  ...pageEntries(),
];

const queue = entries
  .map((entry) => ({ ...entry, score: priorityScore(entry) }))
  .sort((left, right) => left.score - right.score || left.title.localeCompare(right.title))
  .map(({ score: _score, ...entry }, index) => ({ ...entry, order: index + 1, state: 'ready' }));

ensureDir(reviewDir);
ensureDir(briefsDir);
ensureDir(notesDir);

for (const entry of queue) {
  fs.writeFileSync(entry.brief, briefFor(entry));
}

writeJson(queueFile, queue);
writeJson(manifestFile, {
  baseUrl,
  generatedAt: new Date().toISOString(),
  requiredExampleLanguages,
  totals: totalsFor(queue),
});
writeJson(currentFile, nextCurrentState(queue));
fs.writeFileSync(coverageReportFile, coverageReport(queue));
if (!fs.existsSync(correctionQueueFile)) {
  fs.writeFileSync(
    correctionQueueFile,
    '# Correction Queue\n\nReviewer notes captured during the fast review loop go here.\n',
  );
}

console.log(`Prepared ${queue.length} review items in ${reviewDir}/.`);
console.log(`Next: pnpm review:next`);

function contentEntries(type) {
  return markdownFiles(`src/content/${type}`).map((file) => {
    const id = idFor(file);
    const source = fs.readFileSync(file, 'utf8');
    const data = parseFrontmatter(source, file);
    const presentLanguages = exampleLanguages(source);
    const missingLanguages =
      ['concepts', 'references'].includes(type) && !section(source, 'Examples')
        ? [...requiredExampleLanguages]
        : type === 'references'
          ? []
          : missingRequiredLanguages(presentLanguages);
    const sections = headings(source);
    const findings = findingsFor(type, data, source, presentLanguages, missingLanguages);
    const priority = priorityFor(type, id, data.status, findings);
    const reviewFocus = reviewFocusFor(type, findings, data.status);
    const route = routeForEntry(type, id);

    return {
      id: `${type}/${id}`,
      slug: id,
      type,
      title: data.title ?? id,
      status: data.status ?? 'page',
      category: data.category,
      topics: data.topics ?? data.tags ?? [],
      source: file,
      route,
      url: `${baseUrl}${route}`,
      brief: path.join(briefsDir, `${type}-${id}.md`),
      priority,
      reviewFocus,
      findings,
      sections,
      presentLanguages,
      missingLanguages,
      summary: data.summary ?? summaryFromBody(stripFrontmatter(source)),
    };
  });
}

function pageEntries() {
  const pages = [
    {
      id: 'home',
      route: '/',
      source: 'src/pages/index.astro',
      title: 'Home',
      focus: [
        'Does the first screen explain TidySrc quickly?',
        'Do the cards route to useful next steps?',
      ],
    },
    {
      id: 'patterns/index',
      route: '/patterns/',
      source: 'src/pages/patterns/index.astro',
      title: 'Pattern Index',
      focus: ['Do grouped pathway cards help discovery?', 'Do filters and rows feel fast enough?'],
    },
    {
      id: 'problems/index',
      route: '/problems/',
      source: 'src/pages/problems/index.astro',
      title: 'Problem Index',
      focus: ['Do impact previews clarify why each problem matters?', 'Do category pathways help?'],
    },
    {
      id: 'concepts/index',
      route: '/concepts/',
      source: 'src/pages/concepts/index.astro',
      title: 'Concept Index',
      focus: [
        'Do concept groups carry the right mental model?',
        'Are any concept cards too glossary-like?',
      ],
    },
    {
      id: 'agents/index',
      route: '/agents/',
      source: 'src/pages/agents/index.astro',
      title: 'Agents Index',
      focus: [
        'Does the workflow grouping match actual agent work?',
        'Are copyable rules operational?',
      ],
    },
    {
      id: 'configs/index',
      route: '/configs/',
      source: 'src/pages/configs/index.astro',
      title: 'Configs Index',
      focus: ['Are templates useful without being too prescriptive?', 'Are config examples scoped?'],
    },
    {
      id: 'references/index',
      route: '/references/',
      source: 'src/pages/references/index.astro',
      title: 'References Index',
      focus: ['Do reference groups explain source roles?', 'Are any links too narrow or missing?'],
    },
  ];

  return pages.map((page) => {
    const source = fs.readFileSync(page.source, 'utf8');
    const findings = writingFindings(source);
    return {
      id: `page/${page.id}`,
      slug: page.id,
      type: 'page',
      title: page.title,
      status: 'page',
      source: page.source,
      route: page.route,
      url: `${baseUrl}${page.route}`,
      brief: path.join(briefsDir, `page-${page.id.replaceAll('/', '-')}.md`),
      priority: 'P0',
      reviewFocus:
        findings.length > 0
          ? [...page.focus, 'Resolve or explicitly defer the generated findings.']
          : page.focus,
      findings,
      sections: [],
      presentLanguages: [],
      missingLanguages: [],
      summary: 'Site surface review item.',
    };
  });
}

function findingsFor(type, data, source, presentLanguages, missingLanguages) {
  const findings = writingFindings(source);
  if (type === 'references') {
    const body = stripFrontmatter(source).trim();
    if (!data.href?.startsWith('https://')) {
      findings.push('Reference href should be an HTTPS URL.');
    }
    if (!body) {
      findings.push('Reference needs a body note.');
    }
    return findings;
  }

  if (type === 'patterns') {
    for (const required of [
      'Core Idea',
      'Use When',
      'Guidance',
      'Tradeoffs',
      'Agent Instruction',
      'Examples',
      'References',
    ]) {
      if (!section(source, required)) {
        findings.push(`Missing section: ${required}`);
      }
    }
    if (paragraphCount(section(source, 'Core Idea') ?? '') < 2 && data.status !== 'seed') {
      findings.push('Core Idea may be too thin for launch-ready content.');
    }
  }

  if (type === 'problems') {
    for (const required of ['Impact', 'Signals', 'Diagnostic Questions', 'Approach']) {
      if (!section(source, required)) {
        findings.push(`Missing section: ${required}`);
      }
    }
    if ((section(source, 'Impact') ?? '').length < 180 && data.status !== 'seed') {
      findings.push('Impact may be too short to explain why this is a problem.');
    }
  }

  if (type === 'concepts') {
    const nonExampleSections = headings(source).filter(
      (heading) => heading.toLowerCase() !== 'examples',
    );
    if (nonExampleSections.length < 2 && data.status !== 'seed') {
      findings.push('Concept may need more than one explanatory section.');
    }
  }

  if (presentLanguages.length === 0 && type !== 'concepts') {
    findings.push('No code examples found.');
  }

  if (type !== 'references' && missingLanguages.length > 0) {
    findings.push(`Missing launch language examples: ${formatLanguages(missingLanguages)}.`);
  }

  if (listItems(section(source, 'References') ?? '').length === 0 && type === 'patterns') {
    findings.push('No references listed.');
  }

  return findings;
}

function writingFindings(source) {
  const findings = [];
  const lines = source.split('\n');
  for (const [index, line] of lines.entries()) {
    const proseLine = line.trim();
    if (!proseLine || proseLine.startsWith('//') || proseLine.startsWith('/*')) {
      continue;
    }
    for (const { pattern, label } of pageNarrationPatterns) {
      const match = proseLine.match(pattern);
      if (!match) {
        continue;
      }
      findings.push(`${label} Found "${match[0]}" on line ${index + 1}.`);
    }
  }
  return [...new Set(findings)];
}

function priorityFor(type, id, status, findings) {
  if (type === 'references') {
    return 'P1';
  }
  if (status === 'stable' || status === 'reviewed') {
    return 'P0';
  }
  if (type === 'concepts' && coreConceptIds.has(id)) {
    return status === 'seed' ? 'P2' : 'P1';
  }
  if (findings.some((finding) => finding.startsWith('Missing section'))) {
    return 'P1';
  }
  return status === 'seed' ? 'P2' : 'P1';
}

function reviewFocusFor(type, findings, status) {
  const focus = [];
  if (type === 'patterns') {
    focus.push('Does the title name a reusable source-change move?');
    focus.push('Do examples prove the pattern across the required languages?');
    focus.push('Is the agent instruction narrow enough to apply safely?');
  } else if (type === 'problems') {
    focus.push('Does the title name a problem you would use in review?');
    focus.push('Does impact explain the consequence clearly?');
    focus.push('Do examples show the problem shape in each required language?');
  } else if (type === 'concepts') {
    focus.push('Does the concept carry useful "why" beyond pattern cards?');
    focus.push('Does it connect to concrete problems or patterns?');
  } else if (type === 'references') {
    focus.push('Does this source belong in the public references list?');
    focus.push('Does the note say what the source is useful for?');
  }

  if (findings.length > 0) {
    focus.push('Resolve or explicitly defer the generated findings.');
  }
  if (status === 'seed') {
    focus.push('Decide whether this should stay seed, become draft, or be removed.');
  }
  return focus;
}

function priorityScore(entry) {
  const priorityRank = { P0: 0, P1: 1, P2: 2 };
  const typeRank = { page: 0, problems: 1, patterns: 2, concepts: 3, references: 4 };
  return (priorityRank[entry.priority] ?? 9) * 1000 + (typeRank[entry.type] ?? 9) * 100;
}

function totalsFor(queue) {
  const totals = {};
  for (const entry of queue) {
    totals[entry.priority] = (totals[entry.priority] ?? 0) + 1;
  }
  return { total: queue.length, byPriority: totals };
}

function briefFor(entry) {
  return `# ${entry.title}

- ID: \`${entry.id}\`
- Priority: ${entry.priority}
- Status: ${entry.status}
- Source: \`${entry.source}\`
- URL: ${entry.url}

## Summary

${entry.summary}

## Review Focus

${entry.reviewFocus.map((item) => `- ${item}`).join('\n')}

## Coverage

- Present example languages: ${formatLanguages(entry.presentLanguages)}
- Missing launch languages: ${formatLanguages(entry.missingLanguages)}

## Generated Findings

${
  entry.findings.length > 0
    ? entry.findings.map((finding) => `- ${finding}`).join('\n')
    : '- No generated findings.'
}

## Notes Template

- Accuracy:
- Naming:
- Impact / why it matters:
- Examples:
- Language idioms:
- Status decision:
- Corrections to queue:
`;
}

function coverageReport(queue) {
  return `# Content Coverage Report

Generated by \`pnpm review:prepare\`.

Required launch example languages: ${formatLanguages(requiredExampleLanguages)}

## Totals

${Object.entries(totalsFor(queue).byPriority)
  .sort()
  .map(([priority, count]) => `- ${priority}: ${count}`)
  .join('\n')}

## Queue

${queue
  .map(
    (entry) => `### ${entry.priority} ${entry.id}

- Title: ${entry.title}
- Status: ${entry.status}
- Source: \`${entry.source}\`
- Route: \`${entry.route}\`
- Present languages: ${formatLanguages(entry.presentLanguages)}
- Missing languages:
${bulletList(entry.missingLanguages, '  ', 'none')}
- Findings:
${bulletList(entry.findings, '  ', 'none')}
`,
  )
  .join('\n')}
`.trimEnd() + '\n';
}

function bulletList(items, indent, emptyText) {
  if (items.length === 0) {
    return `${indent}- ${emptyText}`;
  }
  return items.map((item) => `${indent}- ${item}`).join('\n');
}

function nextCurrentState(queue) {
  if (args.has('--reset') || !fs.existsSync(currentFile)) {
    return { index: 0 };
  }

  const current = readJson(currentFile);
  if (!current.itemId) {
    return { index: Math.min(current.index ?? 0, queue.length - 1) };
  }

  const index = queue.findIndex((entry) => entry.id === current.itemId);
  if (index === -1) {
    return { index: 0 };
  }

  return { ...current, index };
}

function routeForEntry(type, id) {
  if (type === 'references') {
    return `/references/#${id}`;
  }
  return routeFor(type, id);
}

function summaryFromBody(body) {
  return (
    body
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
      .find(Boolean) ?? 'No summary.'
  );
}
