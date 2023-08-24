---
"@latticexyz/store-sync": minor
---

`blockLogsToStorage(sqliteStorage(...))` converts block logs to SQLite operations. You can use it like:

```ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { createPublicClient } from "viem";
import { blockLogsToStorage } from "@latticexyz/store-sync";
import { sqliteStorage } from "@latticexyz/store-sync/sqlite";

const database = drizzle(new Database('store.db')) as any as BaseSQLiteDatabase<"sync", void>;
const publicClient = createPublicClient({ ... });

blockLogs$
  .pipe(
    concatMap(blockLogsToStorage(sqliteStorage({ database, publicClient }))),
    tap(({ blockNumber, operations }) => {
      console.log("stored", operations.length, "operations for block", blockNumber);
    })
  )
  .subscribe();
```
