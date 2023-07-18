---
"@latticexyz/store-sync": minor
---

Replace `blockEventsToStorage` with `blockLogsToStorage` that exposes a `storeOperations` callback do perform database writes from store operations. This helps encapsulates database adapters into a single wrapper/instance of `blockLogsToStorage`.
