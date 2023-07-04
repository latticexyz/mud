# Block events stream

## Example

```ts
import {
  createBlockStream,
  isNonPendingBlock,
  groupLogsByBlockNumber,
  blockRangeToLogs,
} from "@latticexyz/block-events-stream";

const latestBlock$ = await createBlockStream({ publicClient, blockTag: "latest" });

const latestBlockNumber$ = latestBlock$.pipe(
  filter(isNonPendingBlock),
  map((block) => block.number)
);

latestBlockNumber$
  .pipe(
    map((latestBlockNumber) => ({ startBlock: 0n, endBlock: latestBlockNumber })),
    blockRangeToLogs({
      publicClient,
      address,
      events,
    }),
    map(({ logs }) => from(groupLogsByBlockNumber(logs))),
    mergeAll()
  )
  .subscribe((block) => {
    console.log("got events for block", block);
  });
```
