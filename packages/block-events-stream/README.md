# Block events stream

## Example

```ts
import {
  createBlockStream,
  isNonPendingBlock,
  groupLogsByBlockNumber,
  latestBlockNumberToLogs,
} from "@latticexyz/block-events-stream";

const latestBlock$ = await createBlockStream({ publicClient, blockTag: "latest" });

const latestBlockNumber$ = latestBlock$.pipe(
  filter(isNonPendingBlock),
  map((block) => block.number)
);

latestBlockNumber$
  .pipe(
    latestBlockNumberToLogs({
      publicClient,
      address,
      events,
      fromBlock: 0n,
    }),
    map(({ logs }) => from(groupLogsByBlockNumber(logs))),
    mergeAll()
  )
  .subscribe((block) => {
    console.log("got events for block", block);
  });
```
