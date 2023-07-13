---
"@latticexyz/network": patch
---

Remove devEmit function when sending network events from SyncWorker because they can't be serialized across the web worker boundary.
