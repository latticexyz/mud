---
"@latticexyz/world": major
---

- The access control library no longer allows calls by the `World` contract to itself to bypass the ownership check.
  This is a breaking change for root modules that relied on this mechanism to register root tables, systems or function selectors.
  To upgrade, root modules must use `delegatecall` instead of a regular `call` to install root tables, systems or function selectors.

  ```diff
  - world.registerSystem(rootSystemId, rootSystemAddress);
  + address(world).delegatecall(abi.encodeCall(world.registerSystem, (rootSystemId, rootSystemAddress)));
  ```

- An `installRoot` method was added to the `IModule` interface.
  This method is now called when installing a root module via `world.installRootModule`.
  When installing non-root modules via `world.installModule`, the module's `install` function continues to be called.
