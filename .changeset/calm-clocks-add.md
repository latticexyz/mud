---
"@latticexyz/world": major
"@latticexyz/world-modules": major
---

Refactored `InstalledModules` to key modules by addresses instead of pre-defined names. Previously, modules could report arbitrary names, meaning misconfigured modules could be installed under a name intended for another module.
