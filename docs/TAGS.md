# torchlight: tag/family audit

2026-10-13; target Bedrock 1.26.52 / Script API 2.8.0. Source revision `fece0e6`.

Status: source inventory and official-documentation review; proposals have not been applied. No new engine tests. Pack files were left unchanged. A reasoned omission is a valid audit result.

Scope: 1 block definitions, 0 entity definitions, across every `*_bp` pack in this mod. Relevant explicit item tags were cross-checked for the block/item distinction.

## Recommendations and effects

Keep tags omitted on `torchlight:torchflower`: it is an instant-break, script-managed flower replacement, with no preferred tool. A generic flower label would not enable bee pollination, potting or composting. Its held vanilla-item lifecycle is separate from the placed block.

## Complete block inventory

Tags below are declared in root components. `omitted` and `[]` both mean no declared tags; they are retained by design unless a proposal above says otherwise. The material profile records the existing mining/harvest policy; a tag is not a harvest gate.

| Block | Declared tags | Profile / decision |
| --- | --- | --- |
| [torchlight:torchflower](../torchlight_bp/blocks/torchflower.json) | omitted | `torchflower`; retain |

Inspected all block permutations: 0 tag-component overrides. Other components still vary by state; no all-state engine behavior is claimed.

## Complete entity inventory

| Entity | Base families | Group overrides / decision |
| --- | --- | --- |
| None | - | No custom entities |

## Related explicit item tags

These are item-component tags, not block tags. This is a cross-check, not a request to classify every inventory item.

| Item | Tags |
| --- | --- |
| None declared | Omission alone is not an error |

## Evidence and follow-up

- Resolved mature-flower bone-meal policy and documented exception: [verifier warnings](VERIFIER_WARNINGS.md).
- Shared decision rules and primary sources: [tags and families](../../../.claude/skills/bedrock-modding/references/14-tags.md).
- Cross-mod findings and verification status: [workspace audit](../../../docs/tag-audit-2026-10-13.md).
- Existing runtime quest/hostility/debug tags are separate from these families. No new runtime tags or cleanup mechanisms are proposed.
- If accepted, update any responsible generator, run `mods verify <mod>`, deploy and confirm `in sync`, then record relevant engine observations here.
