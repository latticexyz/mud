import { Address, Block, Hex, Log, PublicClient, TransactionReceipt } from "viem";
import { StoreEventsAbiItem, StoreEventsAbi } from "@latticexyz/store";
import { Observable } from "rxjs";
import { UnionPick } from "@latticexyz/common/type-utils";
import {
  ValueArgs,
  getKeySchema,
  getSchemaPrimitives,
  getSchemaTypes,
  getValueSchema,
} from "@latticexyz/protocol-parser/internal";
import storeConfig from "@latticexyz/store/mud.config";
import worldConfig from "@latticexyz/world/mud.config";
import { Table as ConfigTable, Schema } from "@latticexyz/config";
import { configToTables } from "./configToTables";

export const mudTables = {
  ...configToTables(storeConfig),
  ...configToTables(worldConfig),
} as const;
export type mudTables = typeof mudTables;

export const internalTableIds = Object.values(mudTables).map((table) => table.tableId);

export type ChainId = number;
export type WorldId = `${ChainId}:${Address}`;

// TODO: add label and namespaceLabel once we register it onchain
export type DeployedTable = Omit<ConfigTable, "label" | "namespaceLabel">;

export type TableRecord<table extends DeployedTable = DeployedTable> = {
  readonly key: getSchemaPrimitives<getKeySchema<table>>;
  readonly value: getSchemaPrimitives<getValueSchema<table>>;
  readonly fields: getSchemaPrimitives<table["schema"]>;
};

export type Table<table extends DeployedTable = DeployedTable> = table & {
  readonly address: Address;
  readonly keySchema: getSchemaTypes<DeployedTable extends table ? Schema : getKeySchema<table>>;
  readonly valueSchema: getSchemaTypes<DeployedTable extends table ? Schema : getValueSchema<table>>;
};

export type TableWithRecords<table extends DeployedTable = DeployedTable> = Table<table> & {
  readonly records: readonly TableRecord<table>[];
};

export type StoreEventsLog = Log<bigint, number, false, StoreEventsAbiItem, true, StoreEventsAbi>;
export type BlockLogs = { blockNumber: StoreEventsLog["blockNumber"]; logs: readonly StoreEventsLog[] };

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

export type SyncOptions = {
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
   * Optional block tag to follow for the latest block number. Defaults to `latest`. It's recommended to use `safe` for indexers.
   */
  followBlockTag?: "latest" | "safe" | "finalized";
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
  indexerUrl?: string | false;
  /**
   * Optional initial state to hydrate from. Useful if you're hydrating from an indexer or cache.
   * @deprecated Use `initialLogs` option instead.
   */
  initialState?: {
    blockNumber: bigint;
    tables: readonly TableWithRecords[];
  };
  /**
   * Optional initial logs to hydrate from. Useful if you're hydrating from an indexer or cache.
   */
  initialBlockLogs?: {
    blockNumber: bigint;
    logs: readonly StorageAdapterLog[];
  };
  /**
   * Optional WebSocket URL with `wiresaw_getLogs` and `wiresaw_watchLogs` RPC support for syncing with pending logs.
   * Note: this is an experimental feature and might be changed in the future.
   */
  experimentalPendingLogsWebSocketRpcUrl?: string;
};

export type WaitForTransactionResult = Pick<TransactionReceipt, "blockNumber" | "status" | "transactionHash">;

export type SyncResult = {
  latestBlock$: Observable<Block>;
  latestBlockNumber$: Observable<bigint>;
  storedBlockLogs$: Observable<StorageAdapterBlock>;
  waitForTransaction: (tx: Hex) => Promise<WaitForTransactionResult>;
};

// TODO: add optional, original log to this?
export type StorageAdapterLog = Partial<StoreEventsLog> & UnionPick<StoreEventsLog, "address" | "eventName" | "args">;
export type StorageAdapterBlock = { blockNumber: BlockLogs["blockNumber"]; logs: readonly StorageAdapterLog[] };
export type StorageAdapter = (block: StorageAdapterBlock) => Promise<void>;

export const schemasTable = {
  ...mudTables.Tables,
  keySchema: getSchemaTypes(getKeySchema(mudTables.Tables)),
  valueSchema: getSchemaTypes(getValueSchema(mudTables.Tables)),
};

export const emptyValueArgs = {
  staticData: "0x",
  encodedLengths: "0x",
  dynamicData: "0x",
} as const satisfies ValueArgs;
