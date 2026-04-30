import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { chromium } from '@playwright/test';

const host = '127.0.0.1';
const port = 4322;
const baseUrl = `http://${host}:${port}`;

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    if (fs.statSync(file).isDirectory()) {
      walk(file, files);
    } else {
      files.push(file);
    }
  }

  return files;
}

function routeForHtml(file) {
  const route = file.slice('dist'.length).replace(/\/index\.html$/, '/') || '/';
  return route;
}

function checkInternalLinks() {
  const files = walk('dist');
  const htmlFiles = files.filter((file) => file.endsWith('.html'));
  const routes = new Set(htmlFiles.map(routeForHtml));
  const assets = new Set(files.map((file) => `/${file.slice('dist/'.length)}`));
  const missing = [];

  for (const file of htmlFiles) {
    const from = routeForHtml(file);
    const html = fs.readFileSync(file, 'utf8');
    for (const match of html.matchAll(/href="([^"]+)"/g)) {
      const href = match[1].split('#')[0].split('?')[0];
      if (
        !href ||
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('data:') ||
        href.startsWith('/_astro/')
      ) {
        continue;
      }

      const route = href.endsWith('/') ? href : `${href}/`;
      if (!routes.has(route) && !assets.has(href)) {
        missing.push(`${from} -> ${href}`);
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing internal links:\n${missing.map((item) => `- ${item}`).join('\n')}`);
  }
}

function parseRgb(value) {
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : undefined;
}

function srgb(value) {
  const channel = value / 255;
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function luminance(rgb) {
  return 0.2126 * srgb(rgb[0]) + 0.7152 * srgb(rgb[1]) + 0.0722 * srgb(rgb[2]);
}

function contrastRatio(foreground, background) {
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  const [light, dark] =
    foregroundLuminance > backgroundLuminance
      ? [foregroundLuminance, backgroundLuminance]
      : [backgroundLuminance, foregroundLuminance];
  return (light + 0.05) / (dark + 0.05);
}

async function waitForPreview() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) {
        return;
      }
    } catch {
      // Preview is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error('Timed out waiting for Astro preview server.');
}

async function checkCodeContrast() {
  const routes = walk('dist')
    .filter((file) => file.endsWith('index.html'))
    .map(routeForHtml);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const failures = [];

  try {
    for (const theme of ['light', 'dark']) {
      for (const route of routes) {
        await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
        await page.evaluate((mode) => localStorage.setItem('tidysrc-theme-mode', mode), theme);
        await page.reload({ waitUntil: 'domcontentloaded' });
        const rows = await page.evaluate(() => {
          function backgroundFor(element) {
            let node = element;
            while (node) {
              const background = getComputedStyle(node).backgroundColor;
              if (
                background &&
                background !== 'rgba(0, 0, 0, 0)' &&
                background !== 'transparent'
              ) {
                return background;
              }
              node = node.parentElement;
            }
            return getComputedStyle(document.body).backgroundColor;
          }

          return [
            ...document.querySelectorAll(
              '.expressive-code .ec-line span, .expressive-code pre, .expressive-code code, .expressive-code .title',
            ),
          ]
            .map((element) => ({
              background: backgroundFor(element),
              color: getComputedStyle(element).color,
              text: (element.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 80),
            }))
            .filter((row) => row.text);
        });

        for (const row of rows) {
          const color = parseRgb(row.color);
          const background = parseRgb(row.background);
          if (!color || !background) {
            continue;
          }

          const ratio = contrastRatio(color, background);
          if (ratio < 4.5) {
            failures.push(`${theme} ${route}: ${ratio.toFixed(2)} ${row.text}`);
          }
        }
      }
    }
  } finally {
    await browser.close();
  }

  if (failures.length > 0) {
    throw new Error(
      `Syntax highlighting contrast failures:\n${failures
        .slice(0, 30)
        .map((item) => `- ${item}`)
        .join('\n')}`,
    );
  }
}

checkInternalLinks();

const preview = spawn(
  'pnpm',
  ['exec', 'astro', 'preview', '--host', host, '--port', String(port)],
  { stdio: 'ignore' },
);

try {
  await waitForPreview();
  await checkCodeContrast();
} finally {
  preview.kill();
}

console.log('Site checks passed.');
