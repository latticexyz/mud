---
"@latticexyz/store-sync": major
"create-mud": minor
---

We've updated the Store events to be "schemaless", meaning there is enough information in each event to only need to operate on the bytes of each record to make an update to that record without having to first decode the record by its schema. This enables new kinds of indexer and sync strategies that are more "stateless".

As such, we've replaced `blockStorageOperations$` with `storedBlockLogs$`, a stream of simplified Store event logs after they've been synced to the configured storage adapter. These logs may not reflect exactly the events that are on chain when e.g. hydrating from an indexer, but they will still allow the client to "catch up" to the on-chain state of your tables.
