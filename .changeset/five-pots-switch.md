---
"@latticexyz/cli": patch
---

Fixed `""block is out of range"` errors in the deployer by adding retry logic to the `getLogs` call in the `getResourceIds` function. Previously, fetching the logs could fail if the RPC was out of sync.
