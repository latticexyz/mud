import { setupMUDV2Network } from "@latticexyz/std-client";
import { createFastTxExecutor, createFaucetService } from "@latticexyz/network";
import { getNetworkConfig } from "./getNetworkConfig";
import { defineContractComponents } from "./contractComponents";
import { clientComponents } from "./clientComponents";
import { world } from "./world";
import { Contract, Signer, utils } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { IWorld__factory } from "contracts/types/ethers-contracts/factories/IWorld__factory";
import { awaitStreamValue, getTableIds } from "@latticexyz/utils";
import { getSnapSyncRecords } from "./snapSync";
import storeConfig from "contracts/mud.config";

export type SetupResult = Awaited<ReturnType<typeof setup>>;

export async function setup() {
  const contractComponents = defineContractComponents(world);
  const networkConfig = await getNetworkConfig();
  const result = await setupMUDV2Network<typeof contractComponents, typeof storeConfig>({
    networkConfig,
    world,
    contractComponents,
    syncThread: "main",
    storeConfig,
    worldAbi: IWorld__factory.abi,
  });

  // Request drip from faucet
  const signer = result.network.signer.get();
  if (networkConfig.faucetServiceUrl && signer) {
    const address = await signer.getAddress();
    console.info("[Dev Faucet]: Player address -> ", address);

    const faucet = createFaucetService(networkConfig.faucetServiceUrl);

    const requestDrip = async () => {
      const balance = await signer.getBalance();
      console.info(`[Dev Faucet]: Player balance -> ${balance}`);
      const lowBalance = balance?.lte(utils.parseEther("1"));
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

  const signerOrProvider = signer ?? result.network.providers.get().json;
  // Create a World contract instance
  const worldContract = IWorld__factory.connect(networkConfig.worldAddress, signerOrProvider);

  const currentBlockNumber = await awaitStreamValue(result.network.blockNumber$);

  if (networkConfig.snapSync) {
    const tableRecords = await getSnapSyncRecords(
      networkConfig.worldAddress,
      getTableIds(storeConfig),
      currentBlockNumber,
      signerOrProvider
    );

    console.log(`Syncing ${tableRecords.length} records`);
    result.startSync(tableRecords, currentBlockNumber);
  } else {
    result.startSync();
  }

  // Create a fast tx executor
  const fastTxExecutor =
    signer?.provider instanceof JsonRpcProvider
      ? await createFastTxExecutor(signer as Signer & { provider: JsonRpcProvider })
      : null;

  // TODO: infer this from fastTxExecute signature?
  type BoundFastTxExecuteFn<C extends Contract> = <F extends keyof C>(
    func: F,
    args: Parameters<C[F]>,
    options?: {
      retryCount?: number;
    }
  ) => Promise<ReturnType<C[F]>>;

  function bindFastTxExecute<C extends Contract>(contract: C): BoundFastTxExecuteFn<C> {
    return async function (...args) {
      if (!fastTxExecutor) {
        throw new Error("no signer");
      }
      const { tx } = await fastTxExecutor.fastTxExecute(contract, ...args);
      return await tx;
    };
  }

  return {
    ...result,
    components: {
      ...result.components,
      ...clientComponents,
    },
    worldContract,
    worldSend: bindFastTxExecute(worldContract),
    fastTxExecutor,
  };
}
