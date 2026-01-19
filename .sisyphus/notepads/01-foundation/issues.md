## Issues / gotchas

- The `librarian-fast` clone is `--depth=1` shallow on `main`, so `packages/web-components/fast-foundation/*` is missing locally until fetching `origin/archives/fast-foundation-3`.
- The requested commit SHA `d1cd327a6d37cea742b1b1df48f807fe9a1da4f7` does not include `packages/web-components/fast-foundation/src` paths.
