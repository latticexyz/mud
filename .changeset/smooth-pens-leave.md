---
"@latticexyz/store-sync": patch
---

Fetching a snapshot from the indexer will now parse JSON as a stream, avoiding issues with large snapshots where the string is too long to parse in one go.
