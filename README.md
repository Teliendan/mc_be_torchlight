# Glowing Torchflower

A Minecraft Bedrock Edition Add-On that makes the torchflower emit light (level 14, torch-like),
as if its bloom were an actual flame.

Built and tested against game version **1.21.124**.

## Why this exists

Vanilla blocks in Bedrock are hardcoded — you cannot add a `minecraft:light_emission` component
to `minecraft:torchflower` directly ("Vanilla blocks are hardcoded. You may not override or access
them." — [Bedrock Wiki](https://wiki.bedrock.dev/blocks/blocks-intro)).

The workaround: a visually identical **custom block** (`torchlight:torchflower`) that does emit
light, reusing the real vanilla texture and a matching cross model. A script swaps the vanilla
block for the glowing one the moment it appears, then gets out of the way — light propagation
after that is handled entirely by the engine, at zero ongoing script cost.

The **item** stays 100% vanilla. Dye, suspicious stew, sniffer drops, and trading are untouched;
only the *placed block* changes, and breaking it drops a normal `minecraft:torchflower` item.

## How it works

| Torchflower source | Handling |
|---|---|
| Player places the flower item | `playerPlaceBlock` event → instant swap |
| Player-planted crop matures | The crop's position is remembered on placement; a 5s timer re-checks only that handful of tracked positions until it matures |
| Already in the world / world-gen, first load | One-time automatic migration on first player spawn (sweeps a volume around them once, then never again) |
| Torchflowers far from where the migration ran | Manual `/scriptevent torchlight:sweep` run near them |

No continuous world scanning happens at any point — see `torchlight_bp/scripts/main.js` for the
full design rationale in comments.

## Install

Copy both pack folders into your `com.mojang` folders (or package as `.mcaddon` — see below),
then enable **Glowing Torchflower BP** for a world (it pulls in the RP automatically).

```
com.mojang/development_behavior_packs/torchlight_bp/
com.mojang/development_resource_packs/torchlight_rp/
```

### Packaging for distribution

```powershell
# from the repo root
Compress-Archive -Path torchlight_bp\*  -DestinationPath torchlight_bp.mcpack
Compress-Archive -Path torchlight_rp\*  -DestinationPath torchlight_rp.mcpack
```
Or zip both folders together and rename to `.mcaddon` to install BP+RP in one double-click.

## Development workflow

This repo lives in the mods workspace (`mods/torchlight/`); Minecraft loads packs from
`com.mojang/development_*`. From the workspace root:

1. Edit files here.
2. `.\mods deploy torchlight` verifies and copies both packs into the game's development
   folders (or keep `.\mods watch` running to redeploy on every save).
3. In Minecraft, leave and re-enter the world to reload.
4. Commit here once it works (the post-commit hook redeploys).

## Structure

```
torchlight_bp/
  manifest.json
  pack_icon.png
  blocks/torchflower.json        # the glowing custom block (light_emission: 14)
  loot_tables/blocks/torchflower.json
  scripts/main.js                 # swap logic, migration, /scriptevent handler

torchlight_rp/
  manifest.json
  pack_icon.png
  blocks.json                     # block sound
  models/blocks/torchflower.geo.json   # cross model
  textures/terrain_texture.json   # maps textures/blocks/torchflower
  textures/blocks/torchflower.png # copy of the vanilla 16x16 sprite
  texts/en_US.lang
```

The RP bundles `textures/blocks/torchflower.png`, a copy of the vanilla 16x16 sprite made by
`tools/make_torchflower_texture.py` (added after the add-on verifier flagged the atlas entry
as having no PNG behind it). A pack-local copy does not follow a player's texture pack; delete
it to fall back to resolving the vanilla path through the resource pack stack.

## Known limitations

- The glowing block has a different identifier than `minecraft:torchflower`, so it will not fit in
  a flower pot (vanilla flower pots only accept a fixed vanilla block list).
- Migration on first load only sweeps a volume around the spawning player; distant bases need a
  manual `/scriptevent torchlight:sweep` run nearby.
