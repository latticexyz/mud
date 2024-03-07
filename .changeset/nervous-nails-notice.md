---
"@latticexyz/world": minor
---

Added viem custom client actions for delegation. By extending viem clients with this function after delegation, the delegation is automatically applied to World contract writes. Internally, it transforms the `writeContract` arguments to incorporate `callFrom`.

Usage example:

```ts
walletClient.extend(
  callFrom({
    worldAddress,
    delegatorAddress,
    publicClient, // Instead of passing `publicClient`, you can pass a function like below for more control.
    // worldFunctionToSystemFunction: async (worldFunctionSelector) => {
    //   const systemFunction = useStore
    //     .getState()
    //     .getValue(tables.FunctionSelectors, { functionSelector: worldFunctionSelector })!;
    //   return { systemId: systemFunction.systemId, systemFunctionSelector: systemFunction.systemFunctionSelector };
    // },
  }),
);
```
