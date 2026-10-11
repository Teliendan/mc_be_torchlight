# Torchflower support and pistons

Owner accepted the feature on 2026-10-09. Implementation commit:
`Implement torchflower piston support survival`.
Target: Bedrock 1.26.52 / stable Script API 2.8.0.

Flowers pop when pushed by a piston or when their original soil moves, even
if another valid soil replaces it. Native floor support accepts grass, dirt,
coarse dirt, podzol, rooted dirt (`dirt_with_roots`), moss, mud and farmland.
Native destruction drops one vanilla torchflower. Placement and conversions
warm support records immediately; sparse random ticks recover loaded flowers
without world scans. Player edits reset local history; unavailable chunks and
moving blocks remain unknown. The shared observer is
`scripts/support_motion_service.js`, maintained with Lothlorien's matching
script; `scripts/support.js` supplies the flower's support and loot rules.

Eleven offline regressions cover flower configuration, valid replacement,
pre-event tick ordering, an unrelated nearby flower, duplicate piston jobs,
native own popping, ordinary edit history and reload recovery. Run
`node mods/torchlight/tests/run.mjs` from the workspace, or
`.\mods verify torchlight` to include the shared verifier.

The underlying revision-8 probe passed 18/18 in the owner's game. This flower's
production integration and loot are checked offline; separate in-game results
for rapid/concurrent pistons and chunk reloads have not been recorded.

Performance correction, 2026-10-11 (1.26.52 / API 2.8.0): removed the flower's
looping [2,2] timer and support `onTick`. Piston events discover cold flowers
even with moving soil; edit/explosion events discover immediate neighbours.
Native `onRandomTick` is an eventual safety fallback for commands, reloads and
timeouts, with no fixed deadline and no recovery at randomTickSpeed 0. The
separate five-second pending-crop maturation timer remains. Cold discovery and
cold soil edits pass offline regressions; specific engine cases remain pending.

Owner follow-up, 2026-10-11: the piston-support correction alone removed the
reported game lag. This is qualitative confirmation for the deployed combined
setup, not an independent Torchlight benchmark or verification of every flower
loot/motion case. Do not attribute it to the later crop timer change. Avoid
permanent fast support polling per block; use native survival, bounded local
event work and the cheapest correct fallback. The reusable guidance is in
workspace docs/bedrock-script-performance.md.
