import { Address, Block, Hex, Log, PublicClient, TransactionReceipt } from "viem";
import { GroupLogsByBlockNumberResult } from "@latticexyz/block-logs-stream";
import {
  StoreConfig,
  KeySchema,
  ValueSchema,
  ConfigToKeyPrimitives as Key,
  ConfigToValuePrimitives as Value,
  TableRecord,
  StoreEventsAbiItem,
  StoreEventsAbi,
} from "@latticexyz/store";
import { Observable } from "rxjs";
import { BlockStorageOperations } from "./blockLogsToStorage";

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
export type BlockLogs = GroupLogsByBlockNumberResult<StoreEventsLog>[number];

export type BaseStorageOperation = {
  log?: StoreEventsLog;
  address: Hex;
  namespace: TableNamespace;
  name: TableName;
};

export type SetRecordOperation<TConfig extends StoreConfig> = BaseStorageOperation & {
  type: "SetRecord";
} & {
    [TTable in keyof TConfig["tables"]]: {
      name: TTable & string;
      key: Key<TConfig, TTable>;
      value: Value<TConfig, TTable>;
    };
  }[keyof TConfig["tables"]];

export type SetFieldOperation<TConfig extends StoreConfig> = BaseStorageOperation & {
  type: "SetField";
} & {
    [TTable in keyof TConfig["tables"]]: {
      name: TTable & string;
      key: Key<TConfig, TTable>;
    } & {
      [TValue in keyof Value<TConfig, TTable>]: {
        fieldName: TValue & string;
        fieldValue: Value<TConfig, TTable>[TValue];
      };
    }[keyof Value<TConfig, TTable>];
  }[keyof TConfig["tables"]];

export type DeleteRecordOperation<TConfig extends StoreConfig> = BaseStorageOperation & {
  type: "DeleteRecord";
} & {
    [TTable in keyof TConfig["tables"]]: {
      name: TTable & string;
      key: Key<TConfig, TTable>;
    };
  }[keyof TConfig["tables"]];

export type StorageOperation<TConfig extends StoreConfig> =
  | SetFieldOperation<TConfig>
  | SetRecordOperation<TConfig>
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

export type SyncResult<TConfig extends StoreConfig = StoreConfig> = {
  latestBlock$: Observable<Block>;
  latestBlockNumber$: Observable<bigint>;
  blockLogs$: Observable<BlockLogs>;
  blockStorageOperations$: Observable<BlockStorageOperations<TConfig>>;
  waitForTransaction: (tx: Hex) => Promise<void>;
};

export type StorageAdapter<TConfig extends StoreConfig = StoreConfig> = {
  registerTables: (opts: { blockNumber: BlockLogs["blockNumber"]; tables: Table[] }) => Promise<void>;
  getTables: (opts: {
    blockNumber: BlockLogs["blockNumber"];
    tables: Pick<Table, "address" | "namespace" | "name">[];
  }) => Promise<Table[]>;
  storeOperations: (opts: {
    blockNumber: BlockLogs["blockNumber"];
    operations: StorageOperation<TConfig>[];
  }) => Promise<void>;
};
