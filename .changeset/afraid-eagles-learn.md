---
"@latticexyz/store-indexer": patch
---

Added Prometheus metrics at `/metrics` to the Postgres indexer backend and frontend, as well as the SQLite indexer.

Added support for passing in an empty `STORE_ADDRESS=` environment variable.
