---
"@latticexyz/cli": patch
"@latticexyz/world": patch
---

Worlds can now be deployed with external modules, defined by a module's `artifactPath` in your MUD config, resolved with Node's module resolution. This allows for modules to be published to and imported from npm.

```diff
 defineWorld({
   // …
   modules: [
     {
-      name: "KeysWithValueModule",
+      artifactPath: "@latticexyz/world-modules/out/KeysWithValueModule.sol/KeysWithValueModule.json",
       root: true,
       args: [resolveTableId("Inventory")],
     },
   ],
 });
```

Note that the above assumes `@latticexyz/world-modules` is included as a dependency of your project.
