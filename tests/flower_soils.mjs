import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root = new URL('../torchlight_bp/', import.meta.url);
const read = p => readFileSync(new URL(p,root),'utf8');
const dataUrl = s => `data:text/javascript;base64,${Buffer.from(s).toString('base64')}`;
const {createTorchflowerSupport} = await import(dataUrl(read('scripts/support.js').replace(
  '"./support_motion_service.js"',JSON.stringify(dataUrl(read('scripts/support_motion_service.js'))))));
const filter = JSON.parse(read('blocks/torchflower.json'))['minecraft:block'].components['minecraft:placement_filter'];
const expected = ['grass_block','dirt','coarse_dirt','podzol','dirt_with_roots','moss_block',
  'mud','farmland','mycelium','muddy_mangrove_roots'].map(id=>`minecraft:${id}`);
assert.deepEqual(new Set(filter.conditions[0].block_filter),new Set(expected));
for(const typeId of [...expected,'minecraft:stone','minecraft:sand']) {
  let removals=0;
  const soil={typeId};
  const dimension={id:'overworld',getBlock(p){return p.y===0?soil:flower;},runCommand(){removals++;}};
  const flower={typeId:'torchlight:torchflower',dimension,location:{x:0,y:1,z:0}};
  const service=createTorchflowerSupport({currentTick:0,runTimeout(){}});
  service.observe(flower,{reset:true});
  assert.equal(removals,expected.includes(typeId)?0:1,`support result for ${typeId}`);
}
console.log('PASS independently specified10 vanilla soils survive; stone/sand reject in production support service');
