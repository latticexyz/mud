import { Result } from "@ethersproject/abi";
import { Components, ExtendableECSEvent } from "@latticexyz/recs";
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

export type ECSEventWithTx<C extends Components> = ExtendableECSEvent<
  C,
  { lastEventInTx: boolean; txHash: string; entity: string }
>;

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
