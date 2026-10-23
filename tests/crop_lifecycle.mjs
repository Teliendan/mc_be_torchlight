import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

let serial = 0;
async function harness(initial = []) {
    const callbacks = new Map(), timers = new Map(), cells = new Map(), props = new Map(), jobs = [];
    props.set("torchlight:pending_crops", JSON.stringify(initial));
    let ready = false, writes = 0, nextTimer = 0;
    const events = new Proxy({}, { get: (_, name) => ({ subscribe(fn) {
        if (!callbacks.has(name)) callbacks.set(name, []);
        callbacks.get(name).push(fn);
    } }) });
    const fire = (name, event = {}) => { for (const fn of callbacks.get(name) || []) fn(event); };
    const key = p => `${p.x},${p.y},${p.z}`;
    const dimension = { id: "overworld", getBlock: p => cells.get(key(p)) };
    const world = { afterEvents: events, getDimension: () => dimension,
        getDynamicProperty(name) { assert.ok(ready,"world reads deferred until worldLoad"); return props.get(name); },
        setDynamicProperty(name,value) { writes++; props.set(name,value); } };
    const system = { beforeEvents: { startup: { subscribe() {} } }, afterEvents: events,
        runJob(generator) { jobs.push(generator); },
        runInterval(fn,ticks) { const id=++nextTimer; timers.set(id,{fn,ticks}); return id; },
        clearRun: id => timers.delete(id) };
    globalThis.__cropLifecycle = { world, system, message: (...args) => args, observePiston() {},
        createTorchflowerSupport: () => ({ observe() {}, resetAround() {}, invalidate() {} }),
        BlockPermutation: { resolve: typeId => ({ typeId }) } };
    const source = readFileSync(new URL("../torchlight_bp/scripts/main.js", import.meta.url), "utf8")
        .replace(/^import \{([^}]+)\} from "[^"]+";/gm,"const {$1} = globalThis.__cropLifecycle;");
    await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}#${serial++}`);
    delete globalThis.__cropLifecycle;
    assert.equal(timers.size,0,"no pre-world interval");
    ready=true; fire("worldLoad");
    const put = (x,typeId) => {
        const block={location:{x,y:0,z:0},typeId,dimension,setPermutation(p) { this.typeId=p.typeId; }};
        cells.set(key(block.location),block); return block;
    };
    const messages = [];
    const player = {dimension, location:{x:0,y:0,z:0},sendMessage(m){messages.push(m);}};
    return { timers, fire, put, props, cells, jobs, messages, player, get writes() { return writes; },
        sweep() { fire("scriptEventReceive",{id:"torchlight:sweep",sourceEntity:player}); },
        stepJob() { if(jobs[0]?.next().done) jobs.shift(); },
        finishJob() { let steps=0; while(jobs.length) { assert.ok(++steps < 500000); this.stepJob(); } },
        check() { for (const {fn,ticks} of [...timers.values()]) { assert.equal(ticks,100); fn(); } } };
}

{
    const h=await harness();
    assert.equal(h.timers.size,0,"empty world has no crop checker");
    const crop=h.put(0,"minecraft:torchflower_crop");
    h.fire("playerPlaceBlock",{block:crop}); h.fire("playerPlaceBlock",{block:crop});
    assert.equal(h.timers.size,1); assert.equal(h.writes,1,"duplicate crop is not persisted twice");
    const writes=h.writes;
    h.check(); assert.equal(h.writes,writes,"unchanged growing crop causes no property write");
    h.cells.clear(); h.check();
    assert.equal(h.timers.size,1,"unloaded crop remains pending");
    const mature=h.put(0,"minecraft:torchflower"); h.check();
    assert.equal(mature.typeId,"torchlight:torchflower"); assert.equal(h.timers.size,0);
    h.fire("playerPlaceBlock",{block:h.put(1,"minecraft:torchflower_crop")});
    assert.equal(h.timers.size,1,"later placement restarts checker");
    h.put(1,"minecraft:air"); h.check(); assert.equal(h.timers.size,0,"destroyed last crop stops checker");
}
{
    const h=await harness([{x:7,y:0,z:0,d:"overworld"}]);
    assert.equal(h.timers.size,1,"persisted crops restart checker at worldLoad");
    h.check(); assert.equal(h.timers.size,1);
    h.put(7,"minecraft:torchflower"); h.check(); assert.equal(h.timers.size,0);
    assert.deepEqual(JSON.parse(h.props.get("torchlight:pending_crops")),[]);
}
console.log("PASS production crop timer: idle, deduplication, maturity, unloaded retention and restart");

{
    const h=await harness();
    const crop=h.put(0,"minecraft:torchflower_crop");
    h.put(1,"minecraft:wheat");
    h.sweep(); h.finishJob();
    assert.equal(h.timers.size,1,"manual sweep enrolls native growing crops without a player placement");
    assert.deepEqual(JSON.parse(h.props.get("torchlight:pending_crops")),[{x:0,y:0,z:0,d:"overworld"}]);
    assert.ok(h.messages.some(m=>m[0]==="crops.tracked" && m[1]===1));
    assert.ok(!h.messages.some(m=>m[0]==="sweep.empty"),"finding crops must not report an empty sweep");
    const writes=h.writes;
    h.sweep(); h.finishJob(); assert.equal(h.writes,writes,"repeat sweep deduplicates growing crops");
    crop.typeId="minecraft:torchflower"; h.check();
    assert.equal(crop.typeId,"torchlight:torchflower"); assert.equal(h.timers.size,0);
    assert.equal(h.cells.get("1,0,0").typeId,"minecraft:wheat","other crops remain native and untracked");
}
{
    const h=await harness(); h.put(0,"minecraft:torchflower_crop");
    h.fire("playerSpawn",{initialSpawn:true,player:h.player}); h.finishJob();
    assert.equal(h.props.get("torchlight:migrated_v1"),true);
    assert.equal(h.timers.size,1,"one-time migration enrolls immature pre-existing crops");
    h.fire("playerSpawn",{initialSpawn:true,player:h.player}); assert.equal(h.jobs.length,0);
    h.put(0,"minecraft:torchflower"); h.check(); assert.equal(h.timers.size,0);
}
{
    const h=await harness();
    for(let x=-32;x<=2;x++) h.put(x,"minecraft:torchflower_crop");
    h.sweep();
    let steps=0;
    while(h.writes===0) { assert.ok(++steps<150000); h.stepJob(); }
    assert.equal(JSON.parse(h.props.get("torchlight:pending_crops")).length,32,"first discovery flush is bounded to32");
    const playerCrop=h.put(100,"minecraft:torchflower_crop");
    h.fire("playerPlaceBlock",{block:playerCrop});
    const earlyMature=h.put(-32,"minecraft:torchflower"); h.check();
    assert.equal(earlyMature.typeId,"torchlight:torchflower");
    h.finishJob();
    const list=JSON.parse(h.props.get("torchlight:pending_crops"));
    assert.equal(list.length,35);
    assert.ok(list.some(c=>c.x===100),"yielded sweep preserves concurrent player registration");
    assert.ok(!list.some(c=>c.x===-32),"final flush does not resurrect a crop already converted by timer");
    assert.equal(h.writes,4,"two sweep batches plus concurrent player registration and maturity");
    assert.equal(h.jobs.length,0,"discovery job finishes; no recurring world scan");
}
console.log("PASS native crop discovery: manual/migration enrollment, deduplication, maturity and concurrent batched merge");
