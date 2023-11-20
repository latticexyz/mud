---
"@latticexyz/dev-tools": minor
"create-mud": minor
---

Added Zustand support to Dev Tools:

```ts
const { syncToZustand } from "@latticexyz/store-sync";
const { mount as mountDevTools } from "@latticexyz/dev-tools";

const { useStore } = syncToZustand({ ... });

mountDevTools({
  ...
  useStore,
});
```
