# Group19 Torchlight inspection

2026-10-21; target **Bedrock1.26.52 / stable server2.8.0**; baseline9372bde.
Owner approved all three proposals ("Do all three"). Source work below is
implemented; native acceptance remains open. Experimental features are excluded. Preserve light14,
native growing crop/item, mature bone-meal behavior, water popping, accepted
support/pistons and the no-continuous-world-scans design.

## Approved changes and investigation result

1. **Restore missing soils.** The block placement filter and script SOILS both
   omit `minecraft:mycelium` and `minecraft:muddy_mangrove_roots`, although the
   specific Torchflower counterpart lists them. A substitute importing the
   production support module confirms immediate destruction on observation on
   either substrate. Both lists are now updated, with independent10-soil
   production-service tests and invalid-soil controls. The Flower family also lists
   `minecraft:pale_moss_block`, absent from the specific Torchflower list:
   confirm vanilla placement on the target version before adding that third ID.
2. **Correct the fire comparison.** The native block and shared profile now
   use catch_chance_modifier30/destroy_chance_modifier100, from the Bedrock
   one-block-flower row in the Fire table. Positive and deliberately broken
   shared fixtures cover the corrected profile. The old fireproof setting was
   not an approved exception. Format1.21.120 remains; omitted newer lava field
   retains the documented default of no adjacent-lava ignition. Flowing-lava
   removal remains independent and untested. No native fire observations added.
3. **Investigate farmer-grown crop discovery.** Official1.20.10 allows farmers
   to pick up/plant the seeds without harvesting the mature flower/crop.
   The earlier player-only registry missed growing native crops in sweeps.
   Existing finite setup/manual sweeps now enroll them, regardless of planter,
   in batches32 merged against current state. Their known positions then use
   the existing persisted100-tick maturity checker. Sweeping before maturity
   now works; a localized count confirms discovery. Crop-only discovery does
   not falsely report an empty sweep. No new scan volume or recurring search.
   Pinned stable2.8/current changelogs expose no generic farmer-plant/growth
   callback. A custom block-state component cannot attach to this hardcoded
   vanilla crop; entity item pickup does not identify the later planting cell.
   New unseen farmer plantings therefore still require a sweep. This is the
   bounded supported route, not universal automatic discovery or broken native
   farmer planting. No villager override or experimental callback was added.

## Expanded interaction outcomes

All native outcomes remain game acceptance unless an earlier linked ledger
explicitly records owner observations. Source completion is not engine parity.

