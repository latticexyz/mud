---
"@latticexyz/store-indexer": minor
---

When the Postgres indexer starts up, it will now attempt to detect if the database is outdated and, if so, cleans up all MUD-related schemas and tables before proceeding.
