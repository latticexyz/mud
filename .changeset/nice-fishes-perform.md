---
"@latticexyz/store": major
---

These breaking changes only affect store utilities, you aren't affected if you use `@latticexyz/cli` codegen scripts.

- Add `remappings` argument to the `tablegen` codegen function, so that it can read user-provided files.
- In `RenderTableOptions` change the type of `imports` from `RelativeImportDatum` to `ImportDatum`, to allow passing absolute imports to the table renderer.
- Add `solidityUserTypes` argument to several functions that need to resolve user or abi types: `resolveAbiOrUserType`, `importForAbiOrUserType`, `getUserTypeInfo`.
- Add `userTypes` config option to MUD config, which takes user types mapped to file paths from which to import them.
