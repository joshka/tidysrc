import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { readJson, reviewDir, writeJson } from './review-utils.mjs';

const queueFile = path.join(reviewDir, 'queue.json');
const currentFile = path.join(reviewDir, 'current.json');
const args = new Set(process.argv.slice(2));

if (!fs.existsSync(queueFile)) {
  console.error('Review queue is missing. Run `pnpm review:prepare` first.');
  process.exit(1);
}

const queue = readJson(queueFile);
const current = fs.existsSync(currentFile) ? readJson(currentFile) : { index: 0 };
const direction = args.has('--previous') ? -1 : args.has('--again') ? 0 : 1;
let index = current.index ?? 0;

if (current.itemId && direction === 1 && index >= queue.length - 1) {
  console.log(`Review queue complete: ${queue.length}/${queue.length} items shown.`);
  console.log('Use `pnpm review:next -- --again` to reopen the last item.');
  console.log('Use `pnpm review:prepare -- --reset` to restart from the beginning.');
  process.exit(0);
}

if (direction !== 0 || !current.itemId) {
  index = clamp(index + (current.itemId ? direction : 0), 0, queue.length - 1);
}

const item = queue[index];
writeJson(currentFile, { index, itemId: item.id, shownAt: new Date().toISOString() });

if (!args.has('--no-open')) {
  const firefox = spawnSync('open', ['-a', 'Firefox', item.url], { stdio: 'ignore' });
  if (firefox.status !== 0) {
    spawnSync('open', [item.url], { stdio: 'ignore' });
  }
}

console.log(`#${index + 1}/${queue.length} ${item.priority} ${item.id}`);
console.log(item.title);
console.log(`URL: ${item.url}`);
console.log(`Source: ${item.source}`);
console.log(`Brief: ${item.brief}`);
console.log(`Status: ${item.status}`);
console.log('');
console.log('Review focus:');
for (const focus of item.reviewFocus) {
  console.log(`- ${focus}`);
}
console.log('');
if (item.findings.length > 0) {
  console.log('Generated findings:');
  for (const finding of item.findings) {
    console.log(`- ${finding}`);
  }
} else {
  console.log('Generated findings: none');
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
