---
"@latticexyz/world": patch
---

Added a viem client decorator for account delegation. By extending viem clients with this function after delegation, the delegation is automatically applied to World contract writes. This means that these writes are made on behalf of the delegator. Internally, it transforms the write arguments to use `callFrom`.

This is an internal feature and is not ready for stable consumption yet, so it's not yet exported. Its API may change.

When using with a viem public client, system function selectors will be fetched from the world:

```ts
walletClient.extend(
  callFrom({
    worldAddress,
    delegatorAddress,
    publicClient,
  }),
);
```

Alternatively, a `worldFunctionToSystemFunction` handler can be passed in that will translate between world function selectors and system function selectors for cases where you want to provide your own behavior or use data already cached in e.g. Zustand or RECS.

```ts
walletClient.extend(
  callFrom({
    worldAddress,
    delegatorAddress,
    worldFunctionToSystemFunction: async (worldFunctionSelector) => {
      const systemFunction = useStore.getState().getValue(tables.FunctionSelectors, { worldFunctionSelector })!;
      return {
        systemId: systemFunction.systemId,
        systemFunctionSelector: systemFunction.systemFunctionSelector,
      };
    },
  }),
);
```
