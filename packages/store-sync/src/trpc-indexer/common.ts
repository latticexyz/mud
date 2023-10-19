import { Hex } from "viem";
import { SyncFilter, TableWithRecords } from "../common";

export type QueryAdapter = {
  findAll: (opts: { chainId: number; address?: Hex; filters?: SyncFilter[] }) => Promise<{
    blockNumber: bigint | null;
    tables: TableWithRecords[];
  }>;
};
