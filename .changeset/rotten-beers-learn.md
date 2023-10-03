---
"@latticexyz/common": minor
---

- Moves contract write logic out of `createContract` into its own `writeContract` method so that it can be used outside of the contract instance, and for consistency with viem.
- Deprecates `createContract` in favor of `getContract` for consistency with viem.
- Reworks `createNonceManager`'s `BroadcastChannel` setup and moves out the notion of a "nonce manager ID" to `getNonceManagerId` so we can create an internal cache with `getNonceManager` for use in `writeContract`.

If you were using the `createNonceManager` before, you'll just need to rename `publicClient` argument to `client`:

```diff
  const publicClient = createPublicClient({ ... });
- const nonceManager = createNonceManager({ publicClient, ... });
+ const nonceManager = createNonceManager({ client: publicClient, ... });
```
