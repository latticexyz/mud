---
"@latticexyz/stash": patch
---

Added experimental support for indices and derived tables to Stash.

Derived tables are synchronously updated based on changes to source tables, enabling computed or reorganized views of existing data.

Indices are a special case of derived tables that mirror another table with a different key.
They provide a more ergonomic API for this common pattern and are automatically considered in the `Matches` query fragment to optimize lookups on large tables.

Example:

```ts
const stash = createStash();
const inputTable = defineTable({
  label: "input",
  schema: { field1: "uint32", field2: "address", field3: "string" },
  key: ["field1"],
});
registerTable({ stash, table: inputTable });
const indexTable = registerIndex({ stash, table: inputTable, key: ["field2", "field3"] });
```
