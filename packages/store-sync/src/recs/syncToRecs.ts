import { StoreConfig } from "@latticexyz/store";
import { World as RecsWorld, getComponentValue, setComponent } from "@latticexyz/recs";
import { SyncOptions, SyncResult } from "../common";
import { RecsStorageAdapter, recsStorage } from "./recsStorage";
import { createStoreSync } from "../createStoreSync";
import { singletonEntity } from "./singletonEntity";
import { SyncStep } from "../SyncStep";
import { Abi, getAbiItem, getFunctionSelector, Hex } from "viem";
import { encodeEntity } from "./encodeEntity";
import { decodeValue, valueSchemaToHex } from "@latticexyz/protocol-parser";
import { AbiFunction } from "abitype";

type SyncToRecsOptions<TConfig extends StoreConfig = StoreConfig> = SyncOptions<TConfig> & {
  world: RecsWorld;
  abi: Abi;
  config: TConfig;
  startSync?: boolean;
};

type SyncToRecsResult<TConfig extends StoreConfig = StoreConfig> = SyncResult<TConfig> & {
  components: RecsStorageAdapter<TConfig>["components"];
  stopSync: () => void;
  getResourceSelector: (functionName: string) => Promise<Hex>;
};

export async function syncToRecs<TConfig extends StoreConfig = StoreConfig>({
  world,
  abi,
  config,
  address,
  publicClient,
  startBlock,
  maxBlockRange,
  initialState,
  indexerUrl,
  startSync = true,
}: SyncToRecsOptions<TConfig>): Promise<SyncToRecsResult<TConfig>> {
  const { storageAdapter, components } = recsStorage({ world, config });

  const storeSync = await createStoreSync({
    storageAdapter,
    config,
    address,
    publicClient,
    startBlock,
    maxBlockRange,
    indexerUrl,
    initialState,
    onProgress: ({ step, percentage, latestBlockNumber, lastBlockNumberProcessed, message }) => {
      if (getComponentValue(components.SyncProgress, singletonEntity)?.step !== SyncStep.LIVE) {
        setComponent(components.SyncProgress, singletonEntity, {
          step,
          percentage,
          latestBlockNumber,
          lastBlockNumberProcessed,
          message,
        });
      }
    },
  });

  const sub = startSync ? storeSync.blockStorageOperations$.subscribe() : null;
  const stopSync = (): void => {
    sub?.unsubscribe();
  };

  world.registerDisposer(stopSync);

  const functionSelectorToResourceSelector = new Map<Hex, Hex>();

  const getResourceSelector = async (functionName: string): Promise<Hex> => {
    const functionSignature = getAbiItem({
      abi,
      name: functionName,
    }) as AbiFunction;

    const worldFunctionSelector = getFunctionSelector(functionSignature);

    if (functionSelectorToResourceSelector.has(worldFunctionSelector)) {
      return functionSelectorToResourceSelector.get(worldFunctionSelector) as Hex;
    }

    const entity = encodeEntity(components.FunctionSelectors.metadata.keySchema, {
      functionSelector: worldFunctionSelector,
    });

    let selectors = getComponentValue(components.FunctionSelectors, entity);

    // If we can't find selectors due to not being synced yet, we can try to read them from the world contract
    if (!selectors) {
      const encodedValueSchema = valueSchemaToHex(components.FunctionSelectors.metadata.valueSchema);

      const selectorRecord = (await publicClient.readContract({
        address: address as Hex,
        abi,
        functionName: "getRecord",
        args: [components.FunctionSelectors.id, [entity], encodedValueSchema],
      })) as Hex;

      selectors = decodeValue(components.FunctionSelectors.metadata.valueSchema, selectorRecord);
    }

    functionSelectorToResourceSelector.set(worldFunctionSelector, selectors.resourceSelector as Hex);

    return selectors.resourceSelector as Hex;
  };

  return {
    ...storeSync,
    components,
    stopSync,
    getResourceSelector,
  };
}
