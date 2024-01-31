---
"@latticexyz/store-sync": major
---

`syncToZustand` now uses `tables` argument to populate the Zustand store's `tables` key, rather than the on-chain table registration events. This means we'll no longer store data into Zustand you haven't opted into receiving (e.g. other namespaces).
