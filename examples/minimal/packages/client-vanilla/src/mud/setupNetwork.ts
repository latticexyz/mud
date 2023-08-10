import { createPublicClient, fallback, webSocket, http, createWalletClient, Hex, parseEther, ClientConfig } from "viem";
import { createFaucetService } from "@latticexyz/network";
import { encodeEntity, syncToRecs } from "@latticexyz/store-sync/recs";
import { getNetworkConfig } from "./getNetworkConfig";
import { defineContractComponents } from "./contractComponents";
import { world } from "./world";
import { IWorld__factory } from "contracts/types/ethers-contracts/factories/IWorld__factory";
import storeConfig from "contracts/mud.config";
import { createBurnerAccount, createContract, transportObserver } from "@latticexyz/common";

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;

export async function setupNetwork() {
  const contractComponents = defineContractComponents(world);
  const networkConfig = await getNetworkConfig();

  const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(fallback([webSocket(), http()])),
    pollingInterval: 1000,
  } as const satisfies ClientConfig;

  const publicClient = createPublicClient(clientOptions);

  const burnerAccount = createBurnerAccount(networkConfig.privateKey as Hex);
  const burnerWalletClient = createWalletClient({
    ...clientOptions,
    account: burnerAccount,
  });

  const worldContract = createContract({
    address: networkConfig.worldAddress as Hex,
    abi: IWorld__factory.abi,
    publicClient,
    walletClient: burnerWalletClient,
  });

  const { components, latestBlock$, blockStorageOperations$, waitForTransaction } = await syncToRecs({
    world,
    config: storeConfig,
    address: networkConfig.worldAddress as Hex,
    publicClient,
    components: contractComponents,
    startBlock: BigInt(networkConfig.initialBlockNumber),
  });

  // Request drip from faucet
  if (networkConfig.faucetServiceUrl) {
    const address = burnerAccount.address;
    console.info("[Dev Faucet]: Player address -> ", address);

    const faucet = createFaucetService(networkConfig.faucetServiceUrl);

    const requestDrip = async () => {
      const balance = await publicClient.getBalance({ address });
      console.info(`[Dev Faucet]: Player balance -> ${balance}`);
      const lowBalance = balance < parseEther("1");
      if (lowBalance) {
        console.info("[Dev Faucet]: Balance is low, dripping funds to player");
        // Double drip
        await faucet.dripDev({ address });
        await faucet.dripDev({ address });
      }
    };

    requestDrip();
    // Request a drip every 20 seconds
    setInterval(requestDrip, 20000);
  }

  return {
    world,
    components,
    playerEntity: encodeEntity({ address: "address" }, { address: burnerWalletClient.account.address }),
    publicClient,
    walletClient: burnerWalletClient,
    worldContract,
    latestBlock$,
    blockStorageOperations$,
    waitForTransaction,
  };
}
