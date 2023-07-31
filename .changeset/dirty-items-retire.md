---
"@latticexyz/store-indexer": feat
"@latticexyz/store-sync": feat
---

Adds store indexer service package with utils to query the indexer service.

You can run the indexer locally by checking out the MUD monorepo, installing/building everything, and running `pnpm start:local` from `packages/store-indexer`.

To query the indexer in the client, you can create a tRPC client with a URL pointing to the indexer service and call the available tRPC methods:

```ts
import { createIndexerClient } from "@latticexyz/store-sync/trpc-indexer";

const indexer = createIndexerClient({ url: indexerUrl });
const result = await indexer.findAll.query({
  chainId: publicClient.chain.id,
  address,
});
```

If you're using `syncToRecs`, you can just pass in the `indexerUrl` option as a shortcut to the above:

```ts
import { syncToRecs } from "@latticexyz/store-sync/recs";

syncToRecs({
  ...
  indexerUrl: "https://your.indexer.service",
});
```
