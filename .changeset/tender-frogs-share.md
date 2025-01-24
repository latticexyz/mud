---
"@latticexyz/cli": patch
"@latticexyz/entrykit": patch
"@latticexyz/world-module-callwithsignature": patch
"@latticexyz/world-modules": patch
---

`CallWithSignature` module has been moved out of `@latticexyz/world-modules` and into its own package at `@latticexyz/world-module-callwithsignature`. This module is now installed by default during deploy as its needed by EntryKit.

If you previously had this module installed in your MUD config, you can now remove it.

```diff
 export default defineConfig({
   tables: {
     ...
   },
-  modules: [
-    {
-      artifactPath:
-        "@latticexyz/world-modules/out/Unstable_CallWithSignatureModule.sol/Unstable_CallWithSignatureModule.json",
-      root: true,
-    },
-  ],
 });
```
