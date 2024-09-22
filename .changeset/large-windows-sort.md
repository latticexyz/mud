---
"@latticexyz/block-logs-stream": patch
---

- For block range size errors, `fetchLogs` now reduces the max block range for subsequent requests in its loop. For block out of range or response size errors, only the current request's block range is reduced until the request succeeds, then it resets to the max block range.
- Added `fetchBlockLogs` to request all block logs in one async call rather than an async generator.
- Loosened the `publicClient` type and switched to tree shakable actions.
