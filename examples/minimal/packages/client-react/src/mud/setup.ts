import { setupMUDV2Network } from "@latticexyz/std-client";
import { RawTableRecord, createFastTxExecutor, createFaucetService } from "@latticexyz/network";
import { getNetworkConfig } from "./getNetworkConfig";
import { defineContractComponents } from "./contractComponents";
import { clientComponents } from "./clientComponents";
import { world } from "./world";
import { Contract, Signer, utils } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { IWorld__factory } from "contracts/types/ethers-contracts/factories/IWorld__factory";
import { TableId, awaitStreamValue } from "@latticexyz/utils";

export type SetupResult = Awaited<ReturnType<typeof setup>>;

export async function setup() {
  const contractComponents = defineContractComponents(world);
  const networkConfig = await getNetworkConfig();
  const result = await setupMUDV2Network<typeof contractComponents>({
    networkConfig,
    world,
    contractComponents,
    syncThread: "main",
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

  // Create a World contract instance
  const worldContract = IWorld__factory.connect(
    networkConfig.worldAddress,
    signer ?? result.network.providers.get().json
  );

  const currentBlockNumber = await awaitStreamValue(result.network.blockNumber$);

  if (networkConfig.snapSync) {
    const chunkSize = 100;
    const tableIds = Object.values(contractComponents).map((c) => c.metadata.contractId);
    const tableRecords = [] as RawTableRecord[];
    for (const tableId of tableIds) {
      const numKeys = (await worldContract.getNumKeys(tableId, { blockTag: currentBlockNumber })).toNumber();
      console.log(`Syncing table ${tableId} with ${numKeys} keys`);
      if (numKeys === 0) continue;

      let remainingKeys = numKeys;
      const numChunks = Math.ceil(numKeys / chunkSize);
      for (let i = 0; i < numChunks; i++) {
        const limit = Math.min(remainingKeys, chunkSize);
        const offset = i * chunkSize;
        remainingKeys -= limit;

        const records = await worldContract.getRecords(tableId, limit, offset, { blockTag: currentBlockNumber });
        const transformedRecords = records.map((record) => {
          return {
            tableId: TableId.fromHexString(record[0]),
            keyTuple: record[1],
            value: record[2],
          };
        });
        tableRecords.push(...transformedRecords);
      }
    }

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
