import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
const json = relative => JSON.parse(readFileSync(new URL(relative,import.meta.url),'utf8'));
const override=json('../torchlight_seed_probe_bp/items/torchflower_seeds.json');
// Independently pin the tiny installed vanilla definition. This is an override
// contract test, not evidence that Bedrock or a farmer honors the target.
assert.deepEqual(override,{
  format_version:'1.10',
  'minecraft:item':{
    description:{identifier:'minecraft:torchflower_seeds'},
    components:{'minecraft:seed':{crop_result:'torchlight:torchflower'}}
  }
});
assert.deepEqual(readdirSync(new URL('../torchlight_seed_probe_bp/items/',import.meta.url)),['torchflower_seeds.json']);
const core=json('../torchlight_bp/manifest.json');
const probe=json('../torchlight_seed_probe_bp/manifest.json');
assert.deepEqual(probe.dependencies,[{uuid:core.header.uuid,version:core.header.version}]);
assert.deepEqual(probe.modules.map(m=>m.type),['data'],'no script, timer or experimental dependency');
assert.equal(json('../torchlight_bp/blocks/torchflower.json')['minecraft:block'].description.identifier,
  override['minecraft:item'].components['minecraft:seed'].crop_result);
assert.ok(!probe.capabilities,'no experimental manifest capability');
console.log('PASS isolated legacy seed override: exact native identity/format, one target change and core dependency');
