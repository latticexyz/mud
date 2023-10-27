---
"@latticexyz/store": minor
---

Added an experimental `resolveConfig` helper to refine the output type of `mudConfig` and simplify downstream consumption.
Note that it's not recommended to use this helper externally yet, since the format is expected to change soon while we're refactoring the config parsing.
