---
"@latticexyz/world": patch
"@latticexyz/world-modules": patch
---

Refactored `InstalledModules` to key modules by addresses instead of pre-defined names. Previously, modules could report arbitrary names and be installed under a name intended for another module.
