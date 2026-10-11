# Content log

2026-10-04, target game 1.26.52: the startup message "Glowing Torchflower active
(light 14)" used `console.warn`, so successful startup appeared as a scripting
warning. Changed it to `console.log`. This was an informational message, not a
script failure. Shared verifier: 0 errors, 0 warnings. Deployed and confirmed
both packs report `in sync`; in-game confirmation pending.

2026-10-04, target 1.26.52 / API 2.8.0: owner's game rejected the no-argument
`setup.start` message because the helper included an empty RawMessage `with`
container. Omit `with` when there are no arguments. Setup now marks its migration
flag after the notification and sweep job start, preventing that error from
silently skipping setup on later loads. Worlds already affected retain the old
flag: `/scriptevent torchlight:sweep` converts nearby existing flowers (radius 32,
vertical range +/-16); repeat at other locations if needed. Message regressions
passed across all nine locales; shared verifier reports 0 errors and 0 warnings.
Deployed and confirmed both packs in sync; corrected payload needs game confirmation.

Implementation commit: `Fix startup logging and setup message payloads`.
