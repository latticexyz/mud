import { Hex } from "viem";
import { TableWithRecords } from "../common";

export type QueryAdapter = {
  findAll: (opts: { chainId: number; address?: Hex; tableIds?: Hex[]; matchId?: number }) => Promise<{
    blockNumber: bigint | null;
    tables: TableWithRecords[];
  }>;
};
