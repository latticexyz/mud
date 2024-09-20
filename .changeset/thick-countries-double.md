---
"@latticexyz/explorer": patch
---

Renamed optional `waitForStateChange` param in `observer()` decorator to `waitForTransaction` to better align with `@latticexyz/store-sync` packages.

```diff
 const { waitForTransaction } = syncToZustand(...);
-observer({ waitForStateChange: waitForTransaction });
+observer({ waitForTransaction });
```
