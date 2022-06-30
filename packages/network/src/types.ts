import { Result } from "@ethersproject/abi";
import { Components, ComponentValue, EntityID, SchemaOf } from "@latticexyz/recs";
import { Cached } from "@latticexyz/utils";
import { BaseContract, ContractInterface } from "ethers";
import { Observable } from "rxjs";
import { createNetwork } from "./createNetwork";
import { createProvider } from "./createProvider";

export interface NetworkConfig {
  chainId: number;
  privateKey?: string;
  clock: ClockConfig;
  provider: ProviderConfig;
  checkpointServiceUrl?: string;
  initialBlockNumber?: number;
}

export interface ClockConfig {
  period: number;
  initialTime: number;
  syncInterval: number;
}

export type Clock = {
  time$: Observable<number>;
  currentTime: number;
  lastUpdateTime: number;
  update: (time: number, maintainStale?: boolean) => void;
  dispose: () => void;
};

export interface ProviderConfig {
  jsonRpcUrl: string;
  wsRpcUrl?: string;
  options?: { batch?: boolean; pollingInterval?: number; skipNetworkCheck?: boolean };
}

export type Providers = ReturnType<typeof createProvider>;
export type Network = Awaited<ReturnType<typeof createNetwork>>;

export type Contracts = {
  [key: string]: BaseContract;
};

export type ContractConfig = {
  address: string;
  abi: ContractInterface;
};

export type ContractsConfig<C extends Contracts> = {
  [key in keyof C]: ContractConfig;
};

export type TxQueue<C extends Contracts> = Cached<C>;

export type ContractTopics = {
  key: string;
  topics: string[][];
};

export type ContractEvent<C extends Contracts> = {
  contractKey: keyof C;
  eventKey: string;
  args: Result;
  txHash: string;
  lastEventInTx: boolean;
};

// Mapping from hashed contract component id to client component key
export type Mappings<C extends Components> = {
  [hashedContractId: string]: keyof C;
};

export type NetworkComponentUpdate<C extends Components> = {
  [key in keyof C]: {
    component: key;
    value: ComponentValue<SchemaOf<C[key]>> | undefined;
  };
}[keyof C] & {
  entity: EntityID;
  lastEventInTx: boolean;
  txHash: string;
  blockNumber: number;
};

export type SyncWorkerConfig<Cm extends Components = Components> = {
  provider: ProviderConfig;
  initialBlockNumber: number;
  worldContract: ContractConfig;
  mappings: Mappings<Cm>;
  disableCache?: boolean;
  chainId: number;
  checkpointServiceUrl?: string;
};

export enum ContractSchemaValue {
  BOOL,
  INT8,
  INT16,
  INT32,
  INT64,
  INT128,
  INT256,
  INT,
  UINT8,
  UINT16,
  UINT32,
  UINT64,
  UINT128,
  UINT256,
  BYTES,
  STRING,
  BOOL_ARRAY,
  INT8_ARRAY,
  INT16_ARRAY,
  INT32_ARRAY,
  INT64_ARRAY,
  INT128_ARRAY,
  INT256_ARRAY,
  INT_ARRAY,
  UINT8_ARRAY,
  UINT16_ARRAY,
  UINT32_ARRAY,
  UINT64_ARRAY,
  UINT128_ARRAY,
  UINT256_ARRAY,
  BYTES_ARRAY,
  STRING_ARRAY,
}

export const ContractSchemaValueId: { [key in ContractSchemaValue]: string } = {
  [ContractSchemaValue.BOOL]: "bool",
  [ContractSchemaValue.INT8]: "int8",
  [ContractSchemaValue.INT16]: "int16",
  [ContractSchemaValue.INT32]: "int32",
  [ContractSchemaValue.INT64]: "int64",
  [ContractSchemaValue.INT128]: "int128",
  [ContractSchemaValue.INT256]: "int256",
  [ContractSchemaValue.INT]: "int",
  [ContractSchemaValue.UINT8]: "uint8",
  [ContractSchemaValue.UINT16]: "uint16",
  [ContractSchemaValue.UINT32]: "uint32",
  [ContractSchemaValue.UINT64]: "uint64",
  [ContractSchemaValue.UINT128]: "uint128",
  [ContractSchemaValue.UINT256]: "uint256",
  [ContractSchemaValue.BYTES]: "bytes",
  [ContractSchemaValue.STRING]: "string",
  [ContractSchemaValue.BOOL_ARRAY]: "bool[]",
  [ContractSchemaValue.INT8_ARRAY]: "int8[]",
  [ContractSchemaValue.INT16_ARRAY]: "int16[]",
  [ContractSchemaValue.INT32_ARRAY]: "int32[]",
  [ContractSchemaValue.INT64_ARRAY]: "int64[]",
  [ContractSchemaValue.INT128_ARRAY]: "int128[]",
  [ContractSchemaValue.INT256_ARRAY]: "int256[]",
  [ContractSchemaValue.INT_ARRAY]: "int[]",
  [ContractSchemaValue.UINT8_ARRAY]: "uint8[]",
  [ContractSchemaValue.UINT16_ARRAY]: "uint16[]",
  [ContractSchemaValue.UINT32_ARRAY]: "uint32[]",
  [ContractSchemaValue.UINT64_ARRAY]: "uint64[]",
  [ContractSchemaValue.UINT128_ARRAY]: "uint128[]",
  [ContractSchemaValue.UINT256_ARRAY]: "uint256[]",
  [ContractSchemaValue.BYTES_ARRAY]: "bytes[]",
  [ContractSchemaValue.STRING_ARRAY]: "string[]",
};

