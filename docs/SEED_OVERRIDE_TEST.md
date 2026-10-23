# Vanilla seed override compatibility test

2026-10-22; target Bedrock1.26.52. Owner: "OK, lets try that."
Optional pack: **Torchlight — Seed Override Test** (`torchlight_seed_probe_bp`).
It depends on the normal Torchlight BP. It has no scripts, experiments or
additional custom item IDs. It is a test, not a finished crop implementation.

## What this tests

The installed vanilla seed definition is format1.10 with one seed component.
The optional pack copies that exact structure and changes only
`minecraft:seed.crop_result` from `torchflower_crop` to
`torchlight:torchflower`, the existing fully grown glowing flower.
The seed remains `minecraft:torchflower_seeds`.

For this test **a seed should place the grown glowing flower immediately**.
Using an already-working target isolates the seed override from unimplemented
custom crop art/growth/bone meal. No new growth timer or farmland watcher is
added. Normal core crop handling remains while this compatibility is unproven.

Official [item-overwrite guidance](https://learn.microsoft.com/en-us/minecraft/creator/documents/overwritingassets?view=minecraft-bedrock-stable#overwriting-items)
allows some data-driven vanilla items to be overridden and requires legacy1.10
items to retain format1.10 for implicit behavior. The local reference is
`reference/vanilla/current/behavior_packs/vanilla_1.20.0/items/torchflower_seeds.json`.
The [seed component reference](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/itemreference/examples/itemcomponents/minecraft_seed?view=minecraft-bedrock-stable)
documents crop_result. These sources justify a test, not a claim of native success.

## Game procedure

1. With the optional pack disabled, check normal player seed planting on a
   small clear farmland plot. It should initially make an immature crop. For
   a meaningful farmer comparison, also establish that the chosen **vanilla
   farmer villager** can pick up the seeds and plant them in the control setup.
   Give it accessible empty farmland, working conditions and seed capacity;
   allow mobGriefing. A farmer that does nothing in the control is inconclusive.
2. Leave the world. Enable the optional **Torchlight — Seed Override Test** BP
   alongside normal Torchlight, then re-enter. No world experiment is needed.
   If another add-on overrides these seeds, put this test above that override
   or isolate the pack stack for this comparison.
3. Use a fresh stack of ordinary torchflower seeds and plant one without bone
   meal. Check the **immediate** result: grown glowing flower or immature crop.
   Eventual light is inconclusive because the core's existing player-crop
   tracker can still convert a normally grown native flower later.
4. Give the previously working farmer ordinary torchflower seeds and inspect
   the first planted block on a fresh empty plot. Look for the same immediate
   grown-flower result. Vanilla farmers can plant these seeds but do not
   harvest torchflowers/crops, per [official1.20.10](https://www.minecraft.net/de-de/article/1-20-10-update-available-bedrock).
5. Check the normal seed icon/name, Survival stack consumption and remaining
   native seed uses (sniffer/chicken feeding, parrot taming, composting), since
   the legacy item has implicit behavior. Leave/re-enter and repeat one plant.
6. Leave, disable the optional test BP, and re-enter. Fresh seed planting should
   return to the normal immature crop. Existing grown test flowers remain
   flowers and drop the usual vanilla flower when broken.

Record version, active pack order, player result, farmer control/result, native
seed uses, reload result and Content Log errors. No engine result has yet been
recorded. Do not infer native pickup/planting from source tests.

| Result | Meaning / next action |
| --- | --- |
| Player and working farmer immediately place the glowing flower | Seed routing to this custom target works in that tested setup. Next build the real stageful custom crop with random-tick growth and rerun both paths. |
| Player redirects; working farmer plants the ordinary crop | Player override works but native farmer planting bypasses it. The farmer discovery problem remains. |
| Player still places an ordinary crop, or planting fails | Inspect Content Log and pack stack. This combination failed; it does not distinguish ignored override from rejected custom target. A later native-target control can narrow the cause. |
| Farmer never plants, including without test pack | Inconclusive farmer setup; do not call the redirect broken or working. |
| Native seed uses regress | Do not adopt the override as a production replacement, even if planting redirects. |

## Offline validation and lifecycle

The independent `seed-override` suite pins the complete tiny override, target
binding, data-only manifest and core dependency. It does not simulate Bedrock
override resolution or villager AI. Five feature runners pass; shared verifier
fixtures pass1584 assertions. Core verifies with its one existing mature-flower
bone-meal exception; optional pack verifies0 errors/0 warnings/0 exceptions.
The shared verifier recognizes only explicitly inspected legacy native item
definitions for omitted inherited name/icon/menu checks. Wrong formats, fake
native IDs, malformed seed targets and explicit invalid bindings still fail.

Keep this optional pack disabled outside the compatibility test. It changes
seed planting yield deliberately; no crop-growth equivalence is claimed.
After results, either remove the rejected probe or replace its target with a
properly reviewed custom crop. Main source baseline remains9372bde+dirty;
no mod commit or push was made. Deployment evidence follows below.

Deployed2026-10-22 with mods deploy torchlight. Core BP/RP already in sync;
optional BP copied15 files,0 removed. mods status confirms **all three packs
in sync** at9372bde+dirty. Deployment does not activate the optional BP inside
an existing world; enable it and re-enter to obtain native results.
Shared verifier/evidence commit: workspace `e40a35c`.
