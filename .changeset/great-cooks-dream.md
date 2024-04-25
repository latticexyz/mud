---
"@latticexyz/store-sync": patch
---

Add RECS sync strategy and corresponding utils

```ts
import { createPublicClient, http } from 'viem';
import { syncToRecs } from '@latticexyz/store-sync';
import storeConfig from 'contracts/mud.config';
import { defineContractComponents } from './defineContractComponents';

const publicClient = createPublicClient({
  chain,
  transport: http(),
  pollingInterval: 1000,
});

const { components, singletonEntity, latestBlock$, blockStorageOperations$, waitForTransaction } = await syncToRecs({
  world,
  config: storeConfig,
  address: '0x...',
  publicClient,
  components: defineContractComponents(...),
});
```
