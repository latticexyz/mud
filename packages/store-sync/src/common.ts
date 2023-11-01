import { Address, Block, Hex, Log, PublicClient } from "viem";
import { StoreConfig, StoreEventsAbiItem, StoreEventsAbi, resolveConfig } from "@latticexyz/store";
import { Observable } from "rxjs";
import { UnionPick } from "@latticexyz/common/type-utils";
import { KeySchema, TableRecord, ValueSchema } from "@latticexyz/protocol-parser";
import storeConfig from "@latticexyz/store/mud.config";
import worldConfig from "@latticexyz/world/mud.config";
import { flattenSchema } from "./flattenSchema";

/** @internal Temporary workaround until we redo our config parsing and can pull this directly from the config (https://github.com/latticexyz/mud/issues/1668) */
export const storeTables = resolveConfig(storeConfig).tables;
/** @internal Temporary workaround until we redo our config parsing and can pull this directly from the config (https://github.com/latticexyz/mud/issues/1668) */
export const worldTables = resolveConfig(worldConfig).tables;

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

// only two keys for now, to reduce complexity of creating indexes on SQL tables
// TODO: make tableId optional to enable filtering just on keys (any table)
//       this is blocked on reworking data storage so we can more easily query data across tables
export type SyncFilter = {
  /**
   * Filter by the `bytes32` table ID.
   */
  tableId: Hex;
  /**
   * Optionally filter by the `bytes32` value of the key in the first position (index zero of the record's key tuple).
   */
  key0?: Hex;
  /**
   * Optionally filter by the `bytes32` value of the key in the second position (index one of the record's key tuple).
   */
  key1?: Hex;
};

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
   * Optional filters for indexer and RPC state. Useful to narrow down the data received by the client for large worlds.
   */
  filters?: SyncFilter[];
  /**
   * @deprecated Use `filters` option instead.
   * */
  tableIds?: Hex[];
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

export const schemasTableId = storeTables.Tables.tableId;
export const schemasTable = {
  ...storeTables.Tables,
  // TODO: remove once we've got everything using the new Table shape
  keySchema: flattenSchema(storeTables.Tables.keySchema),
  valueSchema: flattenSchema(storeTables.Tables.valueSchema),
};
