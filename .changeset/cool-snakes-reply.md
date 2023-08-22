---
"@latticexyz/recs": minor
"@latticexyz/std-client": major
---

- Moved `createActionSystem` from `std-client` to `recs` package and updated it to better support v2 sync stack.

  If you want to use `createActionSystem` alongside `syncToRecs`, you'll need to pass in arguments like so:

  ```ts
  import { syncToRecs } from "@latticexyz/store-sync/recs";
  import { createActionSystem } from "@latticexyz/recs/deprecated";
  import { from, mergeMap } from "rxjs";

  const { blockLogsStorage$, waitForTransaction } = syncToRecs({
    world,
    ...
  });

  const txReduced$ = blockLogsStorage$.pipe(
    mergeMap(({ operations }) => from(operations.map((op) => op.log?.transactionHash).filter(isDefined)))
  );

  const actionSystem = createActionSystem(world, txReduced$, waitForTransaction);
  ```

- Fixed a bug in `waitForComponentValueIn' that caused the promise not to be resolved if the component value was already set when the function was called.

- Fixed a bug in `createActionSystem` that caused optimistic updates to be incorrectly propagated to requirement checks. To fix the bug, the `updates` declaration when adding an action now requires the full component to be passed in instead of just its name.

  ```diff
    actions.add({
      updates: () => [
        {
  -       component: "Resource",
  +       component: Resource,
          ...
        }
      ],
      ...
    });
  ```
