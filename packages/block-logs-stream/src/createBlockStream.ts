import { Observable } from "rxjs";
import type { Block, BlockTag, Client } from "viem";
import { watchBlocks } from "viem/actions";
import { getAction } from "viem/utils";

export type CreateBlockStreamOptions<blockTag extends BlockTag> = {
  publicClient: Client;
  blockTag: blockTag;
};

export type CreateBlockStreamResult<blockTag extends BlockTag> = Observable<Block<bigint, false, blockTag>>;

export function createBlockStream<blockTag extends BlockTag>({
  publicClient,
  blockTag,
}: CreateBlockStreamOptions<blockTag>): CreateBlockStreamResult<blockTag> {
  return new Observable(function subscribe(subscriber) {
    return getAction(
      publicClient,
      watchBlocks,
      "watchBlocks",
    )({
      blockTag,
      emitOnBegin: true,
      onBlock: (block) => subscriber.next(block),
      onError: (error) => subscriber.error(error),
    });
  });
}