| IDs / states | Interaction + counterpart section | Required outcome | Disposition | Implementation / decision evidence | Verification / next test |
| --- | --- | --- | --- | --- | --- |
| `torchlight:torchflower` | Torchflower Usage: soils | Preserve vanilla floor eligibility | **Implemented for ten documented soils** | JSON and script lists include mycelium/muddy roots | Independent native-filter/service checks pass; pale moss requires target check |
| Custom flower | Breaking: hand/tool, support, piston | Instant collection; single vanilla item; pop on original support departure | **Implemented/native; accepted support design** | Mining0, blast0, loot, movable:popped, support service; owner2026-10-09 | Eleven support regressions pass; rapid motion, exact drops and gamerules pending |
| Custom flower | Breaking: incoming water | Pop without waterlogging | **Implemented/native** | Explicit water rule; owner policy | Flow/bucket/drop and reload pending; no water polling |
| Custom flower | Infobox fire / Breaking lava | Distinguish fire consumption, adjacent-lava ignition and flowing lava | **Implemented documented fire values; native acceptance open** | catch30/destroy100; omitted lava field retains no ignition; water-only liquid component | Compare fire and flowing lava with gamerules; no invented lava rule |
| `minecraft:torchflower_crop`, growing states | Seeds Crop: planting/growth/bone meal/trampling | Keep native crop mechanics | **Implemented/native** | Only mature vanilla flower is swapped | Native light/growth/pollen/bone-meal and immature/mature yields pending |
| Player-planted crop -> flower | Crop maturity/reload | Native growth followed by light14 | **Implemented; retained conversion delay** | Persisted position;100-tick check; unloaded retention; idle timer stops | Crop lifecycle runner passes; up-to5s loaded check delay retained |
| Farmer/pre-existing/command/structure crop | Seeds Crop: other planting paths | Discover maturity without continuous scans | **Implemented finite-sweep enrollment; automatic unseen discovery unsupported** | Existing setup/sweep registers growing crops; same persisted checker | Manual/migration/concurrent-merge tests pass; native farmer acceptance pending; new unseen plantings need sweep |
| `minecraft:torchflower` held/dropped | Crafting/stew/compost/bee food | Retain native item consumers | **Implemented by identity** | Vanilla loot; no item override; installed dye/stew recipes and bee feeding/tempt lists | Recipe unlock/count, mooshroom, compost, bee care, inventory/hoppers/death/drop hazards pending |
| Vanilla item -> native flower pot with plant data | Torchflower/Flower Pot Usage | Keep ordinary pot insertion/removal | **Native route retained by source; game check open** | No item-use cancellation; exact makeGlowing ID cannot match flower_pot | Insert/remove/break/pick/reload; native pot has no added light |
| Automatic custom block item | Creative pick-block/commands/reuse | Preserve expected item consumers | **Open: native item check** | No item override; category:none does not prove a pick-block redirect | Inspect picked ID, then recipe/pot/bee behavior; loot identity is separate |
| Custom flower | Bees: nectar collection | Equivalent native recognition | **Owner-deferred bees** | Installed1.26.30 bee target_blocks lists vanilla ID, not custom ID; earlier custom-flower spike failed | Retain Group7 deferral; no guessed tags, bee override or artificial nectar |
| Custom flower near sapling | Bee nests | Preserve native flower-dependent tree nest route | **Open native recognition within deferred bee work** | Official1.21.60 confirms vanilla torchflower qualification; no custom eligibility route established | Item identity and pollination do not prove tree recognition; no new worldgen |
| Custom flower | Light/collision/sound/art/environment | Light14 and transparent pass-through flower | **Intentional light difference; implemented components** | dampening0/collision:false; authored geometry/selection; grass RP sound matches vanilla1.20.0 | Falling sand, navigation/spawn/light, offset/mirroring, weather/snow/particles remain native comparisons |
| Native -> custom replacement | Signals/context/persistence | Avoid unintended signals, loss or wrong-block conversion | **Open native acceptance** | Exact current-ID checks, setPermutation; no custom signal producer/consumer | Observer/sculk placement/maturity, Survival/Creative/Adventure, multiplayer and unload ordering |
| Flower/crop | Trade/fuel/endermen/edition exceptions | Apply only relevant counterpart routes | **No new routes proposed; enderman edition check open** | Specific Torchflower page labels enderman collection Java-only; current family wording less specific | Do not import generic flower trades/Java tags or claim target-game exclusion proved |

## Potting correction

The README's old pot limitation was too broad: normal play holds/drops the
vanilla item, whose native pot route is untouched. A separately obtained custom
item lacks flower_pottable. Stable custom pot support exists since1.21.120, so
a fixed vanilla-only list is also an outdated platform explanation. A marker
alone would not redirect the normal vanilla item, light the native pot or prove
custom-item removal/pick behavior. No pot marker, pot replacement or item
override is proposed without evidence of a broken normal route or a separate
potted-light decision. Corrected documentation only.

## Evidence and sources

Reviewed every authored definition, main/support service, loot, RP geometry and
sound, plus both regression files. Installed references: vanilla1.20.10 dye,
vanilla1.26.50 stew and vanilla1.26.30 bee feed/tempt/nectar lists. Absence of a
hardcoded native block's JSON does not establish missing native behavior.

