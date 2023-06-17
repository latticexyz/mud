import { BehaviorSubject } from "rxjs";
import type { Block, BlockTag, PublicClient } from "viem";
import { ReadonlySubject } from "./common";

// TODO: pass through viem's types, e.g. WatchBlocksParameters -> GetBlockReturnType
// TODO: make stream closeable?

export type CreateBlockStreamOptions = {
  publicClient: PublicClient;
  blockTag: BlockTag;
};

export function createBlockStream({
  publicClient,
  blockTag,
}: CreateBlockStreamOptions): Promise<ReadonlySubject<BehaviorSubject<Block>>> {
  return new Promise((resolve, reject) => {
    let stream: BehaviorSubject<Block> | undefined;
    // TODO: do something with unwatch?
    const unwatch = publicClient.watchBlocks({
      blockTag,
      emitOnBegin: true,
      onBlock: (block) => {
        if (!stream) {
          stream = new BehaviorSubject(block);
          // TODO: return observable with a current value?
          resolve(stream as ReadonlySubject<BehaviorSubject<Block>>);
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
