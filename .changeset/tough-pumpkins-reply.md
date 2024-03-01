---
"create-mud": patch
"@latticexyz/store": minor
"@latticexyz/world": minor
"@latticexyz/world-modules": minor
---

Moved key schema and value schema methods to constants in code-generated table libraries for less bytecode and less gas in register/install methods.

```diff
-console.log(SomeTable.getKeySchema());
+console.log(SomeTable._keySchema);

-console.log(SomeTable.getValueSchema());
+console.log(SomeTable._valueSchema);
```
