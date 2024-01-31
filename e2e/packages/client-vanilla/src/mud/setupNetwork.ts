import { createPublicClient, http, createWalletClient, Hex, parseEther, ClientConfig, stringToHex } from "viem";
import { createFaucetService } from "@latticexyz/services/faucet";
import { encodeEntity, syncToRecs } from "@latticexyz/store-sync/recs";
import { getNetworkConfig } from "./getNetworkConfig";
import { world } from "./world";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import { createBurnerAccount, getContract, resourceToHex, transportObserver } from "@latticexyz/common";
import mudConfig from "contracts/mud.config";

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;

export async function setupNetwork() {
  const networkConfig = await getNetworkConfig();

  const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(http(networkConfig.rpcHttpUrl ?? undefined)),
    pollingInterval: 1000,
  } as const satisfies ClientConfig;

  const publicClient = createPublicClient(clientOptions);

  const burnerAccount = createBurnerAccount(networkConfig.privateKey as Hex);
  const burnerWalletClient = createWalletClient({
    ...clientOptions,
    account: burnerAccount,
  });

  const worldContract = getContract({
    address: networkConfig.worldAddress as Hex,
    abi: IWorldAbi,
    publicClient,
    walletClient: burnerWalletClient,
  });

  const { components, latestBlock$, storedBlockLogs$, waitForTransaction } = await syncToRecs({
    world,
    config: mudConfig,
    address: networkConfig.worldAddress as Hex,
    publicClient,
    startBlock: BigInt(networkConfig.initialBlockNumber),
    indexerUrl: networkConfig.indexerUrl ?? undefined,
    filters: Object.entries(mudConfig.tables).map(([, table]) => {
      const tableId = resourceToHex({
        type: table.offchainOnly ? "offchainTable" : "table",
        namespace: mudConfig.namespace,
        name: table.name,
      });
      if (table.name === mudConfig.tables.Position.name) {
        return {
          tableId,
          key0: stringToHex("map1", { size: 32 }),
        };
      } else {
        return { tableId };
      }
    }),
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
    storedBlockLogs$,
    waitForTransaction,
  };
}
