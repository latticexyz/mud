import { BlockNumber } from "viem";

export type BlockRange = {
  /**
   * The first block included in the range.
   */
  fromBlock: BlockNumber;
  /**
   * The last block included in the range.
   */
  toBlock: BlockNumber;
};
