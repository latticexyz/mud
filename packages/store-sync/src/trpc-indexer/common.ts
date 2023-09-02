import { Hex } from "viem";
import { TableWithRecords } from "../common";

export type QueryAdapter = {
  findAll: (
    chainId: number,
    address?: Hex
  ) => Promise<{
    blockNumber: bigint | null;
    tables: TableWithRecords[];
  }>;
};
