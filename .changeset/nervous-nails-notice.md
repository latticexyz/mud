---
"@latticexyz/world": minor
---

Added viem custom client actions for delegation. By extending viem clients with this function after delegation, the delegation is automatically applied to World contract writes. This means that these writes are made on behalf of the delegator. Internally, it transforms the write arguments to use `callFrom`.

Usage example:

```ts
walletClient.extend(
  callFrom({
    worldAddress,
    delegatorAddress,
    publicClient, // Instead of using `publicClient`, you can pass a mapping function as shown below. This allows you to use your client store and avoid read requests.
    // worldFunctionToSystemFunction: async (worldFunctionSelector) => {
    //   const systemFunction = useStore
    //     .getState()
    //     .getValue(tables.FunctionSelectors, { worldFunctionSelector })!;
    //   return { systemId: systemFunction.systemId, systemFunctionSelector: systemFunction.systemFunctionSelector };
    // },
  }),
);
```
