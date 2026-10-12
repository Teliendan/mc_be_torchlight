# Documented verifier exception

2026-10-13, target Bedrock 1.26.52. **0 errors, 0 warnings, 1 documented exception**.
[Exact record](../torchlight_bp/verification_exceptions.json) covers only the mature
torchlight:torchflower, not arbitrary future plants.

Owner requested vanilla bone-meal behavior. Mature vanilla torchflowers do not
reproduce with bone meal; growing minecraft:torchflower_crop still advances one
stage per application. The [official Bedrock 1.20.0.23 changelog](https://feedback.minecraft.net/hc/en-us/articles/15421902578701-Minecraft-Beta-Preview-1-20-0-23)
explicitly records both. The owner-requested Minecraft Wiki Torchflower page
agrees (direct access failed; [2025-11 mirror](https://wiki.ronlab.site/content/minecraftwiki_en_all_maxi_2025-11/Torchflower),
retrieved 2026-10-13). Checked 26.50 and 26.52 changelogs: no subsequent
torchflower change found. Vanilla local packs do not expose this hardcoded rule.

scripts/main.js preserves the native growing crop and replaces only mature
flowers. Existing no-action behavior already matches mature vanilla, so no
custom bone-meal handler is added. Crop growth still uses the engine.
The generic verifier plant heuristic cannot infer this counterpart decision;
it now counts as a documented exception. Adding another plant invalidates the
record's exact plant set. No errors or unrelated warnings are excused.

Evidence is changelog/wiki plus source review; live 1.26.52 bone-meal parity
has not been newly tested. Earlier CONTENT-LOG counts remain historical.
Implementation commit: `Document vanilla torchflower bone-meal parity and verifier exception`.
