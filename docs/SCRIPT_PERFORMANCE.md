# Script performance

2026-10-11, Bedrock 1.26.52 / server 2.8.0. Offline lifecycle evidence only.

The five-second crop checker starts when a crop is tracked, or at worldLoad when
persisted crops exist. It stops when the pending list becomes empty. Unloaded
positions remain pending; maturity swaps and persistence semantics are unchanged.
No world-volume scan was added. Manual sweep and one-time migration are unchanged.

tests/crop_lifecycle.mjs exercises production main.js under an engine substitute:
empty startup, deferred world access, duplicate placement, unloaded retention,
maturity, removal, restart and persisted reload. It runs via tests/run.mjs.
Workspace docs/script-performance-progress.md records full verification/deploy
status. The saved idle callback was small; this is housekeeping, not a claimed
main cause of lag.

Implementation commit: `Reduce support polling and idle crop checks`.
