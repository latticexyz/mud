import { BehaviorSubject } from "rxjs";
import type { Block, BlockTag, PublicClient } from "viem";
import { ReadonlyBehaviorSubject } from "./common";

// TODO: pass through viem's types, e.g. WatchBlocksParameters -> GetBlockReturnType
// TODO: make stream closeable?

export type CreateBlockStreamOptions = {
  publicClient: PublicClient;
  blockTag: BlockTag;
};

export function createBlockStream({
  publicClient,
  blockTag,
}: CreateBlockStreamOptions): Promise<ReadonlyBehaviorSubject<Block>> {
  return new Promise((resolve, reject) => {
    let stream: BehaviorSubject<Block> | undefined;
    // TODO: do something with unwatch?
    const unwatch = publicClient.watchBlocks({
      blockTag,
      emitOnBegin: true,
      onBlock: (block) => {
        if (!stream) {
          stream = new BehaviorSubject(block);
          // TODO: return actual readonly behavior subject rather than just a type?
          resolve(stream as ReadonlyBehaviorSubject<Block>);
        } else {
          stream.next(block);
        }
      },
      onError: (error) => {
        reject(error);
        stream?.error(error);
      },
    });
  });
}
