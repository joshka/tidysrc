import fs from 'node:fs';
import path from 'node:path';

import { readJson, reviewDir } from './review-utils.mjs';

const queueFile = path.join(reviewDir, 'queue.json');
const currentFile = path.join(reviewDir, 'current.json');

if (!fs.existsSync(queueFile)) {
  console.error('Review queue is missing. Run `pnpm review:prepare` first.');
  process.exit(1);
}

const queue = readJson(queueFile);
const current = fs.existsSync(currentFile) ? readJson(currentFile) : { index: 0 };
const byPriority = new Map();
const byType = new Map();
for (const item of queue) {
  byPriority.set(item.priority, (byPriority.get(item.priority) ?? 0) + 1);
  byType.set(item.type, (byType.get(item.type) ?? 0) + 1);
}

console.log(`Prepared items: ${queue.length}`);
if (current.itemId) {
  console.log(`Current index: ${(current.index ?? 0) + 1}/${queue.length}`);
  console.log(`Current item: ${current.itemId}`);
} else {
  console.log('Current index: not started');
  console.log(`Next item: ${queue[current.index ?? 0]?.id ?? 'none'}`);
}
console.log('');
console.log('By priority:');
for (const [priority, count] of [...byPriority.entries()].sort()) {
  console.log(`- ${priority}: ${count}`);
}
console.log('');
console.log('By type:');
for (const [type, count] of [...byType.entries()].sort()) {
  console.log(`- ${type}: ${count}`);
}
