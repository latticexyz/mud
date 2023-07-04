import type { Block } from "viem";

export type NonPendingBlock<TBlock extends Block> = TBlock & {
  hash: NonNullable<TBlock["hash"]>;
  logsBloom: NonNullable<TBlock["logsBloom"]>;
  nonce: NonNullable<TBlock["nonce"]>;
  number: NonNullable<TBlock["number"]>;
};

export function isNonPendingBlock<TBlock extends Block>(block: TBlock): block is NonPendingBlock<TBlock> {
  return block.hash != null && block.logsBloom != null && block.nonce != null && block.number != null;
}
