# TidySrc

TidySrc is a standalone pattern language for making source code easier to change.

This site uses Astro content collections, a searchable pattern catalog, concise pattern pages,
problem diagnostics, concept anchors, agent guidance, references, and code examples rendered with
Expressive Code.

## Development

This repo uses mise and pnpm.

```sh
mise install
pnpm install
pnpm dev
```

## Commands

| Command                  | Action                                      |
| :----------------------- | :------------------------------------------ |
| `pnpm dev`               | Start the local dev server                  |
| `pnpm check`             | Run Astro diagnostics                       |
| `pnpm build`             | Run Astro diagnostics and build the site    |
| `pnpm check:site`        | Run content checks, build, and site checks  |
| `pnpm check:languages`   | Check language coverage data                |
| `pnpm preview`           | Preview the built site                      |

## Publishing

The production target is `https://www.joshka.net/tidysrc`. Astro is configured with
`site: "https://www.joshka.net"` and `base: "/tidysrc"` so generated links and assets work under the
subpath.

GitHub Pages deploys from the `main` branch through `.github/workflows/pages.yml`. The workflow uses
pnpm through the Astro GitHub Action and publishes the built `dist/` artifact to Pages.

## Current Site

- `/patterns/` is the searchable/filterable pattern catalog.
- `/patterns/:slug/` renders concise pattern pages with examples and agent snippets.
- `/concepts/` contains deeper teaching anchors.
- `/agents/` contains consolidated agent-facing guidance.
- `/references/` links to influences and adjacent sources.
- `/llms.txt` exposes a compact machine-readable summary.
