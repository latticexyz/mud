---
"@latticexyz/store-sync": major
---

`syncToPostgres` from `@latticexyz/store-sync/postgres` now uses a single table to store all records in their bytes form (`staticData`, `encodedLengths`, and `dynamicData`), more closely mirroring onchain state and enabling more scalability and stability for automatic indexing of many worlds.

The previous behavior, where schemaful SQL tables are created and populated for each MUD table, has been moved to a separate `@latticexyz/store-sync/postgres-decoded` export bundle. This approach is considered less stable and is intended to be used for analytics purposes rather than hydrating clients. Some previous metadata columns on these tables have been removed in favor of the bytes records table as the source of truth for onchain state.
