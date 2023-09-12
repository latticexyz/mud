---
"@latticexyz/store": major
"@latticexyz/world": major
---

The `World` now performs `ERC165` interface checks to ensure that the `StoreHook`, `SystemHook`, `System`, `DelegationControl` and `Module` contracts to actually implement their respective interfaces before registering them in the World.

The required `supportsInterface` methods are implemented on the respective base contracts.
When creating one of these contracts, the recommended approach is to extend the base contract rather than the interface.

```diff
- import { IStoreHook } from "@latticexyz/store/src/IStore.sol";
+ import { StoreHook } from "@latticexyz/store/src/StoreHook.sol";

- contract MyStoreHook is IStoreHook {}
+ contract MyStoreHook is StoreHook {}
```

```diff
- import { ISystemHook } from "@latticexyz/world/src/interfaces/ISystemHook.sol";
+ import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";

- contract MySystemHook is ISystemHook {}
+ contract MySystemHook is SystemHook {}
```

```diff
- import { IDelegationControl } from "@latticexyz/world/src/interfaces/IDelegationControl.sol";
+ import { DelegationControl } from "@latticexyz/world/src/DelegationControl.sol";

- contract MyDelegationControl is IDelegationControl {}
+ contract MyDelegationControl is DelegationControl {}
```

```diff
- import { IModule } from "@latticexyz/world/src/interfaces/IModule.sol";
+ import { Module } from "@latticexyz/world/src/Module.sol";

- contract MyModule is IModule {}
+ contract MyModule is Module {}
```
