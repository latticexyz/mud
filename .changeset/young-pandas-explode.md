---
"@latticexyz/store-sync": major
---

Postgres storage adapter now uses snake case for table and column names in decoded tables. This allows for better SQL ergonomics when querying these tables.

To avoid naming conflicts for now, schemas are still case-sensitive and need to be queried with double quotes. We may change this in the future with [namespace validation](https://github.com/latticexyz/mud/issues/1991).
