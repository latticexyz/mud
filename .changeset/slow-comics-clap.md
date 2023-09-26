---
"@latticexyz/world": major
---

System hooks are now registered per function on systems, rather than on the system as a whole, to provide more granular control and avoid unnecessary calls to the system hook contract.

```diff
IBaseWorld {
  function registerSystemHook(
    ResourceId systemId,
+   bytes4 functionSelector,
    ISystemHook hookAddress,
    uint8 enabledHooksBitmap
  ) external;

  function unregisterSystemHook(
    ResourceId systemId,
+   bytes4 functionSelector,
    ISystemHook hookAddress
  ) external;
}
```
