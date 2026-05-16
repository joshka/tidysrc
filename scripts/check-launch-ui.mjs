import { spawn } from 'node:child_process';

import { chromium } from '@playwright/test';

const host = '127.0.0.1';
const port = 4324;
const siteBase = (process.env.TIDYSRC_SITE_BASE ?? '/tidysrc').replace(/\/$/, '');
const baseUrl = `http://${host}:${port}${siteBase}`;

function fail(message) {
  throw new Error(message);
}

async function waitForPreview() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/`);
      if (response.ok) {
        return;
      }
    } catch {
      // Preview is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  fail('Timed out waiting for Astro preview server.');
}

async function visit(page, route, theme = 'light') {
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((mode) => localStorage.setItem('tidysrc-theme-mode', mode), theme);
  await page.reload({ waitUntil: 'domcontentloaded' });
}

async function visibleCount(page, selector) {
  return page.locator(selector).evaluateAll((items) =>
    items.filter((item) => !item.hasAttribute('hidden')).length,
  );
}

async function expectNoDocumentOverflow(page, route, viewport, theme) {
  const result = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  if (result.scrollWidth > result.clientWidth + 1) {
    fail(
      `${theme} ${viewport.width}x${viewport.height} ${route} overflows horizontally ` +
        `(${result.scrollWidth}px > ${result.clientWidth}px).`,
    );
  }
}

async function expectFooterAndFonts(page, route) {
  const surface = await page.evaluate(() => {
    const footer = document.querySelector('footer')?.textContent ?? '';
    const bodyFont = getComputedStyle(document.body).fontFamily;
    const code = document.querySelector('code, pre');
    const codeFont = code ? getComputedStyle(code).fontFamily : '';
    return { bodyFont, codeFont, footer };
  });

  if (!surface.footer.includes('Josh McKinney') || !surface.footer.includes('llms.txt')) {
    fail(`${route} footer is missing the author or llms.txt surface.`);
  }

  if (!surface.bodyFont.includes('Space Grotesk')) {
    fail(`${route} body font is not using the configured sans token.`);
  }

  if (
    surface.codeFont &&
    !/SFMono|Consolas|Liberation Mono|Menlo|monospace/.test(surface.codeFont)
  ) {
    fail(`${route} code font is not using the configured mono token.`);
  }
}

async function checkLayoutSurfaces(browser) {
  const routes = [
    '/',
    '/patterns/',
    '/problems/',
    '/concepts/',
    '/agents/',
    '/references/',
    '/search/',
  ];
  const viewports = [
    { name: 'desktop', size: { width: 1280, height: 900 } },
    { name: 'mobile', size: { width: 390, height: 844 } },
  ];

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport: viewport.size });
    try {
      for (const theme of ['light', 'dark']) {
        for (const route of routes) {
          await visit(page, route, theme);
          await expectNoDocumentOverflow(page, route, viewport.size, theme);
          await expectFooterAndFonts(page, route);
        }
      }
    } finally {
      await page.close();
    }
  }
}

async function checkSearchAndFilters(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  try {
    await visit(page, '/patterns/');
    await page.locator('[data-quick-filter="tags"][data-value="testing"]').click();
    const patternCount = await visibleCount(page, '[data-pattern-row]');
    if (patternCount === 0) {
      fail('Pattern pathway filter produced no visible rows.');
    }
    const patternMismatch = await page.locator('[data-pattern-row]:not([hidden])').evaluateAll(
      (rows) => rows.filter((row) => !row.dataset.tags?.split(' ').includes('testing')).length,
    );
    if (patternMismatch > 0 || !page.url().includes('tags=testing')) {
      fail('Pattern pathway filter did not keep visible rows and URL in sync.');
    }

    await visit(page, '/problems/');
    await page.locator('[data-problem-category-tab="testing"]').click();
    const problemCount = await visibleCount(page, '[data-problem-card]');
    if (problemCount === 0) {
      fail('Problem pathway filter produced no visible cards.');
    }
    const problemMismatch = await page.locator('[data-problem-card]:not([hidden])').evaluateAll(
      (cards) => cards.filter((card) => card.dataset.category !== 'testing').length,
    );
    if (problemMismatch > 0 || !page.url().includes('category=testing')) {
      fail('Problem pathway filter did not keep visible cards and URL in sync.');
    }

    const missingRelated = await page.locator('[data-problem-card]:not([hidden])').evaluateAll(
      (cards) =>
        cards.filter((card) => card.querySelectorAll('.related-links a').length === 0).length,
    );
    if (missingRelated > 0) {
      fail('Visible problem cards are missing the symptom-to-pattern route.');
    }

    await visit(page, '/search/');
    await page.locator('[data-global-search]').fill('guard clause');
    await page.locator('[data-global-type]').selectOption('pattern');
    const searchCount = await visibleCount(page, '[data-global-row]');
    if (searchCount === 0) {
      fail('Global search produced no pattern rows for "guard clause".');
    }
    const searchMismatch = await page.locator('[data-global-row]:not([hidden])').evaluateAll(
      (rows) =>
        rows.filter(
          (row) =>
            row.dataset.type !== 'pattern' || !row.dataset.search?.includes('guard clause'),
        ).length,
    );
    if (
      searchMismatch > 0 ||
      !page.url().includes('q=guard+clause') ||
      !page.url().includes('type=pattern')
    ) {
      fail('Global search did not keep filtered rows and URL in sync.');
    }
  } finally {
    await page.close();
  }
}

async function checkCodeAndCopyControls(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  try {
    await visit(page, '/patterns/guard-clause/');
    const codeBlocks = await page.locator('.expressive-code').count();
    const copyButtons = await page.locator('.expressive-code .copy button').count();
    if (codeBlocks === 0 || copyButtons === 0) {
      fail('Pattern code examples are missing Expressive Code blocks or copy controls.');
    }

    const copyStyle = await page
      .locator('.expressive-code .copy button')
      .first()
      .evaluate((button) => {
        const style = getComputedStyle(button);
        return {
          borderRadius: style.borderRadius,
          fontFamily: style.fontFamily,
          height: button.getBoundingClientRect().height,
          width: button.getBoundingClientRect().width,
        };
      });

    if (copyStyle.borderRadius !== '0px' || !copyStyle.fontFamily.includes('Space Grotesk')) {
      fail('Expressive Code copy controls do not match the site control styling.');
    }

    if (copyStyle.width < 20 || copyStyle.height < 20) {
      fail('Expressive Code copy controls are too small to use reliably.');
    }
  } finally {
    await page.close();
  }
}

const preview = spawn(
  'pnpm',
  ['exec', 'astro', 'preview', '--host', host, '--port', String(port)],
  { stdio: 'ignore' },
);

try {
  await waitForPreview();
  const browser = await chromium.launch();
  try {
    await checkLayoutSurfaces(browser);
    await checkSearchAndFilters(browser);
    await checkCodeAndCopyControls(browser);
  } finally {
    await browser.close();
  }
} finally {
  preview.kill();
}

console.log('Launch UI checks passed.');
