import { Observable } from "rxjs";
import { Abi, Block, Chain, PublicClient, Transport, WalletClient } from "viem";
import { StoreConfig } from "@latticexyz/store";
import { BlockStorageOperations } from "@latticexyz/store-sync";

export type DevToolsOptions<TConfig extends StoreConfig = StoreConfig> = {
  config: TConfig;
  publicClient: PublicClient<Transport, Chain>;
  walletClient: WalletClient<Transport, Chain>;
  latestBlock$: Observable<Block>;
  blockStorageOperations$: Observable<BlockStorageOperations<TConfig>>;
  worldAddress: string | null;
  worldAbi: Abi;
};
