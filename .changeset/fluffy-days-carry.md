---
"@latticexyz/store-indexer": major
"@latticexyz/store-sync": major
---

The postgres indexer is now storing the `logIndex` of the last update of a record to be able to return the snapshot logs in the order they were emitted onchain.
