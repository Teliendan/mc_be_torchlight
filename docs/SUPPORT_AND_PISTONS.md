# Torchflower support and pistons

Owner accepted the feature on 2026-10-09. Implementation commit:
`Implement torchflower piston support survival`.
Target: Bedrock 1.26.52 / stable Script API 2.8.0.

Flowers pop when pushed by a piston or when their original soil moves, even
if another valid soil replaces it. Native floor support accepts grass, dirt,
coarse dirt, podzol, rooted dirt (`dirt_with_roots`), moss, mud and farmland.
Native destruction drops one vanilla torchflower. Placement and conversions
warm support records immediately; scheduled block ticks recover loaded flowers
without world scans. Player edits reset local history; unavailable chunks and
moving blocks remain unknown. The shared observer is
`scripts/support_motion_service.js`, maintained with Lothlorien's matching
script; `scripts/support.js` supplies the flower's support and loot rules.

Nine offline regressions cover flower configuration, valid replacement,
pre-event tick ordering, an unrelated nearby flower, duplicate piston jobs,
native own popping, ordinary edit history and reload recovery. Run
`node mods/torchlight/tests/run.mjs` from the workspace, or
`.\mods verify torchlight` to include the shared verifier.

The underlying revision-8 probe passed 18/18 in the owner's game. This flower's
production integration and loot are checked offline; separate in-game results
for rapid/concurrent pistons and chunk reloads have not been recorded.
