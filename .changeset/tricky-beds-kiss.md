---
"@latticexyz/cli": patch
"@latticexyz/store": patch
"@latticexyz/world": patch
---

- The `World` contract now has an `initialize` function, which can be called once by the creator of the World to install the core module.
  This change allows the registration of all core tables to happen in the `CoreModule`, so no table metadata has to be included in the `World`'s bytecode.

  ```solidity
  interface IBaseWorld {
    function initialize(IModule coreModule) public;
  }
  ```
  
- The `StoreRead` contract no longer calls `StoreCore.initialize` in its constructor.
  `StoreCore` consumers are expected to call `StoreCore.initialize` and `StoreCore.registerCoreTable` in their own setup logic.
  
- The deploy script is updated to use the `World`'s `initialize` function to install the `CoreModule` instead of `registerRootModule` as before.
