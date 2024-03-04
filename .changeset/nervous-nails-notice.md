---
"@latticexyz/world": minor
---

Added viem custom client actions for delegation. By extending viem clients with this function after delegation, the delegation is automatically applied to World contract writes. Internally, it transforms the `writeContract` arguments to incorporate `callFrom`.

Usage example:

```ts
walletClient.extend(
  delegation({
    worldAddress,
    delegatorAddress,
    getSystemId: (functionSelector) =>
      useStore.getState().getValue(tables.FunctionSelectors, { functionSelector })!.systemId,
  }),
);
```
