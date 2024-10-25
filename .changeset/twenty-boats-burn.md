---
"@latticexyz/stash": patch
---

Added `useStash` React hook. It's heavily inspired by Zustand's `useStore` and accepts a stash, a state selector, an an optional equality function to avoid unnecessary re-render cycles when returning unstable values.

Also updated `getRecord` and `getRecords` to each take either a `stash` or `state` object for more ergonomic use with `useStash`.

```ts
import { useStash } from "@latticexyz/stash/react";
import { getRecord } from "@latticexyz/stash";
import config from "../mud.config";

const tables = config.namespaces.app.tables;

export function PlayerName({ playerId }) {
  const record = useStash(stash, (state) => getRecord({ state, table: tables.Player, key: { playerId } }));
  ...
}
```

```ts
import isEqual from "fast-deep-equal";
import { useStash } from "@latticexyz/stash/react";
import { getRecords } from "@latticexyz/stash";
import config from "../mud.config";

export function PlayerNames() {
  const record = useStash(stash, (state) => getRecords({ state, table: tables.Player }), { isEqual });
  ...
}
```
