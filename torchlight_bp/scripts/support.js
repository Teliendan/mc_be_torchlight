import { createSupportMotionService } from "./support_motion_service.js";

export const FLOWER = "torchlight:torchflower";
export const SOILS = new Set([
    "minecraft:grass_block", "minecraft:dirt", "minecraft:coarse_dirt",
    "minecraft:podzol", "minecraft:dirt_with_roots", "minecraft:moss_block",
    "minecraft:mud", "minecraft:farmland",
]);

// Head directions measured by the revision-8 probe on Bedrock 1.26.52.
const AXES = [
    { x: 0, y: -1, z: 0 }, { x: 0, y: 1, z: 0 },
    { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: -1 },
    { x: 1, y: 0, z: 0 }, { x: -1, y: 0, z: 0 },
];

export function createTorchflowerSupport(system) {
    return createSupportMotionService({
        now: () => system.currentTick,
        schedule: (callback, ticks) => system.runTimeout(callback, ticks),
        read(dimension, position) {
            try { return dimension.getBlock(position); } catch { return undefined; }
        },
        describe(block) {
            if (block.typeId !== FLOWER) return undefined;
            return {
                identity: FLOWER,
                supports: [{
                    position: { ...block.location, y: block.location.y - 1 },
                    valid: (support) => SOILS.has(support.typeId),
                }],
            };
        },
        remove(block) {
            const { x, y, z } = block.location;
            // Native destruction uses the block's existing vanilla-flower loot.
            block.dimension.runCommand(`setblock ${x} ${y} ${z} air destroy`);
        },
    });
}

export function observePiston(support, event) {
    const facing = event.block.permutation.getState("facing_direction");
    support.onPiston({
        dimension: event.dimension,
        position: event.block.location,
        axis: AXES[facing],
        isExpanding: event.isExpanding,
        piston: event.piston,
    });
}