export const ContractSchemaValueArrayToElement = {
  [ContractSchemaValue.BOOL_ARRAY]: ContractSchemaValue.BOOL,
  [ContractSchemaValue.INT8_ARRAY]: ContractSchemaValue.INT8,
  [ContractSchemaValue.INT16_ARRAY]: ContractSchemaValue.INT16,
  [ContractSchemaValue.INT32_ARRAY]: ContractSchemaValue.INT32,
  [ContractSchemaValue.INT64_ARRAY]: ContractSchemaValue.INT64,
  [ContractSchemaValue.INT128_ARRAY]: ContractSchemaValue.INT128,
  [ContractSchemaValue.INT256_ARRAY]: ContractSchemaValue.INT256,
  [ContractSchemaValue.INT_ARRAY]: ContractSchemaValue.INT,
  [ContractSchemaValue.UINT8_ARRAY]: ContractSchemaValue.UINT8,
  [ContractSchemaValue.UINT16_ARRAY]: ContractSchemaValue.UINT16,
  [ContractSchemaValue.UINT32_ARRAY]: ContractSchemaValue.UINT32,
  [ContractSchemaValue.UINT64_ARRAY]: ContractSchemaValue.UINT64,
  [ContractSchemaValue.UINT128_ARRAY]: ContractSchemaValue.UINT128,
  [ContractSchemaValue.UINT256_ARRAY]: ContractSchemaValue.INT256,
  [ContractSchemaValue.BYTES_ARRAY]: ContractSchemaValue.BYTES,
  [ContractSchemaValue.STRING_ARRAY]: ContractSchemaValue.STRING,
} as { [key in ContractSchemaValue]: ContractSchemaValue };

export type ContractSchemaValueTypes = {
  [ContractSchemaValue.BOOL]: boolean;
  [ContractSchemaValue.INT8]: number;
  [ContractSchemaValue.INT16]: number;
  [ContractSchemaValue.INT32]: number;
  [ContractSchemaValue.INT64]: string;
  [ContractSchemaValue.INT128]: string;
  [ContractSchemaValue.INT256]: string;
  [ContractSchemaValue.INT]: string;
  [ContractSchemaValue.UINT8]: number;
  [ContractSchemaValue.UINT16]: number;
  [ContractSchemaValue.UINT32]: number;
  [ContractSchemaValue.UINT64]: string;
  [ContractSchemaValue.UINT128]: string;
  [ContractSchemaValue.UINT256]: string;
  [ContractSchemaValue.BYTES]: string;
  [ContractSchemaValue.STRING]: string;
  [ContractSchemaValue.BOOL_ARRAY]: boolean[];
  [ContractSchemaValue.INT8_ARRAY]: number[];
  [ContractSchemaValue.INT16_ARRAY]: number[];
  [ContractSchemaValue.INT32_ARRAY]: number[];
  [ContractSchemaValue.INT64_ARRAY]: string[];
  [ContractSchemaValue.INT128_ARRAY]: string[];
  [ContractSchemaValue.INT256_ARRAY]: string[];
  [ContractSchemaValue.INT_ARRAY]: string[];
  [ContractSchemaValue.UINT8_ARRAY]: number[];
  [ContractSchemaValue.UINT16_ARRAY]: number[];
  [ContractSchemaValue.UINT32_ARRAY]: number[];
  [ContractSchemaValue.UINT64_ARRAY]: string[];
  [ContractSchemaValue.UINT128_ARRAY]: string[];
  [ContractSchemaValue.UINT256_ARRAY]: string[];
  [ContractSchemaValue.BYTES_ARRAY]: string[];
  [ContractSchemaValue.STRING_ARRAY]: string[];
};
