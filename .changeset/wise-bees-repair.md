---
"@latticexyz/store-indexer": major
"@latticexyz/store-sync": major
---

PostgreSQL sync/indexer now uses `{storeAddress}` for its database schema names and `{namespace}__{tableName}` for its database table names (or just `{tableName}` for root namespace), to be more consistent with the rest of the MUD codebase.

For namespaced tables:
```diff
- SELECT * FROM 0xfff__some_ns.some_table
+ SELECT * FROM 0xfff.some_ns__some_table
```

For root tables:
```diff
- SELECT * FROM 0xfff__.some_table
+ SELECT * FROM 0xfff.some_table
```

SQLite sync/indexer now uses snake case for its table names and column names for easier writing of queries and to better match PostgreSQL sync/indexer naming.

```diff
- SELECT * FROM 0xfFf__someNS__someTable
+ SELECT * FROM 0xfff__some_ns__some_table
```
