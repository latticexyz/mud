import { Address, Block, Hex, Log, PublicClient } from "viem";
import { StoreConfig, StoreEventsAbiItem, StoreEventsAbi } from "@latticexyz/store";
import storeConfig from "@latticexyz/store/mud.config";
import { Observable } from "rxjs";
import { tableIdToHex } from "@latticexyz/common";
import { UnionPick } from "@latticexyz/common/type-utils";
import { KeySchema, TableRecord, ValueSchema } from "@latticexyz/protocol-parser";

export type ChainId = number;
export type WorldId = `${ChainId}:${Address}`;

export type TableNamespace = string;
export type TableName = string;

export type Table = {
  address: Address;
  tableId: Hex;
  namespace: TableNamespace;
  name: TableName;
  keySchema: KeySchema;
  valueSchema: ValueSchema;
};

export type TableWithRecords = Table & { records: TableRecord[] };

export type StoreEventsLog = Log<bigint, number, false, StoreEventsAbiItem, true, StoreEventsAbi>;
export type BlockLogs = { blockNumber: StoreEventsLog["blockNumber"]; logs: StoreEventsLog[] };

export type BaseStorageOperation<TConfig extends StoreConfig> = {
  log?: StoreEventsLog;
  address: Hex;
  namespace: TableNamespace;
  name: keyof TConfig["tables"] & TableName;
  key: readonly Hex[];
};

export type SetRecordOperation<TConfig extends StoreConfig> = BaseStorageOperation<TConfig> & {
  type: "SetRecord";
  data: Hex;
};

export type SpliceRecordOperation<TConfig extends StoreConfig> = BaseStorageOperation<TConfig> & {
  type: "SpliceRecord";
  data: Hex;
  start: number;
  deleteCount: number;
};

export type DeleteRecordOperation<TConfig extends StoreConfig> = BaseStorageOperation<TConfig> & {
  type: "DeleteRecord";
};

export type StorageOperation<TConfig extends StoreConfig> =
  | SetRecordOperation<TConfig>
  | SpliceRecordOperation<TConfig>
  | DeleteRecordOperation<TConfig>;

export type SyncOptions<TConfig extends StoreConfig = StoreConfig> = {
  /**
   * MUD config
   */
  config?: TConfig;
  /**
   * [viem `PublicClient`][0] used for fetching logs from the RPC.
   *
   * [0]: https://viem.sh/docs/clients/public.html
   */
  publicClient: PublicClient;
  /**
   * MUD Store/World contract address
   */
  address?: Address;
  /**
   * Optional block number to start indexing from. Useful for resuming the indexer from a particular point in time or starting after a particular contract deployment.
   */
  startBlock?: bigint;
  /**
   * Optional maximum block range, if your RPC limits the amount of blocks fetched at a time.
   */
  maxBlockRange?: bigint;
  /**
   * Optional MUD tRPC indexer URL to fetch initial state from.
   */
  indexerUrl?: string;
  /**
   * Optional initial state to hydrate from. Useful if you're hydrating from your own indexer or cache.
   */
  initialState?: {
    blockNumber: bigint | null;
    tables: TableWithRecords[];
  };
};

export type SyncResult = {
  latestBlock$: Observable<Block>;
  latestBlockNumber$: Observable<bigint>;
  blockLogs$: Observable<BlockLogs>;
  storedBlockLogs$: Observable<StorageAdapterBlock>;
  waitForTransaction: (tx: Hex) => Promise<void>;
};

// TODO: add optional, original log to this?
export type StorageAdapterLog = Partial<StoreEventsLog> & UnionPick<StoreEventsLog, "address" | "eventName" | "args">;
export type StorageAdapterBlock = { blockNumber: BlockLogs["blockNumber"]; logs: StorageAdapterLog[] };
export type StorageAdapter = (block: StorageAdapterBlock) => Promise<void>;

// TODO: adjust when we get namespace support (https://github.com/latticexyz/mud/issues/994) and when table has namespace key (https://github.com/latticexyz/mud/issues/1201)
export const schemasTable = storeConfig.tables.Tables;
export const schemasTableId = tableIdToHex(storeConfig.namespace, schemasTable.name);
