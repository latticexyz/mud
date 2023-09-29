---
"@latticexyz/store-indexer": minor
"@latticexyz/store-sync": minor
---

Added a `tableIds` parameter to store sync methods and indexer to allow filtering data streams by table IDs. Store sync methods automatically include all internal table IDs from Store and World.

```ts
import { syncToRecs } from "@latticexyz/store-sync/recs";
import { resourceIdToHex } from "@latticexyz/common";

syncToRecs({
  ...
  tableIds: [resourceIdToHex(...)],
});
```

```ts
import { createIndexerClient } from "@latticexyz/store-sync/trpc-indexer";
import { resourceIdToHex } from "@latticexyz/common";

const client = createIndexerClient({ ... });
client.findAll({
  ...
  tableIds: [resourceIdToHex(...)],
});
```
