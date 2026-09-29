"""Build torchlight_rp's block texture from the vanilla torchflower sprite.

The pack's geometry (geometry.torchflower) is the standard crossed-plane flower:
two 16x16 quads at +/-45 degrees, both mapped uv [0,0] on a 16x16 texture. So the
texture has to be exactly the 16x16 vanilla sprite -- no upscaling, no generated
art, or the plant renders blurred or misaligned.

The vanilla sprite is NOT in resource_packs/vanilla/: textures added after ~1.19
live in the versioned update pack that introduced them (torchflower arrived with
1.20.0 and is re-shipped in 1.21.90). This script searches all of them and takes
the newest copy.

Run:  python mods/torchlight/tools/make_torchflower_texture.py [--force]
"""

import argparse
import os
MOD = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # this mod's repo root
import re
import shutil
import sys

VANILLA_ROOT = r"C:\mcmods\reference\vanilla\current\resource_packs"
REL = os.path.join("textures", "blocks", "torchflower.png")
DEST = os.path.join(MOD, "torchlight_rp", REL)


def pack_sort_key(name):
    m = re.match(r"^vanilla_(\d+)\.(\d+)\.(\d+)$", name)
    return tuple(int(g) for g in m.groups()) if m else (0, 0, 0)


def newest_vanilla_copy():
    if not os.path.isdir(VANILLA_ROOT):
        sys.exit("vanilla reference not found at {} -- run "
                 r"C:\mcmods\tools\refresh_vanilla_ref.ps1".format(VANILLA_ROOT))
    found = []
    for pack in os.listdir(VANILLA_ROOT):
        candidate = os.path.join(VANILLA_ROOT, pack, REL)
        if os.path.exists(candidate):
            found.append((pack_sort_key(pack), pack, candidate))
    if not found:
        sys.exit("no vanilla torchflower.png found under " + VANILLA_ROOT)
    found.sort()
    return found[-1][1], found[-1][2]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true",
                    help="overwrite the destination if it already exists")
    args = ap.parse_args()

    pack, src = newest_vanilla_copy()

    try:
        from PIL import Image
        with Image.open(src) as im:
            if im.size != (16, 16):
                sys.exit("source sprite is {}x{}, expected 16x16".format(*im.size))
            if im.mode != "RGBA":
                sys.exit("source sprite is {}, expected RGBA (the crossed planes "
                         "need transparency)".format(im.mode))
    except ImportError:
        print("Pillow not installed -- copying without verifying the sprite")

    if os.path.exists(DEST) and not args.force:
        sys.exit("{} already exists; pass --force to replace it".format(DEST))

    os.makedirs(os.path.dirname(DEST), exist_ok=True)
    shutil.copyfile(src, DEST)
    print("{}  ->  {}".format(os.path.join(pack, REL), DEST))


if __name__ == "__main__":
    main()
