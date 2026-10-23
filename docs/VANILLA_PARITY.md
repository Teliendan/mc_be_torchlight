# Torchflower vanilla parity

Target Bedrock 1.26.52 / Script API 2.8.0. History: see git (inspection narratives, deploy logs, seed-override probe).

## Design
- Vanilla `minecraft:torchflower` is hardcoded and cannot emit light, so the mature placed flower is swapped for
  `torchlight:torchflower` (light 14). Item, loot (one vanilla torchflower), dye, stew, compost and bee-feed routes stay vanilla by identity.
- The growing `minecraft:torchflower_crop` stays fully native (growth, bone meal, trampling). Mature vanilla flowers do not
  reproduce with bone meal, so no handler is added (see VERIFIER_WARNINGS.md).
- Player-planted crops are tracked by position (persisted) and re-checked every 100 ticks only while the list is non-empty.
  No world scanning. Setup sweep (once per world) and `/scriptevent torchlight:sweep` also enroll growing crops they find; one save at the end of the job.
- Soils: ten documented soils in both the block `placement_filter` and `support.js` SOILS (includes mycelium, muddy mangrove roots).
- Fire: catch 30 / destroy 100 (Bedrock one-block-flower row); no adjacent-lava ignition. Water pops it (WATER.md). Pistons and soil motion: SUPPORT_AND_PISTONS.md.

## Owner decisions
- 2026-10-21: restore the two missing soils, correct fire values, enroll sweep-found crops.
- 2026-10-23: farmer-planted torchflowers stay unlit until a sweep runs nearby (README line); no new code.
- 2026-10-23: rejected, a persistent farmland watcher (point checks on every farm to catch a rare cosmetic case; contradicts the no-polling goal).
- 2026-10-23: rejected, the `minecraft:torchflower_seeds` legacy override and a player-only custom crop swap (global override, new crop content, loses exact vanilla growth). Probe pack removed.

## Known limits
- Farmers can plant torchflower seeds only if a player gives or drops them; the mature flower then stays unlit until a sweep. Stable 2.8 has no crop-growth or villager-planting event.
- Crops in chunks that never reload stay in the tracked list and are retried every 5 s (one failed `getBlock` each); cheap, so not pruned.
- Bees: the custom placed block is not recognised for nectar or tree nests (bee override deferred). Normal potting uses the vanilla item and leaves a native, unlit pot.
- Fire spread and flowing-lava removal use documented values, not observed in game.

## In-game checks still worth doing
- Pale moss as soil: confirm vanilla placement before adding the ID.
- Crop to flower after reload; bone meal on mature flower does nothing.
- Fire and flowing lava next to a flower; water pop; two pistons in rapid succession.
- Pick-block on the placed flower returns the vanilla item.
