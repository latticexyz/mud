import { Hex } from "viem";
import { TableWithRecords } from "../common";

export type StorageAdapter = {
  findAll: (
    chainId: number,
    address?: Hex
  ) => Promise<{
    blockNumber: bigint | null;
    tables: TableWithRecords[];
  }>;
};
