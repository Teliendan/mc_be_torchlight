# Vanilla interaction ledger

2026-10-23 reconciliation; target Bedrock **1.26.52** / Script API **2.8.0**.
Owner-approved Group19 source fixes implemented; **no new engine tests**.

Group19 is inspected. [Detailed proposals and interaction outcomes](PARITY_INSPECTION.md)
cover corrected soils/fire and finite-sweep enrollment of non-player growing
crops, approved by the owner ("Do all three"). New unseen farmer plantings still
need a sweep; no recurring world scan. Bees stay deferred; potting/picked-item identity and
environmental/signal checks are not claimed verified.

The optional seed override is deployed for the owner-authorized compatibility
test; its player/farmer results remain pending. It places the existing grown
flower immediately. Core's native growing-crop route and its finite-sweep
limitation remain separate. No custom growing crop has been implemented.
See the [final coverage reconciliation](../../../docs/vanilla-interactions-final-2026-10-23.md).

Follow the [shared interaction workflow](../../../.claude/skills/bedrock-modding/references/22-vanilla-interactions.md)
and [source/coverage report](../../../docs/vanilla-interactions-audit-2026-10-18.md).
The source report supplies canonical/archived Wiki URLs, inspected sections and
access/version limits. November 2025 archived pages are discovery evidence, not
proof of current engine behavior.

Every identifier below inherits the shared common prompts and its family row.
Linked block items, entity placers, projectiles and variants must be tested as
one feature. Existing notes establish only the interactions they actually
describe. **OPEN** means discovery/intent/implementation or game behavior remains
unresolved; no family below claims a completed all-interactions parity sweep.
For closure, expand the family row into individual interaction outcomes using
the shared row format and record test version/date.

## Family findings and decisions

| Group | Counterparts / existing evidence | Disposition and remaining interactions |
| --- | --- | --- |
| Flower replacement | Torchflower/Flower Wiki; `WATER.md`, `BLOCK_MATERIALS.md`, `SUPPORT_AND_PISTONS.md`, `VERIFIER_WARNINGS.md`, scripts/main.js | **Intentional:** custom mature flower emits14; native growing crop and mature no-action bone meal retained. Instant collection, water/piston/support rules and ten documented soils implemented. Native catch30/burn100 corrected. Setup/manual sweep enroll growing native crops; future unseen farmer plantings need a sweep. **OPEN:** pale moss target-version eligibility, deferred placed-block bee/tree recognition, pot/pick identity and lava/weather/light/spawn/observer/sculk acceptance. See expanded inspection rows. |
| Reused vanilla item | `minecraft:torchflower` is the held/dropped item; core BP authors no explicit flower item JSON | Vanilla item recipe/dye/stew/compost and bee feeding routes are retained in principle by identity; test that conversion preserves those paths and never consumes or replaces the wrong item/crop. This does **not** establish custom placed-block pollination or tree-nest recognition. |
| Seed override compatibility test | Optional legacy `minecraft:torchflower_seeds` item override; [SEED_OVERRIDE_TEST.md](SEED_OVERRIDE_TEST.md) | Owner-authorized native routing test only. Places existing grown flower immediately; player/farmer controls, consumption, reload and native seed consumers remain pending. No custom growing crop, polling or accepted production crop parity. |

**Corrected fire mismatch:** block/profile now use the documented Bedrock
catch30/burn100; no adjacent-lava ignition added. The earlier fireproof setting
was not an approved exception. Native fire and flowing-lava acceptance remain
separate from the explicit water rule.
Generic flower tags are intentionally absent (`TAGS.md`); adding a guessed tag
is not a fix for hardcoded bee recognition. The exact existing bone-meal
verifier exception remains limited to the mature plant.

## Exact authored inventory

### Blocks (1)

| Identifier | Review group | Source |
| --- | --- | --- |
| `torchlight:torchflower` | Flower replacement | [torchlight_bp](../torchlight_bp/blocks/torchflower.json) |

### Items (1 optional vanilla override)

| Identifier | Review group | Source |
| --- | --- | --- |
| `minecraft:torchflower_seeds` | Seed override compatibility test | [torchlight_seed_probe_bp](../torchlight_seed_probe_bp/items/torchflower_seeds.json) |

`torchlight_seed_probe_bp/items/torchflower_seeds.json` optionally overrides
`minecraft:torchflower_seeds` in its native1.10 format, changing only crop_result
to the existing grown glowing flower. Core BP still authors no items. This is
an owner-authorized compatibility test, not accepted production seed/crop
parity. [Procedure and result matrix](SEED_OVERRIDE_TEST.md) require player and
farmer controls plus native seed consumers. No new custom crop or polling added.

### Entities (0)

No explicit entities definitions. Reused vanilla/automatic block items still require applicable review.

