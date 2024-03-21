---
"@latticexyz/store": patch
"@latticexyz/world": patch
---

Minor fixes to config input validations:

- `systems.openAccess` incorrectly expected `true` as the only valid input. It now allows `boolean`.
- The config complained if parts of it were defined `as const` outside the config input. This is now possible.
- Shorthand inputs are now enabled.
