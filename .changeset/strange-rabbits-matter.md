---
"@latticexyz/stash": patch
---

Stash now preserves batch updates when subscribing to query results.
Previously, while Stash supported batching table updates for atomic onchain changes, subscribing to query results would split these updates by table.
