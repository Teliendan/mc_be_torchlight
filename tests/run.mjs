import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const script = (name) => readFileSync(new URL(`../torchlight_bp/scripts/${name}`, import.meta.url), "utf8");
const dataUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const helperUrl = dataUrl(script("support_motion_service.js"));
const { createTorchflowerSupport, observePiston, FLOWER, SOILS } = await import(dataUrl(
    script("support.js").replace('"./support_motion_service.js"', JSON.stringify(helperUrl)),
));
const definition = JSON.parse(readFileSync(new URL("../torchlight_bp/blocks/torchflower.json", import.meta.url)))
    ["minecraft:block"].components;
const loot = JSON.parse(readFileSync(new URL("../torchlight_bp/loot_tables/blocks/torchflower.json", import.meta.url)));

function harness() {
    const cells = new Map(), tasks = [], drops = [];
    let tick = 0;
    const key = ({ x, y, z }) => `${x},${y},${z}`;
    const piston = { isMoving: false, getAttachedBlocksLocations: () => [{ x: 1, y: 0, z: 0 }] };
    const dimension = {
        id: "overworld",
        getBlock(position) {
            const typeId = cells.get(key(position));
            if (typeId === "unloaded") return undefined;
            return {
                typeId: typeId || "minecraft:air", location: { ...position }, dimension,
                permutation: { getState: () => 4 },
                getComponent: () => piston,
            };
        },
        runCommand(command) {
            const match = /^setblock (-?\d+) (-?\d+) (-?\d+) air destroy$/.exec(command);
            assert.ok(match, command);
            const [, x, y, z] = match.map(Number);
            const position = { x, y, z };
            assert.equal(cells.get(key(position)), FLOWER, "drop only a real flower");
            cells.delete(key(position));
            drops.push({ position, item: loot.pools[0].entries[0].name });
        },
    };
    const system = {
        get currentTick() { return tick; },
        runTimeout(callback, delay) { tasks.push({ at: tick + delay, callback }); },
    };
    const support = createTorchflowerSupport(system);
    const put = (position, type) => cells.set(key(position), type);
    const flower = { x: 1, y: 1, z: 0 }, soil = { x: 1, y: 0, z: 0 };
    put(soil, "minecraft:dirt"); put(flower, FLOWER);
    const observe = (position = flower, reset = false) => support.observe(dimension.getBlock(position), { reset });
    const event = () => observePiston(support, {
        dimension, block: dimension.getBlock({ x: 0, y: 0, z: 0 }), piston, isExpanding: true,
    });
    const advance = (ticks = 45) => {
        const until = tick + ticks;
        while (tasks.length) {
            tasks.sort((a, b) => a.at - b.at);
            if (tasks[0].at > until) break;
            const next = tasks.shift(); tick = next.at; next.callback();
        }
        tick = until;
    };
    return { support, dimension, drops, put, flower, soil, observe, event, advance };
}

const tests = [];
function test(name, run) { tests.push({ name, run }); }

test("native own pop, floor filter and vanilla loot match the adapter", () => {
    assert.equal(definition["minecraft:movable"].movement_type, "popped");
    assert.deepEqual(definition["minecraft:placement_filter"].conditions[0].allowed_faces, ["up"]);
    assert.deepEqual(new Set(definition["minecraft:placement_filter"].conditions[0].block_filter), SOILS);
    assert.equal(definition["minecraft:tick"].looping, true);
    assert.ok(definition["torchlight:support"]);
    assert.equal(loot.pools.length, 1); assert.equal(loot.pools[0].rolls, 1);
    assert.equal(loot.pools[0].entries.length, 1);
    assert.equal(loot.pools[0].entries[0].name, "minecraft:torchflower");
});
test("original soil departure breaks once despite a valid replacement", () => {
    const h = harness(); h.observe();
    h.put(h.soil, "minecraft:moving_block"); h.event();
    h.put(h.soil, "minecraft:grass_block"); h.advance();
    assert.equal(h.drops.length, 1); assert.equal(h.drops[0].item, "minecraft:torchflower");
});
test("tick before piston event preserves original support history", () => {
    const h = harness(); h.observe();
    h.put(h.soil, "minecraft:grass_block"); h.observe(); h.event(); h.advance();
    assert.equal(h.drops.length, 1);
});
test("nearby stationary valid flower survives the moving soil", () => {
    const h = harness(), guard = { x: 1, y: 1, z: 1 };
    h.put({ x: 1, y: 0, z: 1 }, "minecraft:dirt"); h.put(guard, FLOWER);
    h.observe(); h.observe(guard);
    h.put(h.soil, "minecraft:moving_block"); h.event();
    h.put(h.soil, "minecraft:dirt"); h.advance();
    assert.equal(h.drops.length, 1); assert.equal(h.dimension.getBlock(guard).typeId, FLOWER);
});
test("overlapping piston jobs cannot duplicate loot", () => {
    const h = harness(); h.observe();
    h.put(h.soil, "minecraft:moving_block"); h.event(); h.event();
    h.put(h.soil, "minecraft:dirt"); h.advance(); assert.equal(h.drops.length, 1);
});
test("native popping and new placement invalidate old piston jobs", () => {
    const h = harness(); h.observe();
    h.put(h.soil, "minecraft:moving_block"); h.event();
    h.put(h.flower, "minecraft:air"); h.support.invalidate(h.dimension, h.flower);
    h.put(h.soil, "minecraft:dirt"); h.put(h.flower, FLOWER); h.observe(h.flower, true);
    h.advance(); assert.equal(h.drops.length, 0);
    assert.equal(h.dimension.getBlock(h.flower).typeId, FLOWER);
});
test("ordinary support edits do not leak old history into later pistons", () => {
    const h = harness(); h.observe();
    h.put(h.soil, "minecraft:grass_block"); h.support.resetAround(h.dimension, h.soil);
    h.event(); h.advance(); assert.equal(h.drops.length, 0);
});
test("periodic loaded-flower recovery checks actual soil eligibility", () => {
    const h = harness(); h.put(h.soil, "minecraft:stone"); h.observe();
    assert.equal(h.drops.length, 1);
});
test("unloaded or moving support remains unknown until recovery", () => {
    const h = harness(); h.put(h.soil, "unloaded"); h.observe(); h.advance();
    assert.equal(h.drops.length, 0);
    h.put(h.soil, "minecraft:moving_block"); h.observe(); h.advance();
    assert.equal(h.drops.length, 0);
    h.put(h.soil, "minecraft:dirt"); h.observe(); h.advance();
    assert.equal(h.drops.length, 0); assert.equal(h.support.size(), 1);
});

for (const { name, run } of tests) { run(); console.log(`PASS ${name}`); }
console.log(`${tests.length} Torchlight support regressions passed.`);
