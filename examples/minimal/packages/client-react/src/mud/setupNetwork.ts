import { getBurnerWallet } from "@latticexyz/std-client";
import { getNetworkConfig } from "./getNetworkConfig";
import { defineContractComponents } from "./contractComponents";
import { world } from "./world";
import { IWorld__factory } from "contracts/types/ethers-contracts/factories/IWorld__factory";
import storeConfig from "contracts/mud.config";
import { createPublicClient, fallback, webSocket, http, createWalletClient, getContract, Hex } from "viem";
import { syncToRecs } from "@latticexyz/store-sync/recs";
import { privateKeyToAccount } from "viem/accounts";

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;

export async function setupNetwork() {
  const contractComponents = defineContractComponents(world);
  const networkConfig = await getNetworkConfig();

  const publicClient = createPublicClient({
    chain: networkConfig.chain,
    transport: fallback([webSocket(), http()]),
    pollingInterval: 1000,
  });

  syncToRecs({
    config: storeConfig,
    address: networkConfig.worldAddress as Hex,
    publicClient,
    components: contractComponents,
  });

  const singletonEntity = world.registerEntity({ id: "entity:" });

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
