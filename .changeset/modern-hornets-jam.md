---
"@latticexyz/cli": major
"@latticexyz/store": major
"@latticexyz/world": major
"@latticexyz/store-sync": major
"create-mud": patch
---

- BREAKING: `Store`'s internal schema table is now a normal table instead of using special code paths. It is renamed to Tables, and the table ID changed from `mudstore:schema` to `mudstore:Tables`
- BREAKING: `Store`'s `registerSchema` and `setMetadata` are combined into a single `registerTable` method. This means metadata (key names, field names) is immutable and indexers can create tables with this metadata when a new table is registered on-chain.

  ```diff
  -  function registerSchema(bytes32 table, Schema schema, Schema keySchema) external;
  -
  -  function setMetadata(bytes32 table, string calldata tableName, string[] calldata fieldNames) external;

  +  function registerTable(
  +    bytes32 table,
  +    Schema keySchema,
  +    Schema valueSchema,
  +    string[] calldata keyNames,
  +    string[] calldata fieldNames
  +  ) external;
  ```

- BREAKING: `World`'s `registerTable` method is updated to match the `Store` interface, `setMetadata` is removed
- BREAKING: The `getSchema` method is renamed to `getValueSchema` on all interfaces
  ```diff
  - function getSchema(bytes32 table) external view returns (Schema schema);
  + function getValueSchema(bytes32 table) external view returns (Schema valueSchema);
  ```
- The `store-sync` and `cli` packages are updated to integrate the breaking protocol changes. Downstream projects only need to manually integrate these changes if they access low level `Store` or `World` functions. Otherwise, a fresh deploy with the latest MUD will get you these changes.
