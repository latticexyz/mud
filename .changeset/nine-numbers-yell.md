---
"@latticexyz/abi-ts": patch
---

Added an `--extension` option to customize the resulting TS or DTS output. It defaults to the previous behavior of `.json.d.ts`, but can now be set to `.d.json.ts` for compatibility with newer TS versions and `.json.ts` or just `.ts` for a pure TS file.
