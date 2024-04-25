import { Observable } from "rxjs";
import { Abi, Block, Chain, PublicClient, Transport, WalletClient } from "viem";
import { StoreConfig } from "@latticexyz/store";
import { StorageAdapterBlock } from "@latticexyz/store-sync";
import { ZustandStore } from "@latticexyz/store-sync/zustand";
import { ContractWrite } from "@latticexyz/common";
import { World as RecsWorld } from "@latticexyz/recs";

export type DevToolsOptions<config extends StoreConfig = StoreConfig> = {
  config: config;
  publicClient: PublicClient<Transport, Chain>;
  walletClient: WalletClient<Transport, Chain>;
  latestBlock$: Observable<Block>;
  storedBlockLogs$: Observable<StorageAdapterBlock>;
  worldAddress: string | null;
  worldAbi: Abi;
  write$: Observable<ContractWrite>;
  recsWorld?: RecsWorld;
  // TODO: figure out why using `Tables` here causes downstream type errors
  useStore?: ZustandStore<any>;
};
