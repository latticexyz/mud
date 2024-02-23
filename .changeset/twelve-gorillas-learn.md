---
"@latticexyz/block-logs-stream": minor
"@latticexyz/cli": minor
"@latticexyz/common": minor
"@latticexyz/config": minor
"@latticexyz/dev-tools": minor
"@latticexyz/faucet": minor
"@latticexyz/protocol-parser": minor
"@latticexyz/schema-type": minor
"@latticexyz/store-indexer": minor
"@latticexyz/store-sync": minor
"@latticexyz/store": minor
"@latticexyz/world": minor
"create-mud": minor
---

Upgraded all packages and templates to viem v2.7.12 and abitype v1.0.0.

Some viem APIs have changed and we've updated `getContract` to reflect those changes and keep it aligned with viem. It's one small code change:

```diff
 const worldContract = getContract({
   address: worldAddress,
   abi: IWorldAbi,
-  publicClient,
-  walletClient,
+  client: { public: publicClient, wallet: walletClient },
 });
```
