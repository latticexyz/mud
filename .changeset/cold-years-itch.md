---
"@latticexyz/cli": major
"@latticexyz/protocol-parser": major
"@latticexyz/store-sync": major
"@latticexyz/store": major
"create-mud": minor
---

Renamed all occurrences of `schema` where it is used as "value schema" to `valueSchema` to clearly distinguish it from "key schema".
The only breaking change for users is the change from `schema` to `valueSchema` in `mud.config.ts`.

```diff
// mud.config.ts
export default mudConfig({
  tables: {
    CounterTable: {
      keySchema: {},
-     schema: {
+     valueSchema: {
        value: "uint32",
      },
    },
  }
}
```
