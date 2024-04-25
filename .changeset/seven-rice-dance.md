---
"@latticexyz/store-indexer": minor
---

The `findAll` method is now considered deprecated in favor of a new `getLogs` method. This is only implemented in the Postgres indexer for now, with SQLite coming soon. The new `getLogs` method will be an easier and more robust data source to hydrate the client and other indexers and will allow us to add streaming updates from the indexer in the near future.

For backwards compatibility, `findAll` is now implemented on top of `getLogs`, with record key/value decoding done in memory at request time. This may not scale for large databases, so use wisely.
