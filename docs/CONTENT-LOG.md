# Content log

Lessons only; history is in git.

- Startup message uses `console.log`, not `console.warn` (a warn shows as a scripting warning).
- A RawMessage with an empty `with` container is rejected by the game: omit `with` when there are no arguments.
- Setup sets its migration flag only after the notification and sweep job start, so a failed message cannot skip setup.
  Worlds that already lost setup recover with `/scriptevent torchlight:sweep` (radius 32, vertical +/-16).
