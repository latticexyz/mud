---
"@latticexyz/store-sync": patch
---

- Moved numerical array types to use array column types (instead of JSON columns) for the Postgres decoded indexer
- Bumped the Postgres column size for `int32`, `uint32`, `int64`, and `uint64` types to avoid overflows
