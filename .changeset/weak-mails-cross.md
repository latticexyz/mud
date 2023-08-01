---
"@latticexyz/cli": patch
"@latticexyz/recs": patch
"@latticexyz/std-client": patch
---

Update RECS components with v2 key/value schemas. This helps with encoding/decoding composite keys and strong types for keys/values.

This may break if you were previously dependent on `component.id`, `component.metadata.componentId`, or `component.metadata.tableId`:

- `component.id` is now the on-chain `bytes32` hex representation of the table ID
- `component.metadata.componentName` is the table name (e.g. `Position`)
- `component.metadata.tableName` is the namespaced table name (e.g. `myworld:Position`)
- `component.metadata.keySchema` is an object with key names and their corresponding ABI types
- `component.metadata.valueSchema` is an object with field names and their corresponding ABI types
