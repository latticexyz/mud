---
"@latticexyz/cli": patch
"@latticexyz/world": minor
---

- The `World` contract now has an `initialize` function, which can be called once by the creator of the World to install the core module.
  This change allows the registration of all core tables to happen in the `CoreModule`, so no table metadata has to be included in the `World`'s bytecode.

  ```solidity
  interface IBaseWorld {
    function initialize(IModule coreModule) public;
  }
  ```

- The `World` contract now stores the original creator of the `World` in an immutable state variable.
  It is used internally to only allow the original creator to initialize the `World` in a separate transaction.

  ```solidity
  interface IBaseWorld {
    function creator() external view returns (address);
  }
  ```

- The deploy script is updated to use the `World`'s `initialize` function to install the `CoreModule` instead of `registerRootModule` as before.
