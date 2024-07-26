---
"@latticexyz/store": patch
---

Refactored tablegen in preparation for multiple namespaces and addressed a few edge cases:

- User types configured with a relative `filePath` are now resolved relative to the project root (where the `mud.config.ts` lives) rather than the current working directory.
- User types inside libraries now need to be referenced with their fully-qualified code path (e.g. `LibraryName.UserTypeName`).
