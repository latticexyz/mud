import { createPublicClient, fallback, webSocket, http, createWalletClient, getContract, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createIndexerClient } from "@latticexyz/store-indexer";
import { getBurnerWallet } from "@latticexyz/std-client";
import { syncToRecs } from "@latticexyz/store-sync/recs";
import { IWorld__factory } from "contracts/types/ethers-contracts/factories/IWorld__factory";
import storeConfig from "contracts/mud.config";
import { world } from "./world";
import { defineContractComponents } from "./contractComponents";
import { getNetworkConfig } from "./getNetworkConfig";

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;

export async function setupNetwork() {
  const contractComponents = defineContractComponents(world);
  const networkConfig = await getNetworkConfig();

  const publicClient = createPublicClient({
    chain: networkConfig.chain,
    transport: fallback([webSocket(), http()]),
    pollingInterval: 1000,
  });

  const indexer = createIndexerClient({ url: "http://127.0.0.1:3001" });
  const initialState = await (async () => {
    try {
      return await indexer.findAll.query({
        chainId: publicClient.chain.id,
        address: networkConfig.worldAddress as Hex,
      });
    } catch (error) {
      console.log("couldn't get initial state from indexer", error);
      return undefined;
    }
  })();

  const { singletonEntity } = await syncToRecs({
    world,
    config: storeConfig,
    address: networkConfig.worldAddress as Hex,
    publicClient,
    components: contractComponents,
    initialState,
  });

  const burnerAccount = privateKeyToAccount(getBurnerWallet().value);
  const burnerWalletClient = createWalletClient({
    account: burnerAccount,
    chain: networkConfig.chain,
    transport: fallback([webSocket(), http()]),
    // TODO: configure polling per chain? maybe in the MUDChain config?
    pollingInterval: 1000,
  });

  return {
    components: contractComponents,
    singletonEntity,
    publicClient,
    walletClient: burnerWalletClient,
    world: getContract({
      address: networkConfig.worldAddress as Hex,
      abi: IWorld__factory.abi,
      publicClient,
      walletClient: burnerWalletClient,
    }),
  };
}
