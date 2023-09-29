---
"@latticexyz/cli": major
"@latticexyz/world": major
---

The `registerRootFunctionSelector` function's signature was changed to accept a `string functionSignature` parameter instead of a `bytes4 functionSelector` parameter.
This change enables the `World` to store the function signatures of all registered functions in a `FunctionSignatures` offchain table, which will allow for the automatic generation of interfaces for a given `World` address in the future.

```diff
IBaseWorld {
  function registerRootFunctionSelector(
    ResourceId systemId,
-   bytes4 worldFunctionSelector,
+   string memory worldFunctionSignature,
    bytes4 systemFunctionSelector
  ) external returns (bytes4 worldFunctionSelector);
}
```
