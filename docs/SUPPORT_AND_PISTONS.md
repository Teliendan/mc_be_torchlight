# Torchflower support and pistons

Owner accepted the feature on 2026-10-09. Implementation commit:
`Implement torchflower piston support survival`.
Target: Bedrock 1.26.52 / stable Script API 2.8.0.

Flowers pop when pushed by a piston or when their original soil moves, even
if another valid soil replaces it. Native floor support accepts grass, dirt,
coarse dirt, podzol, rooted dirt (`dirt_with_roots`), moss, mud, farmland,
mycelium and muddy mangrove roots (the last two corrected2026-10-21).
Native destruction drops one vanilla torchflower. Placement and conversions
warm support records immediately; sparse random ticks recover loaded flowers
without world scans. Player edits reset local history; unavailable chunks and
moving blocks remain unknown. The shared observer is
`scripts/support_motion_service.js`, maintained with Lothlorien's matching
script; `scripts/support.js` supplies the flower's support and loot rules.

Offline regressions cover flower configuration, valid replacement, pre-event tick ordering, an unrelated nearby
flower, duplicate piston jobs, native popping, edit history and reload recovery, plus a ten-soil check that rejects
stone/sand. Run `.\mods verify torchlight` (includes `tests/run.mjs`). Pale moss is a target-version placement
question; no guessed extra substrate was added.

Design rule (owner, 2026-10-11): no looping per-block timers. Piston events discover cold flowers, edit/explosion
events discover immediate neighbours, and native `onRandomTick` is an eventual fallback for commands, reloads and
timeouts (no recovery at randomTickSpeed 0). Removing the old [2,2] timer removed the reported game lag.

Not yet checked in game: rapid/concurrent pistons and chunk reloads. Reusable guidance: workspace
docs/bedrock-script-performance.md.
