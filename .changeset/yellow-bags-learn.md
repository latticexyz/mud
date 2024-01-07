---
"@latticexyz/store-indexer": minor
---

The `/api/logs` indexer endpoint is now returning a `404` snapshot not found error when no snapshot is found for the provided filter instead of an empty `200` response.
