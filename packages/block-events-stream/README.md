# Block events stream

## Example

```ts
import {
  createBlockStream,
  isNonPendingBlock,
  blockRangeToLogs,
  groupLogsByBlockNumber,
} from "@latticexyz/block-events-stream";

const latestBlock$ = await createBlockStream({ publicClient, blockTag: "latest" });

const latestBlockNumber$ = latestBlock$.pipe(
  filter(isNonPendingBlock),
  map((block) => block.number)
);

latestBlockNumber$
  .pipe(
    blockRangeToLogs(0n),
    map(({ logs }) => from(groupLogsByBlockNumber(logs))),
    mergeAll()
  )
  .subscribe((block) => {
    console.log("got events for block", block);
  });
```
