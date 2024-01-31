---
"@latticexyz/store": major
---

- `StoreCore`'s `initialize` function is split into `initialize` (to set the `StoreSwitch`'s `storeAddress`) and `registerCoreTables` (to register the `Tables` and `StoreHooks` tables).
  The purpose of this is to give consumers more granular control over the setup flow.

- The `StoreRead` contract no longer calls `StoreCore.initialize` in its constructor.
  `StoreCore` consumers are expected to call `StoreCore.initialize` and `StoreCore.registerCoreTable` in their own setup logic.
