import fs from 'node:fs';
import path from 'node:path';

export const reviewDir = '.review';
export const requiredExampleLanguages = [
  'c',
  'cpp',
  'csharp',
  'go',
  'java',
  'js',
  'python',
  'rust',
  'ts',
];

export const languageLabels = new Map([
  ['c', 'C'],
  ['cpp', 'C++'],
  ['c++', 'C++'],
  ['csharp', 'C#'],
  ['cs', 'C#'],
  ['go', 'Go'],
  ['java', 'Java'],
  ['js', 'JavaScript'],
  ['javascript', 'JavaScript'],
  ['python', 'Python'],
  ['py', 'Python'],
  ['rust', 'Rust'],
  ['rs', 'Rust'],
  ['ts', 'TypeScript'],
  ['typescript', 'TypeScript'],
  ['tsx', 'TypeScript'],
  ['md', 'Markdown'],
  ['markdown', 'Markdown'],
  ['toml', 'TOML'],
  ['yaml', 'YAML'],
]);

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

export function markdownFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((file) => path.join(dir, file));
}

export function idFor(file) {
  return path.basename(file, '.md');
}

export function parseFrontmatter(source, file) {
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
        items.push(parseScalar(item));
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
      frontmatter[key] = parseScalar(value);
    }
  }

  return frontmatter;
}

function parseScalar(value) {
  return value.startsWith('"') ? JSON.parse(value) : value;
}

export function stripFrontmatter(source) {
  return source.replace(/^---\n[\s\S]*?\n---\n?/, '');
}

export function section(source, title) {
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

export function headings(source) {
  return [...source.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].trim());
}

export function paragraphCount(sectionText = '') {
  return sectionText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean).length;
}

export function listItems(sectionText = '') {
  const items = [];
  let current;
  for (const line of sectionText.split('\n')) {
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

export function exampleLanguages(source) {
  return [
    ...new Set(
      [...source.matchAll(/^```([A-Za-z0-9_+#-]+)/gm)]
        .map((match) => normalizeLanguage(match[1]))
        .filter(Boolean),
    ),
  ].sort((left, right) => requiredLanguageRank(left) - requiredLanguageRank(right));
}

export function normalizeLanguage(language) {
  const normalized = language.toLowerCase();
  if (normalized === 'c++') {
    return 'cpp';
  }
  if (normalized === 'cs') {
    return 'csharp';
  }
  if (normalized === 'javascript') {
    return 'js';
  }
  if (normalized === 'typescript' || normalized === 'tsx') {
    return 'ts';
  }
  if (normalized === 'py') {
    return 'python';
  }
  if (normalized === 'rs') {
    return 'rust';
  }
  return normalized;
}

export function missingRequiredLanguages(languages) {
  const languageSet = new Set(languages.map(normalizeLanguage));
  return requiredExampleLanguages.filter((language) => !languageSet.has(language));
}

export function formatLanguage(language) {
  return languageLabels.get(language) ?? language;
}

export function formatLanguages(languages) {
  return languages.length > 0
    ? languages.map((language) => formatLanguage(language)).join(', ')
    : 'none';
}

export function routeFor(type, id) {
  if (type === 'home') {
    return '/';
  }
  return `/${type}/${id}/`;
}

export function sourceFor(type, id) {
  if (type === 'page') {
    return `src/pages/${id}.astro`;
  }
  return `src/content/${type}/${id}.md`;
}

function requiredLanguageRank(language) {
  const index = requiredExampleLanguages.indexOf(language);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}
