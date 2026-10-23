import { message } from "./messages.js";
import { world, system, BlockPermutation } from "@minecraft/server";
import { createTorchflowerSupport, observePiston } from "./support.js";

// ---------------------------------------------------------------------------
// Glowing Torchflower
//
// Vanilla blocks are hardcoded and cannot be given a light_emission component,
// so we swap `minecraft:torchflower` for a visually identical custom block
// `torchlight:torchflower` that emits light 14.
//
// Design goal: NO continuous world scanning. We only ever look at positions we
// already know contain something interesting:
//   1. Flower placed by a player      -> playerPlaceBlock event (free)
//   2. Crop planted by a player       -> remember that ONE position, re-check it
//                                        on a slow timer until it matures
//   3. Other flowers/growing crops   -> existing migration or manual sweep;
//                                      discovered crops join the same registry
// ---------------------------------------------------------------------------

const VANILLA_FLOWER = "minecraft:torchflower";
const VANILLA_CROP   = "minecraft:torchflower_crop";
const GLOWING_FLOWER = "torchlight:torchflower";
const flowerSupport = createTorchflowerSupport(system);

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent("torchlight:support", {
        onPlace({ block }) { flowerSupport.observe(block, { reset: true }); },
        onRandomTick({ block }) { flowerSupport.observe(block); },
        onBreak({ block }) { flowerSupport.invalidate(block.dimension, block.location); },
    });
});
world.afterEvents.pistonActivate.subscribe((event) => observePiston(flowerSupport, event));

const CROPS_PROP     = "torchlight:pending_crops";  // persisted across reloads
const MIGRATED_PROP  = "torchlight:migrated_v1";    // one-time first-run migration flag
const CROP_CHECK_INTERVAL = 100;                    // ticks (5s)
let cropTimer;

function syncCropTimer(list) {
    if (list.length && cropTimer === undefined) cropTimer = system.runInterval(checkPendingCrops, CROP_CHECK_INTERVAL);
    else if (!list.length && cropTimer !== undefined) { system.clearRun(cropTimer); cropTimer = undefined; }
}

// Manual sweep (/scriptevent torchlight:sweep)
const SWEEP_RADIUS   = 32;
const SWEEP_HEIGHT   = 16;

// First-run migration: wider than a manual sweep, since it only happens once per world.
// 97 x 49 x 97 ~= 460k blocks, walked incrementally by system.runJob over several
// seconds in the background. The player can keep playing while it runs.
const MIGRATE_RADIUS = 48;
const MIGRATE_HEIGHT = 24;

let sweepRunning = false;

// --- pending-crop bookkeeping ----------------------------------------------

