---
"@latticexyz/store": major
---

Store config has been rebuilt with strong types. The shape of the config has also changed slightly for clarity, the biggest change of which is merging of `keySchema` and `valueSchema` into a single `schema` with a separate `key` for the table's primary key.

_Note that the Store config is a subset of the World config and if you have a MUD project, you likely want to follow the World changelog for config migration steps._

To migrate, first update the imported config method:

```diff filename="mud.config.ts"
-import { mudConfig } from "@latticexyz/store/register";
+import { defineStore } from "@latticexyz/store";

-export default mudConfig({
+export default defineStore({
```

Then migrate the table key by renaming `keySchema` to `schema` and define the table `key` with each field name from your key schema:

```diff filename="mud.config.ts"
 export default defineStore({
   tables: {
     Position: {
-      keySchema: {
+      schema: {
         player: "address",
       },
       valueSchema: {
         x: "int32",
         y: "int32",
       },
+      key: ['player'],
     },
   },
 });
```

Now we can merge the `valueSchema` into `schema`.

```diff filename="mud.config.ts"
 export default defineStore({
   tables: {
     Position: {
       schema: {
         player: "address",
-      },
-      valueSchema: {
         x: "int32",
         y: "int32",
       },
       key: ['player'],
     },
   },
 });
```

If you previously used the table config shorthand without the full `keySchema` and `valueSchema`, some of the defaults have changed. Shorthands now use an `id: "bytes32"` field by default rather than `key: "bytes32"` and corresponding `key: ["id"]`. To keep previous behavior, you may have to manually define your `schema` with the previous `key` and `value` fields.

```diff filename="mud.config.ts"
 export default defineStore({
   tables: {
-    OwnedBy: "address",
+    OwnedBy: {
+      schema: {
+        key: "bytes32",
+        value: "address",
+      },
+      key: ["key"],
+    },
   },
 });
```

Singleton tables are defined similarly, where an empty `key` rather than `keySchema` is provided:

```diff filename="mud.config.ts"
-keySchema: {}
+key: []
```

Offchain tables are now defined as a table `type` instead an `offchainOnly` boolean:

```diff filename="mud.config.ts"
-offchainOnly: true
+type: 'offchainTable'
```

All codegen options have moved under `codegen`:

```diff filename="mud.config.ts"
 export default defineStore({
-  codegenDirectory: "…",
+  codegen: {
+    outputDirectory: "…",
+  },
   tables: {
     Position: {
       schema: {
         player: "address",
         x: "int32",
         y: "int32",
       },
       key: ['player'],
-      directory: "…",
-      dataStruct: false,
+      codegen: {
+        outputDirectory: "…",
+        dataStruct: false,
+      },
     },
   },
 });
```