- Canonical [Torchflower](https://minecraft.wiki/w/Torchflower),
  [Flower](https://minecraft.wiki/w/Flower),
  [Torchflower Seeds](https://minecraft.wiki/w/Torchflower_Seeds),
  [Flower Pot](https://minecraft.wiki/w/Flower_Pot), retrieved2026-10-21.
  Specific flower/seed direct access denied; current indexed specific/family
  text was available, without revision IDs. Full section sweep used the
  **November2025** archived [Torchflower](https://wiki.ronlab.site/content/minecraftwiki_en_all_maxi_2025-11/Torchflower),
  [Flower](https://wiki.ronlab.site/content/minecraftwiki_en_all_maxi_2025-11/Flower)
  and [Seeds](https://wiki.ronlab.site/content/minecraftwiki_en_all_maxi_2025-11/Torchflower_Seeds):
  infobox, obtaining/breaking, usage/soils, recipes/stew, bees/nests/compost,
  states, sounds, history and edition notes. Archive age remains a limit.
- Official [1.20.10](https://www.minecraft.net/de-de/article/1-20-10-update-available-bedrock)
  confirms farmer planting, without harvesting. Official
  [1.21.60](https://www.minecraft.net/en-us/article/minecraft-1-21-60-bedrock-changelog)
  confirms nearby-tree nests and flower cross-rendering fixes.
- Official [1.21.120](https://feedback.minecraft.net/hc/en-us/articles/40566672351885-Minecraft-1-21-120-Bedrock)
  stabilizes pot features; [26.20](https://www.minecraft.net/en-us/article/minecraft--bedrock-edition-26-20-changelog)
  reports height/pick/replacement/validation fixes. No old pot offset workaround.
- Checked target/recent [26.50](https://www.minecraft.net/en-us/article/minecraft--bedrock-edition-26-50-changelog),
  [26.51](https://feedback.minecraft.net/hc/en-us/articles/48915928859789-Minecraft-Bedrock-Edition-26-51-Hotfix-Changelog),
  [26.52](https://feedback.minecraft.net/hc/en-us/articles/49175370527501-Minecraft-Bedrock-Edition-26-52-Hotfix-Changelog):
  no relevant soil/fire/discovery reversal or custom flower-recognition feature
  found. Sapling nonflammability in26.50 is not a flower fix.
- Stable contracts: [flower_pottable](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_flower_pottable?view=minecraft-bedrock-stable),
  [liquid_detection](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_liquid_detection?view=minecraft-bedrock-stable),
  [flammable](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_flammable?view=minecraft-bedrock-stable),
  [automatic block item](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/blockreference/examples/customizingitemforablock?view=minecraft-bedrock-stable).
  The item tutorial's old experiment labels are historical; no current
  experimental limitation is inferred from them. Local2.8 declares
  canBeDestroyedByLiquidSpread for future game inspection; no result invented.

Implementation research2026-10-21: the [Fire spread table](https://wiki.ronlab.site/content/minecraftwiki_en_all_maxi_2025-11/Fire#Flammable_blocks)
separates Bedrock ignite30/burn100/no-lava-ignition (November2025 snapshot).
Current indexed specific-flower text and26.50–52 changelogs did not contradict
it. Creator flammable contracts map the two fields and default. Pinned2.8,
[WorldAfterEvents](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/worldafterevents?view=minecraft-bedrock-stable)
and [API changelog](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/changelog?view=minecraft-bedrock-stable)
were checked for discovery hooks; newer beta neighbor callbacks are excluded.

## Validation

`mods verify torchlight`: localization passed; **0 errors /0 warnings /1 exact
documented mature bone-meal exception**. Both runners pass: crop lifecycle and
11 support cases. Four independent named runners now include soil and suite
layout checks. Production crop tests cover finite sweep/migration enrollment,
deduplication, unrelated crops and concurrent registration/maturity during
batched discovery. Shared verifier fixture suite passes1562 assertions,
including positive/broken fire profiles. These do not simulate native fire,
fluids or villager AI. Inspection scratch is retired in favor of maintained
regressions. No mod commit or push. Deployment status is recorded below.

## Deployment and continuing-discovery follow-up

Deployed2026-10-21 through mods deploy torchlight:3 BP files and11 RP locale
files copied,0 removed. Both packs confirmed **in sync** at9372bde+dirty.
Leave/re-enter to reload; no worldgen change.
Shared fire profile, evidence and fixture commit: workspace `0d0f1a7`.

Owner then correctly questioned that future farmer plantings are still missed.
The deployed sweep enrollment is a partial improvement, **not a complete
automatic farmer-discovery fix**. Do not close that outcome or call unregistered
future planting supported. Pinned stable2.8 has no generic crop-growth/villager-
planting event. BlockComponentBlockStateChangeEvent belongs to custom block
components; the vanilla crop cannot receive that hook through this pack.
Deprecated random_ticking is not a modern global callback.

Candidate solution: persist known **farmland cells**, keeping a watch through
empty/other-crop/mature-flower states until the soil ceases to be farmland.
One finite sweep discovers old farm beds; successful player tilling could
discover new ones via PlayerInteractWithBlockAfterEvent. Subsequent farmer
plantings on those plots would become detectable without another volume sweep.
The stable event exposes the interacted block and beforeItemStack (including
a last-use hoe); actual tilling/event ordering still needs game acceptance.
Use bounded loaded-position checks and persisted state. Tradeoff: even empty
registered farmland needs ongoing point checks. This persistent-farm design is
**not implemented/deployed**; no performance or native-event result is claimed.

Sources checked2026-10-21: pinned2.8, current official
[block-state event](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/blockcomponentblockstatechangeevent?view=minecraft-bedrock-stable),
[successful interaction event](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/playerinteractwithblockafterevent?view=minecraft-bedrock-stable),
[custom crop tutorial](https://learn.microsoft.com/ja-jp/minecraft/creator/documents/scripting/components-tutorial?view=minecraft-bedrock-stable)
and [deprecated random_ticking](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_random_ticking?view=minecraft-bedrock-stable).

### Owner alternative, 2026-10-22

Owner dislikes ongoing checker work and proposes a custom planted crop.
Player path can keep the vanilla seed and use existing playerPlaceBlock to
replace the newly planted crop with a custom stage0 block. Its engine-dispatched
onRandomTick handler would implement growth and change directly into the
existing glowing flower at maturity. No separate maturity checker is required
for that crop. This design needs equivalent growth/light/hydration/crowding,
bone-meal, immature/mature drops, support and trampling; native recognition is
not inherited. No custom crop or seed override is implemented/deployed yet.

Owner asked whether farmers plant it: **vanilla farmer villagers do** per
official1.20.10 (seed pickup/planting, no crop harvesting). Their planting does
not fire the player event. Custom elves/helper NPCs are a separate issue.

Research found a second candidate that may cover both planting paths: the local
vanilla seed is data-driven format1.10 with minecraft:seed.crop_result naming
torchflower_crop. Official seed docs describe this target; official asset
overwriting docs allow data-driven item overrides, with a strict same1.10
format requirement for these legacy items. A minimal target-only override is
documented as a possible route, not tested for player/farmer planting or native
seed consumers. Target/recent26.50/26.52 notes show no relevant routing change.
Do not claim a new custom seed item is necessary or that the override is proven.

Sources and confidence: [shared crop research](../../../.claude/skills/bedrock-block-families/references/flora-crop-interactions.md#torchflower-seed-routing-and-custom-growth-alternative),
[seed component](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_seed?view=minecraft-bedrock-stable),
[overwriting items](https://learn.microsoft.com/en-us/minecraft/creator/documents/overwritingassets?view=minecraft-bedrock-stable).

### Authorized seed override test, 2026-10-22

Owner: "OK, lets try that." Implemented the smallest isolated compatibility
test in optional torchlight_seed_probe_bp: exact legacy vanilla seed definition,
only crop_result redirected to existing torchlight:torchflower. A seed should
place the grown glowing flower immediately. This establishes a clear target
test before building an unproven custom growth replacement. No core pack
behavior, checker, script dependency or experiment changed. Optional pack labels
are localized; separate UUIDs and core BP dependency supplied.

Native override/farmer behavior remains unverified. Enabling the optional pack
and planting is required to obtain a result. Do not claim all future farmer
plantings are fixed. [Test procedure, controls and outcomes](SEED_OVERRIDE_TEST.md).
Deployed15 optional BP files,0 removed; core BP/RP already in sync. All three
packs confirmed in sync at9372bde+dirty. Five mod runners and1584 shared verifier
assertions pass. Core:0 errors/0 warnings/1 existing exception; optional:
0 errors/0 warnings/0 exceptions. User must enable optional BP in the world.
