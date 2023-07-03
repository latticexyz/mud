import { Observable } from "rxjs";
import type { Block, BlockTag, PublicClient } from "viem";

export type CreateBlockStreamOptions = {
  publicClient: PublicClient;
  blockTag: BlockTag;
};

export type CreateBlockStreamResult = Observable<Block>;

export function createBlockStream({ publicClient, blockTag }: CreateBlockStreamOptions): CreateBlockStreamResult {
  return new Observable(function subscribe(subscriber) {
    return publicClient.watchBlocks({
      blockTag,
      emitOnBegin: true,
      onBlock: (block) => subscriber.next(block),
      onError: (error) => subscriber.error(error),
    });
  });
}
