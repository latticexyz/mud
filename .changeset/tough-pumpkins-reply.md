---
"create-mud": patch
"@latticexyz/cli": major
"@latticexyz/common": major
"@latticexyz/store": patch
"@latticexyz/world": patch
"@latticexyz/world-modules": patch
---

Moved key schema and value schema methods to constants in code-generated table libraries for less bytecode and less gas in register/install methods.

```diff
-console.log(SomeTable.getKeySchema());
+console.log(SomeTable._keySchema);

-console.log(SomeTable.getValueSchema());
+console.log(SomeTable._valueSchema);
```
