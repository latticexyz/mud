---
"@latticexyz/store": patch
---

Added interfaces for all errors that are used by `StoreCore`, which includes `FieldLayout`, `PackedCounter`, `Schema`, and `Slice`. This interfaces are inherited by `IStore`, ensuring that all possible errors are included in the `IStore` ABI for proper decoding in the frontend.
