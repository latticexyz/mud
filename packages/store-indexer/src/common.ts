import { Hex } from "viem";
import type { Table, TableRecord } from "@latticexyz/store-sync";

export type { Table, TableRecord };

export type TableWithRecords = Table & { records: TableRecord[] };

export type StorageAdapter = {
  findAll: (chainId: number, address: Hex) => Promise<{ blockNumber: bigint | null; tables: TableWithRecords[] }>;
};
