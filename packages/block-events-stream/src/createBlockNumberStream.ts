import { BehaviorSubject, filter, map } from "rxjs";
import type { Block, BlockNumber, BlockTag, PublicClient } from "viem";
import { createBlockStream } from "./createBlockStream";
import { ReadonlyBehaviorSubject } from "./common";
import { isNonPendingBlock } from "./isNonPendingBlock";

// TODO: pass through viem's types, e.g. WatchBlocksParameters -> GetBlockReturnType

export type CreateBlockNumberStreamOptions =
  | {
      publicClient: PublicClient;
      blockTag: Omit<BlockTag, "pending">;
      block$?: never;
    }
  | {
      publicClient?: never;
      blockTag?: never;
      block$: ReadonlyBehaviorSubject<Block>;
    };

export async function createBlockNumberStream({
  publicClient,
  blockTag,
  block$: initialBlock$,
}: CreateBlockNumberStreamOptions): Promise<ReadonlyBehaviorSubject<BlockNumber>> {
  const block$ = initialBlock$ ?? (await createBlockStream({ publicClient, blockTag: blockTag as BlockTag }));
  const block = block$.value;

  if (!block.number) {
    // TODO: better error
    throw new Error(`${blockTag} block missing or pending`);
  }

  const blockNumber$ = new BehaviorSubject<BlockNumber>(block.number);

  block$
    .pipe(
      filter(isNonPendingBlock),
      map((block) => block.number)
    )
    .subscribe(blockNumber$);

  return blockNumber$;
}
