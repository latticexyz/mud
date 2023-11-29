import { Hex } from "viem";
import { StorageAdapterBlock, SyncFilter, TableWithRecords } from "../common";

export type QueryAdapter = {
  /**
   * @deprecated
   */
  findAll: (opts: { chainId: number; address?: Hex; filters?: SyncFilter[] }) => Promise<{
    blockNumber: bigint | null;
    tables: TableWithRecords[];
  }>;
  getLogs: (opts: {
    readonly chainId: number;
    readonly address?: Hex;
    readonly filters?: readonly SyncFilter[];
  }) => Promise<StorageAdapterBlock>;
};
