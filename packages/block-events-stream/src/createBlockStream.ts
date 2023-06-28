import { BehaviorSubject } from "rxjs";
import type { Block, BlockTag, PublicClient } from "viem";
import { ReadonlyBehaviorSubject } from "./common";

export type CreateBlockStreamOptions = {
  publicClient: PublicClient;
  blockTag: BlockTag;
};

export type CreateBlockStreamResult = {
  stream: ReadonlyBehaviorSubject<Block>;
  close: () => void;
};

export function createBlockStream({
  publicClient,
  blockTag,
}: CreateBlockStreamOptions): Promise<CreateBlockStreamResult> {
  return new Promise((resolve, reject) => {
    let stream: BehaviorSubject<Block> | undefined;
    const unwatch = publicClient.watchBlocks({
      blockTag,
      emitOnBegin: true,
      onBlock: (block) => {
        if (!stream) {
          stream = new BehaviorSubject(block);
          // TODO: return actual readonly behavior subject rather than just a type?
          resolve({
            stream: stream as ReadonlyBehaviorSubject<Block>,
            close: () => unwatch(),
          });
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
