import { Observable } from "rxjs";
import type { Block, BlockTag } from "viem";
import { watchBlocks } from "viem/actions";
import { getAction } from "viem/utils";
import { GetRpcClientOptions, getRpcClient } from "./getRpcClient";

export type CreateBlockStreamOptions<blockTag extends BlockTag> = GetRpcClientOptions & {
  blockTag: blockTag;
};

export type CreateBlockStreamResult<blockTag extends BlockTag> = Observable<Block<bigint, false, blockTag>>;

export function createBlockStream<blockTag extends BlockTag>(
  opts: CreateBlockStreamOptions<blockTag>,
): CreateBlockStreamResult<blockTag> {
  const client = getRpcClient(opts);
  return new Observable(function subscribe(subscriber) {
    return getAction(
      client,
      watchBlocks,
      "watchBlocks",
    )({
      blockTag: opts.blockTag,
      emitOnBegin: true,
      onBlock: (block) => subscriber.next(block),
      onError: (error) => subscriber.error(error),
    });
  });
}
