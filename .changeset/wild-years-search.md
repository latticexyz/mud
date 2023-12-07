---
"@latticexyz/store-indexer": minor
"@latticexyz/store-sync": minor
---

- Improved query performance by 10x by moving from drizzle ORM to handcrafted SQL.
- Moved away from `trpc` for more granular control over the transport layer.
  Added an `/api/logs` endpoint using the new query and gzip compression for 40x less data transferred over the wire.
  Deprecated the `/trpc/getLogs` and `/trpc/findAll` endpoints.
- Added a `createIndexerClient` client for the new `/api` indexer API exported from `@latticexyz/store-sync/indexer-client`.
  The `createIndexerClient` export from `@latticexyz/store-sync/trpc-indexer` is deprecated.

```diff
- import { createIndexerClient } from "@latticexyz/store-sync/trpc-indexer";
+ import { createIndexerClient } from "@latticexyz/store-sync/indexer-client";

- const indexer = createIndexerClient({ url: "https://indexer.holesky.redstone.xyz/trpc" });
+ const indexer = createIndexerClient({ url: "https://indexer.holesky.redstone.xyz" });

- const snapshot = indexer.getLogs.query(options);
+ const snapshot = indexer.getLogs(options);
```
