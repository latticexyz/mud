---
"@latticexyz/cli": major
"@latticexyz/world": major
---

The `registerFunctionSelector` function now accepts a single `functionSignature` string paramemer instead of separating function name and function arguments into separate parameters.

```diff
IBaseWorld {
  function registerFunctionSelector(
    ResourceId systemId,
-   string memory systemFunctionName,
-   string memory systemFunctionArguments
+   string memory systemFunctionSignature
  ) external returns (bytes4 worldFunctionSelector);
}
```

This is a breaking change if you were manually registering function selectors, e.g. in a `PostDeploy.s.sol` script or a module.
To upgrade, simply replace the separate `systemFunctionName` and `systemFunctionArguments` parameters with a single `systemFunctionSignature` parameter.

```diff
  world.registerFunctionSelector(
    systemId,
-   systemFunctionName,
-   systemFunctionArguments,
+   string(abi.encodePacked(systemFunctionName, systemFunctionArguments))
  );
```
