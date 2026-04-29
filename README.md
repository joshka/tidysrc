# TidySrc

TidySrc is a standalone pattern language for making source code easier to change.

This prototype uses Astro content collections, a searchable pattern catalog, concise pattern pages,
concept anchors, agent guidance, reusable config examples, and code examples rendered with
Expressive Code.

## Development

This repo uses mise and pnpm.

```sh
mise install
pnpm install
pnpm dev
```

## Commands

| Command        | Action                                    |
| :------------- | :---------------------------------------- |
| `pnpm dev`     | Start the local dev server                |
| `pnpm check`   | Run Astro diagnostics                     |
| `pnpm build`   | Run Astro diagnostics and build the site  |
| `pnpm preview` | Preview the built site                    |

## Current Prototype

- `/patterns/` is the searchable/filterable pattern catalog.
- `/patterns/:slug/` renders concise pattern pages with examples and agent snippets.
- `/concepts/` contains deeper teaching anchors.
- `/agents/` contains consolidated agent-facing guidance.
- `/configs/` shows reusable Rust and Markdown tooling defaults.
- `/references/` links to influences and adjacent sources.
- `/llms.txt` exposes a compact machine-readable summary.
