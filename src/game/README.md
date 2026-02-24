# Game Domain Boundary

- `src/game/**` is pure TypeScript domain code (no React imports, no DOM API usage).
- `src/ui/**` may depend on `src/game/**`, but `src/game/**` must not depend on `src/ui/**`.
