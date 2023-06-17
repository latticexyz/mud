import { BehaviorSubject } from "rxjs";
import type { Block, BlockNumber, BlockTag, PublicClient } from "viem";
import { ReadonlySubject } from "./common";
import { createBlockStream } from "./createBlockStream";

// TODO: pass through viem's types, e.g. WatchBlocksParameters -> GetBlockReturnType
// TODO: make stream closeable?

export type CreateBlockNumberStreamOptions =
  | {
      publicClient: PublicClient;
      blockTag: Omit<BlockTag, "pending">;
      block$?: never;
    }
  | {
      publicClient?: never;
      blockTag?: never;
      block$: ReadonlySubject<BehaviorSubject<Block>>;
    };

export async function createBlockNumberStream({
  publicClient,
  blockTag,
  block$: initialBlock$,
}: CreateBlockNumberStreamOptions): Promise<ReadonlySubject<BehaviorSubject<BlockNumber>>> {
  const block$ = initialBlock$ ?? (await createBlockStream({ publicClient, blockTag: blockTag as BlockTag }));
  const block = block$.value;
  if (!block.number) {
    // TODO: better error
    throw new Error(`${blockTag} block missing or pending`);
  }

  const blockNumber$ = new BehaviorSubject<BlockNumber>(block.number);
  // TODO: do something with unwatch?
  const unwatch = block$.subscribe({
    next: (block) => {
      if (block.number) {
        blockNumber$.next(block.number);
      }
      // TODO: warn/error on blocks with missing block number?
    },
    error: blockNumber$.error,
    complete: blockNumber$.complete,
  });

  return blockNumber$;
}
