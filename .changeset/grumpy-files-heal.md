---
"@latticexyz/cli": major
"@latticexyz/protocol-parser": minor
"@latticexyz/store": major
"@latticexyz/world": major
---

- Add `FieldLayout`, which is similar to `Schema`, but with static byte lengths instead of `SchemaType`s
- Replace `Schema valueSchema` with `FieldLayout fieldLayout` in Store and World contracts
- Add `getFieldLayout` to `IStore` interface
- Add `fieldLayoutToHex` utility to `protocol-parser` package
