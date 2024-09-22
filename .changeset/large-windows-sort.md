---
"@latticexyz/block-logs-stream": patch
---

- For block range size errors, `fetchLogs` now reduces the max block range for subsequent requests in its loop. For block out of range or response size errors, only the current request's block range is reduced until the request succeeds, then it resets to the max block range.
- Added `fetchBlockLogs` to find all matching logs of the given block range, grouped by block number, in a single async call.
- Loosened the `publicClient` type and switched to tree shakable actions.
