---
"@latticexyz/explorer": patch
---

Fixed an issue where the `observer` Viem client decorator required an empty object arg when no options are used.

```diff
-client.extend(observer({}));
+client.extend(observer());
```
