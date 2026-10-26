# Owner test results - 2026-10-25

Bedrock 1.26.52; source: workspace `temp/testing_feedback.md`.

| Check | Disposition |
| --- | --- |
| T1 crop reload and mature bone meal | Owner PASS |
| T2 water | Owner PASS: water pops the flower |
| T2 lava | Owner reports lava ignores the flower; no pack change in this task |
| T2 fire / rapid pistons | Not individually described; retain focused checks |
| T3 pick-block / soil | Owner PASS for the check; no explicit pale-moss comparison supplied |

Lava ignition and flowing-lava replacement are different. The existing flower
profile deliberately has no adjacent-lava ignition. `minecraft:liquid_detection`
only supports water, so changing that rule cannot fix flowing lava. The report
does not distinguish adjacent lava from lava actually reaching the flower cell.
Do not introduce a periodic scan or globally intercept lava placement to guess
at that distinction. Track the remaining native comparison in `TODO.md`.

Sources reviewed 2026-10-25: installed block definition, shared water/destruction
references, official 26.50-26.52 release notes (no relevant fix found), and
https://learn.microsoft.com/en-us/minecraft/creator/reference/content/blockreference/examples/blockcomponents/minecraftblock_liquid_detection

No new engine acceptance is claimed. Water/lava effects are recorded in wiki
limitations; gameplay files are unchanged.
