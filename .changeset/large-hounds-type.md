---
"@latticexyz/store-indexer": major
---

Separated frontend server and indexer service for Postgres indexer. Now you can run the Postgres indexer with one writer and many readers.

If you were previously using the `postgres-indexer` binary, you'll now need to run both `postgres-indexer` and `postgres-frontend`.

For consistency, the Postgres database logs are now disabled by default. If you were using these, please let us know so we can add them back in with an environment variable flag.
