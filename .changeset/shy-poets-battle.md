---
"@latticexyz/world": patch
---

Updated `callFrom` action to automatically translate `batchCall` to `batchCallFrom`.
Also fixed `encodeSystemCallFrom` and `encodeSystemCallsFrom` to return the right format for use with `batchCall` and `batchCallFrom` respectively.
