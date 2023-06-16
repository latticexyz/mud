import { BehaviorSubject } from "rxjs";
import type { Block, BlockTag, PublicClient } from "viem";

// TODO: pass through viem's types, e.g. WatchBlocksParameters -> GetBlockReturnType

export type CreateBlockStreamOptions = {
  publicClient: PublicClient;
  blockTag: BlockTag;
};

export function createBlockStream({
  publicClient,
  blockTag,
}: CreateBlockStreamOptions): Promise<BehaviorSubject<Block>> {
  return new Promise((resolve, reject) => {
    let stream: BehaviorSubject<Block> | undefined;
    const unwatch = publicClient.watchBlocks({
      blockTag,
      emitOnBegin: true,
      onBlock: (block) => {
        if (!stream) {
          stream = new BehaviorSubject(block);
          resolve(stream);
        } else {
          stream.next(block);
        }
      },
      onError: reject,
    });
    // TODO: do something with `unwatch`?
    // TODO: return readonly BehaviorSubject, something like an observable but with a current value
  });
}
