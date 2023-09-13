---
"@latticexyz/cli": major
"@latticexyz/protocol-parser": minor
"@latticexyz/store": major
"@latticexyz/world": major
---

- Add `FieldLayout`, which is a `bytes32` user-type similar to `Schema`.

  Both `FieldLayout` and `Schema` have the same kind of data in the first 4 bytes.

  - 2 bytes for total length of all static fields
  - 1 byte for number of static size fields
  - 1 byte for number of dynamic size fields

  But whereas `Schema` has `SchemaType` enum in each of the other 28 bytes, `FieldLayout` has static byte lengths in each of the other 28 bytes.

- Replace `Schema valueSchema` with `FieldLayout fieldLayout` in Store and World contracts.

  `FieldLayout` is more gas-efficient because it already has lengths, and `Schema` has types which need to be converted to lengths.

- Add `getFieldLayout` to `IStore` interface.

  There is no `FieldLayout` for keys, only for values, because key byte lengths aren't usually relevant on-chain. You can still use `getKeySchema` if you need key types.

- Add `fieldLayoutToHex` utility to `protocol-parser` package.

- Add `constants.sol` for constants shared between `FieldLayout`, `Schema` and `PackedCounter`.
