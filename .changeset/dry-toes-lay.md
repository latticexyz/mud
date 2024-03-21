---
"@latticexyz/store": patch
"@latticexyz/world": patch
---

Minor fixes to validations of the new config:
- `systems.openAccess` incorrectly expected `true` as the only valid input. It now allows `boolean`.
- `enums` complained if a the enums object was defined `as const` outside the input. This is now possible.
