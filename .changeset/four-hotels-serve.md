---
"@latticexyz/store-sync": major
---

Previously, all `store-sync` strategies were susceptible to a potential memory leak where the stream that fetches logs from the RPC would get ahead of the stream that stores the logs in the provided storage adapter. We saw this most often when syncing to remote Postgres servers, where inserting records was much slower than we retrieving them from the RPC. In these cases, the stream would build up a backlog of items until the machine ran out of memory.

This is now fixed by waiting for logs to be stored before fetching the next batch of logs from the RPC. To make this strategy work, we no longer return `blockLogs$` (stream of logs fetched from RPC but before they're stored) and instead just return `storedBlockLogs$` (stream of logs fetched from RPC after they're stored).
