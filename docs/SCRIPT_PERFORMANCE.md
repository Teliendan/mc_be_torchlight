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

2026-10-21 Group19: the existing finite setup/manual sweep now enrolls native
growing crops in batches of at most32 discovered positions per persistence
merge. Each merge reads current registry state so yielded jobs preserve player
registrations and timer removals. No added world/entity polling, new scan volume
or faster crop timer. The same persisted100-tick checker handles known crops
and stops when empty. New unseen farmer plantings require a new manual sweep;
setup remains once per world. State-change custom-component events do not
provide hooks on the hardcoded vanilla crop in pinned stable2.8.

Offline production-main tests cover manual/migration enrollment, repeat-sweep
deduplication, maturity, unrelated crop exclusion and concurrent batched merge.
The test runner is now thin with independent crops/soils/support/layout suites.
Actual native farmer planting and game performance remain acceptance checks.
