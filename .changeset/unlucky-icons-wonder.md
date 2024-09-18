---
"@latticexyz/explorer": patch
---

Fixed an issue where the `observer` Viem client decorator required an empty object arg when no options are used.

```diff
-client.extend(observer({}));
+client.extend(observer());
```

Also fixed a few issues where we were incorrectly redirecting based on the chain name or ID.
