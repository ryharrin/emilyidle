# AGENTS

## Overview

Static assets served by Vite; catalog images live under `public/catalog`.

## Structure

- `catalog/`: hex-named subfolders (`0-9`, `a-f`) with watch images.

## Conventions

- Catalog assets map to entries in `src/game/catalog.ts` via `/catalog/` URLs.
- Keep filenames and folder layout stable for URL mapping.

## Anti-patterns

- Don’t move/rename catalog files without updating `catalog.ts`.
