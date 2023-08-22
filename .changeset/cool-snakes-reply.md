---
"@latticexyz/recs": minor
"@latticexyz/std-client": major
---

Moved `createActionSystem` from `std-client` to `recs` package and updated it to better support v2 sync stack.

If you want to use `createActionSystem` alongside `syncToRecs`, you'll need to pass in arguments like so:

```ts
import { createActionSystem } from "@latticexyz/recs/deprecated";

const { blockLogsStorage$, waitForTransaction } = syncToRecs({
  world,
  ...
});

const txReduced$ = blockLogsStorage$.pipe(
  mergeMap(({ operations }) => from(operations.map((op) => op.log?.transactionHash).filter(isDefined)))
);

const actionSystem = createActionSystem(world, txReduced$, waitForTransaction);
```
