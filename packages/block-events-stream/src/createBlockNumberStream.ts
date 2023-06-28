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

export type CreateBlockNumberStreamResult = {
  stream: ReadonlyBehaviorSubject<BlockNumber>;
  close: () => void;
};

export async function createBlockNumberStream({
  publicClient,
  blockTag,
  block$: initialBlock$,
}: CreateBlockNumberStreamOptions): Promise<CreateBlockNumberStreamResult> {
  const block$ = initialBlock$
    ? {
        stream: initialBlock$,
        close: (): void => {
          // don't close the user-provided stream
        },
      }
    : await createBlockStream({ publicClient, blockTag: blockTag as BlockTag });

  const block = block$.stream.value;

  if (!block.number) {
    // TODO: better error
    throw new Error(`${blockTag} block missing or pending`);
  }

  const blockNumber$ = new BehaviorSubject<BlockNumber>(block.number);

  const { unsubscribe } = block$.stream
    .pipe(
      filter(isNonPendingBlock),
      map((block) => block.number)
    )
    .subscribe(blockNumber$);

  return {
    stream: blockNumber$,
    close: (): void => {
      unsubscribe();
      blockNumber$.complete();
      block$.close();
    },
  };
}
