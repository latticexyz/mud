import { Observable } from "rxjs";
import type { Block, BlockTag, PublicClient } from "viem";

export type CreateBlockStreamOptions<TBlockTag extends BlockTag> = {
  publicClient: PublicClient;
  blockTag: TBlockTag;
};

export type CreateBlockStreamResult<TBlockTag extends BlockTag> = Observable<Block<bigint, false, TBlockTag>>;

export function createBlockStream<TBlockTag extends BlockTag>({
  publicClient,
  blockTag,
}: CreateBlockStreamOptions<TBlockTag>): CreateBlockStreamResult<TBlockTag> {
  return new Observable(function subscribe(subscriber) {
    return publicClient.watchBlocks({
      blockTag,
      emitOnBegin: true,
      onBlock: (block) => subscriber.next(block),
      onError: (error) => subscriber.error(error),
    });
  });
}
