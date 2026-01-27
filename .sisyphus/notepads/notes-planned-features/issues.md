# Issues (notes-planned-features)

Append-only. Record issues encountered while executing `.sisyphus/plans/notes-planned-features.md`.

## 2026-01-27T02:59:55Z Task: orchestration tooling

- `delegate_task()` prompt send failed with `JSON Parse error: Unexpected EOF` when batching multiple very large prompts in one tool call. Mitigation: keep delegation prompts smaller; avoid huge embedded boilerplate.
- Background task ids returned from `delegate_task(run_in_background=true)` were not retrievable via `background_output` ("Task not found"). Did not block plan execution because in-repo verification covered requirements.
