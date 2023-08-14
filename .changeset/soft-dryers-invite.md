---
"@latticexyz/dev-tools": major
"create-mud": major
---

MUD dev tools is updated to latest sync stack. You must now pass in all of its data requirements rather than relying on magic globals.

```diff
import { mount as mountDevTools } from "@latticexyz/dev-tools";

- mountDevTools();
+ mountDevTools({
+   config,
+   publicClient,
+   walletClient,
+   latestBlock$,
+   blockStorageOperations$,
+   worldAddress,
+   worldAbi,
+   write$,
+   // if you're using recs
+   recsWorld,
+ });
```

It's also advised to wrap dev tools so that it is only mounted during development mode. Here's how you do this with Vite:

```ts
// https://vitejs.dev/guide/env-and-mode.html
if (import.meta.env.DEV) {
  mountDevTools({ ... });
}
```
