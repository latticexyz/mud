---
"@latticexyz/cli": patch
"@latticexyz/world-modules": patch
"@latticexyz/world": major
---

Previously `registerSystem` and `registerTable` had a side effect of registering namespaces if the system or table's namespace didn't exist yet.
This caused a possible frontrunning issue, where an attacker could detect a `registerSystem`/`registerTable` transaction in the mempool,
insert a `registerNamespace` transaction before it, grant themselves access to the namespace, transfer ownership of the namespace to the victim,
so that the `registerSystem`/`registerTable` transactions still went through successfully.
To mitigate this issue, the side effect of registering a namespace in `registerSystem` and `registerTable` has been removed.
Calls to these functions now expect the respective namespace to exist and the caller to own the namespace, otherwise they revert.

Changes in consuming projects are only necessary if tables or systems are registered manually.
If only the MUD deployer is used to register tables and systems, no changes are necessary, as the MUD deployer has been updated accordingly.

```diff
+  world.registerNamespace(namespaceId);
   world.registerSystem(systemId, system, true);
```

```diff
+  world.registerNamespace(namespaceId);
   MyTable.register();
```
