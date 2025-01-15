---
"@latticexyz/stash": patch
---

Added `useRecord` and `useRecords` hooks for convenience.

```ts
import { useRecords } from "@latticexyz/stash/react";

const players = useRecords({ stash, table: Position });
```

```ts
import { useRecord } from "@latticexyz/stash/react";

const player = useRecord({ stash, table: Position, key: { player: "0x..." } });
```
