---
"@latticexyz/cli": major
"@latticexyz/world": major
---

- All `World` function selectors that previously had `bytes16 namespace, bytes16 name` arguments now use `bytes32 resourceSelector` instead.
  This includes `setRecord`, `setField`, `pushToField`, `popFromField`, `updateInField`, `deleteRecord`, `call`, `grantAccess`, `revokeAccess`, `registerTable`,
  `registerStoreHook`, `registerSystemHook`, `registerFunctionSelector`, `registerSystem` and `registerRootFunctionSelector`.
  This changes aligns the `World` function selectors with the `Store` function selectors, reduces clutter, reduces gas cost and reduces the `World`'s contract size.

- The `World`'s `registerHook` function is removed. Use `registerStoreHook` or `registerSystemHook` instead.

- The `deploy` script is updated to integrate the World interface changes
