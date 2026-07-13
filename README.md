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

This repo is the source of truth; `com.mojang/development_*` is where Minecraft actually loads
packs from. To iterate:

1. Edit files here.
2. Copy the changed pack(s) into the matching `development_behavior_packs` /
   `development_resource_packs` folder under `com.mojang`.
3. In Minecraft, leave and re-enter the world to reload.
4. Commit here once it works.

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
  textures/terrain_texture.json   # maps to the VANILLA torchflower texture (not bundled)
  texts/en_US.lang
```

Note the RP does not bundle a torchflower texture — `terrain_texture.json` points at the vanilla
path (`textures/blocks/torchflower`), which resolves through the resource pack stack to Mojang's
own texture, so it automatically follows whatever texture pack the player has active.

## Known limitations

- The glowing block has a different identifier than `minecraft:torchflower`, so it will not fit in
  a flower pot (vanilla flower pots only accept a fixed vanilla block list).
- Migration on first load only sweeps a volume around the spawning player; distant bases need a
  manual `/scriptevent torchlight:sweep` run nearby.
