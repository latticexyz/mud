---
"@latticexyz/explorer": patch
"create-mud": patch
---

Explorer now automatically starts a local indexer when using Anvil as the target chain.

If you previously had an `indexer` entry in your `mprocs.yaml` file, it can now be removed.

```diff
-  indexer:
-    cwd: packages/contracts
-    shell: shx rm -rf $SQLITE_FILENAME && pnpm sqlite-indexer
-    env:
-      DEBUG: mud:*
-      RPC_HTTP_URL: "http://127.0.0.1:8545"
-      FOLLOW_BLOCK_TAG: "latest"
-      SQLITE_FILENAME: "indexer.db"
```
