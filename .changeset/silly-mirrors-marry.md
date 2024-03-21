---
"@latticexyz/store": minor
"@latticexyz/world": patch
---

Added an `abstract` `StoreKernel` contract, which includes all Store interfaces except for registration, and implements write methods, `protocolVersion` and initializes `StoreCore`. `Store` extends `StoreKernel` with the `IStoreRegistration` interface. `StoreData` is removed as a separate interface/contract. `World` now extends `StoreKernel` (since the registration methods are added via the `InitModule`).
