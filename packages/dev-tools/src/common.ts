import { Observable } from "rxjs";
import { Abi, Block, Chain, PublicClient, Transport, WalletClient } from "viem";
import { StoreConfig } from "@latticexyz/store";
import { StorageAdapterBlock } from "@latticexyz/store-sync";
import { ContractWrite } from "@latticexyz/common";
import { World as RecsWorld } from "@latticexyz/recs";

export type DevToolsOptions = {
  config: StoreConfig;
  publicClient: PublicClient<Transport, Chain>;
  walletClient: WalletClient<Transport, Chain>;
  latestBlock$: Observable<Block>;
  storedBlockLogs$: Observable<StorageAdapterBlock>;
  worldAddress: string | null;
  worldAbi: Abi;
  write$: Observable<ContractWrite>;
  recsWorld?: RecsWorld;
};
