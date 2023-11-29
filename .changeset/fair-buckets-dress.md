---
"@latticexyz/store-sync": minor
---

Added an optional `tables` option to `syncToRecs` to allow you to sync from tables that may not be expressed by your MUD config. This will be useful for namespaced tables used by [ERC20](https://github.com/latticexyz/mud/pull/1789) and [ERC721](https://github.com/latticexyz/mud/pull/1844) token modules until the MUD config gains [namespace support](https://github.com/latticexyz/mud/issues/994).

Here's how we use this in our example project with the `KeysWithValue` module:

```ts
syncToRecs({
  ...
  tables: {
    KeysWithValue: {
      namespace: "keywval",
      name: "Inventory",
      tableId: resourceToHex({ type: "table", namespace: "keywval", name: "Inventory" }),
      keySchema: {
        valueHash: { type: "bytes32" },
      },
      valueSchema: {
        keysWithValue: { type: "bytes32[]" },
      },
    },
  },
  ...
});
```
