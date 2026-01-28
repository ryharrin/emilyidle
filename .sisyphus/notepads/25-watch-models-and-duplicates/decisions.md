# Decisions

## 2026-01-28

- Watch model id = catalog entry id: keeps roster stable and avoids introducing a separate id namespace while the roster is still 1:1.
- Duplicate reward curve uses exponential decay `0.7 ^ copyIndex` with a hard floor at `0.10`: hits the target second-copy value (~0.70x) and stays monotonic once floored.
