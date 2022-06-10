import { Result } from "@ethersproject/abi";
import { Components, ComponentValue, SchemaOf } from "@latticexyz/recs";
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

export type ContractTopics<C extends Contracts> = {
  key: keyof C;
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
