# Water decision

2026-10-09, Bedrock 1.26.52 / API 2.8.0. Owner decision: flowers pop.

`torchlight:torchflower` explicitly uses water `popped`, with no waterlogging,
matching its vanilla flower role. Native loot remains `minecraft:torchflower`.
Support loss and piston popping are independent of this water rule.

Shared verifier enforces an explicit complete rule. Existing support regressions
check native loot and guard against double removal after another destruction path.
Actual water flow, flower drops and reloading remain pending in game. No water-polling
script was added.
