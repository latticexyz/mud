---
"@latticexyz/store-indexer": patch
"@latticexyz/store-sync": patch
---

Added explicit error logs for unexpected situations.
Previously all `debug` logs were going to `stderr`, which made it hard to find the unexpected errors.
Now `debug` logs go to `stdout` and we can add explicit `stderr` logs.
