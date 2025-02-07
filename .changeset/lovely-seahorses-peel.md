---
"@latticexyz/store": patch
---

Updated `IStoreRegistration` interface to allow calling `registerTable` with `keyNames` and `fieldNames` from `memory` rather than `calldata` so this can be called with names returned by table libraries.
