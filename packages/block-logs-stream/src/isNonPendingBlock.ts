import type { Block } from "viem";

// TODO: get rid of this once https://github.com/wagmi-dev/viem/pull/847 lands

export type NonPendingBlock<TBlock extends Block> = TBlock & {
  hash: NonNullable<TBlock["hash"]>;
  logsBloom: NonNullable<TBlock["logsBloom"]>;
  nonce: NonNullable<TBlock["nonce"]>;
  number: NonNullable<TBlock["number"]>;
};

export function isNonPendingBlock<TBlock extends Block>(block: TBlock): block is NonPendingBlock<TBlock> {
  return block.hash != null && block.logsBloom != null && block.nonce != null && block.number != null;
}
