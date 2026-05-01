import fs from 'node:fs';
import path from 'node:path';

const coreExampleLanguages = ['csharp', 'java', 'python', 'rust'];

function markdownFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((file) => path.join(dir, file));
}

function idFor(file) {
  return path.basename(file, '.md');
}

function parseFrontmatter(source, file) {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    throw new Error(`${file} is missing frontmatter.`);
  }

  const frontmatter = {};
  const lines = match[1].split('\n');
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const scalar = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/);
    if (!scalar) {
      continue;
    }

    const [, key, value] = scalar;
    if (value === '') {
      const items = [];
      while (index + 1 < lines.length && lines[index + 1].startsWith('  - ')) {
        index += 1;
        const item = lines[index].slice(4);
        items.push(item.startsWith('"') ? JSON.parse(item) : item);
      }
      frontmatter[key] = items;
    } else if (value === '>-') {
      const folded = [];
      while (index + 1 < lines.length && lines[index + 1].startsWith('  ')) {
        index += 1;
        folded.push(lines[index].slice(2));
      }
      frontmatter[key] = folded.join(' ');
    } else {
      frontmatter[key] = value.startsWith('"') ? JSON.parse(value) : value;
    }
  }

  return frontmatter;
}

function section(source, title) {
  const matches = [...source.matchAll(/^##\s+(.+)$/gm)];
  for (const [index, match] of matches.entries()) {
    if (match[1].trim().toLowerCase() !== title.toLowerCase()) {
      continue;
    }
    const start = (match.index ?? 0) + match[0].length;
    const end =
      index + 1 < matches.length ? (matches[index + 1].index ?? source.length) : source.length;
    return source.slice(start, end).trim();
  }
  return undefined;
}

function paragraphCount(sectionText) {
  return sectionText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean).length;
}

function exampleLanguages(source) {
  return [...new Set([...source.matchAll(/^```([A-Za-z0-9_+#-]+)/gm)].map((match) => match[1]))];
}

function hasTsFamily(languages) {
  return languages.some((language) => ['js', 'javascript', 'ts', 'typescript', 'tsx'].includes(language));
}

function missingCoreExamples(languages) {
  const languageSet = new Set(languages);
  const missing = coreExampleLanguages.filter((language) => !languageSet.has(language));
  if (!hasTsFamily(languages)) {
    missing.push('ts/js');
  }
  return missing;
}

function reportMissing(errors, owner, field, values, allowed) {
  for (const value of values ?? []) {
    if (!allowed.has(value)) {
      errors.push(`${owner}.${field} references missing id "${value}"`);
    }
  }
}

const errors = [];
const patternFiles = markdownFiles('src/content/patterns');
const problemFiles = markdownFiles('src/content/problems');
const conceptFiles = markdownFiles('src/content/concepts');
const referenceFiles = markdownFiles('src/content/references');
const patternIds = new Set(patternFiles.map(idFor));
const problemIds = new Set(problemFiles.map(idFor));
const conceptIds = new Set(conceptFiles.map(idFor));

for (const file of patternFiles) {
  const id = idFor(file);
  const source = fs.readFileSync(file, 'utf8');
  const data = parseFrontmatter(source, file);
  const owner = `pattern:${id}`;

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
      errors.push(`${owner} is missing section "## ${required}"`);
    }
  }

  const coreIdea = section(source, 'Core Idea');
  if (data.status !== 'seed' && coreIdea && paragraphCount(coreIdea) < 2) {
    errors.push(`${owner} needs at least two core idea paragraphs`);
  }

  reportMissing(errors, owner, 'related', data.related, patternIds);
  reportMissing(errors, owner, 'concepts', data.concepts, conceptIds);

  const languages = exampleLanguages(source);
  for (const language of languages) {
    if (!data.languages?.includes(language)) {
      errors.push(`${owner}.examples includes language "${language}" not listed in frontmatter`);
    }
  }

  if (data.status !== 'seed' && data.exampleStyle !== 'narrative') {
    const missing = missingCoreExamples(languages);
    if (missing.length > 0) {
      errors.push(`${owner} is missing core examples for ${missing.join(', ')}`);
    }
  }
}

for (const file of problemFiles) {
  const id = idFor(file);
  const source = fs.readFileSync(file, 'utf8');
  const data = parseFrontmatter(source, file);
  const owner = `problem:${id}`;

  reportMissing(errors, owner, 'relatedPatterns', data.relatedPatterns, patternIds);
  reportMissing(errors, owner, 'relatedConcepts', data.relatedConcepts, conceptIds);

  if (data.status !== 'seed') {
    const missing = missingCoreExamples(exampleLanguages(source));
    if (missing.length > 0) {
      errors.push(`${owner} is missing core examples for ${missing.join(', ')}`);
    }
  }
}

for (const file of conceptFiles) {
  const id = idFor(file);
  const source = fs.readFileSync(file, 'utf8');
  const data = parseFrontmatter(source, file);
  const owner = `concept:${id}`;

  reportMissing(errors, owner, 'relatedPatterns', data.relatedPatterns, patternIds);

  const sectionCount = [...source.matchAll(/^##\s+(.+)$/gm)].filter(
    (match) => match[1].trim().toLowerCase() !== 'examples',
  ).length;
  if (data.status !== 'seed' && sectionCount < 2) {
    errors.push(`${owner} needs at least two explanatory sections`);
  }
}

for (const file of referenceFiles) {
  const id = idFor(file);
  const source = fs.readFileSync(file, 'utf8');
  const data = parseFrontmatter(source, file);
  if (!data.href?.startsWith('https://')) {
    errors.push(`reference:${id}.href must be an https URL`);
  }

  const body = source.replace(/^---\n[\s\S]*?\n---/, '').trim();
  if (!body) {
    errors.push(`reference:${id} needs a body note`);
  }
}

if (errors.length > 0) {
  throw new Error(`Content validation failed:\n${errors.map((error) => `- ${error}`).join('\n')}`);
}

console.log(
  `Content validation passed for ${patternIds.size} patterns, ${problemIds.size} problems, ${conceptIds.size} concepts, and ${referenceFiles.length} references.`,
);
