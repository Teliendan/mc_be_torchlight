# Block materials

2026-10-21, target Bedrock1.26.52. Owner approved Group19 proposals ("Do all
three"). `torchlight_bp/block_materials.json` uses the corrected shared native
Torchflower profile: mining0, blast0, catch_chance_modifier30 and
destroy_chance_modifier100; any-tool collection. Existing vanilla flower loot
and support lifecycle remain. Format1.21.120 is retained; omitted newer
lava_flammable keeps the documented default of no adjacent-lava ignition.

Standard: `C:/mcmods/.claude/skills/bedrock-blocks/references/materials.md`.

The earlier nonflammable comparison was incorrect, not an approved exception.
The [Fire spread table](https://wiki.ronlab.site/content/minecraftwiki_en_all_maxi_2025-11/Fire#Flammable_blocks)
separates Bedrock one-block-flower ignite30 from burn100; the specific flower
infobox alone cannot establish both. Documented with November2025 archive age
and current specific-flower/changelog cross-check; not newly tested in game.
Positive/broken shared fixtures cover the profile. Flowing lava is independent
and still needs a native comparison. See [inspection/evidence](PARITY_INSPECTION.md).
