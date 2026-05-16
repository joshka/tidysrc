// @ts-check
import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.joshka.net',
  base: '/tidysrc',
  integrations: [
    expressiveCode({
      themes: ['github-light', 'github-dark'],
      defaultProps: {
        wrap: false,
      },
      frames: {
        showCopyToClipboardButton: true,
      },
      styleOverrides: {
        borderRadius: '6px',
        borderColor: 'var(--border-strong)',
        codeFontFamily: 'var(--font-mono)',
      },
    }),
    mdx(),
  ],
});