/** @returns {Array<{x:number,y:number,z:number,d:string}>} */
function loadPendingCrops() {
    const raw = world.getDynamicProperty(CROPS_PROP);
    if (typeof raw !== "string") return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function savePendingCrops(list) {
    world.setDynamicProperty(CROPS_PROP, JSON.stringify(list));
}

function trackCrop(loc, dimensionId) {
    trackCrops([loc], dimensionId);
}

/** Adds positions not yet tracked; returns how many were new. */
function trackCrops(positions, dimensionId) {
    if (!positions.length) return 0;
    // A sweep yields between blocks. Merge against current persisted state so
    // player placements and the crop checker cannot be overwritten by a stale
    // snapshot taken when the job began.
    const list = loadPendingCrops();
    const keys = new Set(list.map((c) => `${c.d}|${c.x},${c.y},${c.z}`));
    let added = 0;
    for (const loc of positions) {
        const key = `${dimensionId}|${loc.x},${loc.y},${loc.z}`;
        if (keys.has(key)) continue;
        keys.add(key);
        list.push({ x: loc.x, y: loc.y, z: loc.z, d: dimensionId });
        added++;
    }
    if (added) savePendingCrops(list);
    syncCropTimer(list);
    return added;
}

// --- the swap ---------------------------------------------------------------

function makeGlowing(block) {
    block.setPermutation(BlockPermutation.resolve(GLOWING_FLOWER));
    flowerSupport.observe(block, { reset: true });
}

// 1) Player places a torchflower -> swap immediately.
world.afterEvents.playerPlaceBlock.subscribe((e) => {
    const block = e.block;
    flowerSupport.resetAround(block.dimension, block.location);
    if (block.typeId === VANILLA_FLOWER) {
        makeGlowing(block);
    } else if (block.typeId === VANILLA_CROP) {
        // Remember it so we can catch the moment it matures into a flower.
        trackCrop(block.location, block.dimension.id);
    }
});

// 2) Slow timer: re-check ONLY the handful of tracked crop positions.
//    This is not a world scan — it is a few getBlock calls every 5 seconds.
function checkPendingCrops() {
    const list = loadPendingCrops();
    if (list.length === 0) { syncCropTimer(list); return; }

    const keep = [];
    let changed = false;

    for (const c of list) {
        let block;
        try {
            block = world.getDimension(c.d).getBlock({ x: c.x, y: c.y, z: c.z });
        } catch {
            block = undefined;
        }

        if (!block) {
            keep.push(c);       // chunk unloaded - check again later
            continue;
        }

        if (block.typeId === VANILLA_FLOWER) {
            makeGlowing(block); // matured!
            changed = true;
        } else if (block.typeId === VANILLA_CROP) {
            keep.push(c);       // still growing
        } else {
            changed = true;     // crop was destroyed/replaced - stop tracking
        }
    }

    if (changed) savePendingCrops(keep);
    syncCropTimer(keep);
}

// 3) Explicit player edits establish a new relationship at neighbouring flowers.
//    Native survival and the support service own removal and loot.
world.afterEvents.playerBreakBlock.subscribe((e) => {
    flowerSupport.invalidate(e.dimension, e.block.location);
    flowerSupport.resetAround(e.dimension, e.block.location);
});
world.afterEvents.blockExplode.subscribe((e) => {
    flowerSupport.invalidate(e.dimension, e.block.location);
    flowerSupport.resetAround(e.dimension, e.block.location);
});

// 4) Existing finite sweep also discovers growing crops, regardless of planter.
//    Uses system.runJob and yields between reads so the engine can spread the
//    finite volume walk across ticks.
function sweepAround(player, radius, height, label) {
    if (sweepRunning) {
        player.sendMessage(message("sweep.busy"));
        return;
    }
    sweepRunning = true;

    const dim = player.dimension;
    const o = player.location;
    const ox = Math.floor(o.x), oy = Math.floor(o.y), oz = Math.floor(o.z);

    let converted = 0;
    let growing = 0;
    const discoveredCrops = [];

    system.runJob(function* () {
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dz = -radius; dz <= radius; dz++) {
                for (let dy = -height; dy <= height; dy++) {
                    let block;
                    try {
                        block = dim.getBlock({ x: ox + dx, y: oy + dy, z: oz + dz });
                    } catch {
                        block = undefined;
                    }
                    if (block?.typeId === VANILLA_FLOWER) {
                        makeGlowing(block);
                        converted++;
                    } else if (block?.typeId === VANILLA_CROP) {
                        growing++;
                        discoveredCrops.push({ ...block.location });
                    }
                    yield; // hand control back to the game each block
                }
            }
        }
        const newlyTracked = trackCrops(discoveredCrops, dim.id);
        sweepRunning = false;
        if (converted > 0) player.sendMessage(message(`${label}.complete`, converted));
        else if (growing === 0) player.sendMessage(message(`${label}.empty`));
        if (newlyTracked > 0) player.sendMessage(message("crops.tracked", newlyTracked));
    }());
}

// Manual sweep, for bases far from where the migration ran.
system.afterEvents.scriptEventReceive.subscribe((e) => {
    if (e.id !== "torchlight:sweep") return;
    const player = e.sourceEntity;
    if (!player) return;
    player.sendMessage(message("sweep.start"));
    sweepAround(player, SWEEP_RADIUS, SWEEP_HEIGHT, "sweep");
}, { namespaces: ["torchlight"] });

// 5) First-run migration: convert torchflowers that already existed in the world
//    before the mod was installed. Runs ONCE per world, then never again.
world.afterEvents.playerSpawn.subscribe((e) => {
    if (!e.initialSpawn) return;
    if (world.getDynamicProperty(MIGRATED_PROP) === true) return;

    if (sweepRunning) return;
    e.player.sendMessage(message("setup.start"));
    sweepAround(e.player, MIGRATE_RADIUS, MIGRATE_HEIGHT, "setup");
    // Mark setup only after its message and background job have started.
    world.setDynamicProperty(MIGRATED_PROP, true);
});

world.afterEvents.worldLoad.subscribe(() => {
    syncCropTimer(loadPendingCrops());
    console.log("[Torchlight] Glowing Torchflower active (light 14).");
});
