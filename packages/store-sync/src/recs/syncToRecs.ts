import { StoreConfig } from "@latticexyz/store";
import { World as RecsWorld, getComponentValue, setComponent } from "@latticexyz/recs";
import { SyncOptions, SyncResult } from "../common";
import { RecsStorageAdapter, recsStorage } from "./recsStorage";
import { createStoreSync } from "../createStoreSync";
import { singletonEntity } from "./singletonEntity";
import { SyncStep } from "../SyncStep";
import { Hex } from "viem";
import { encodeEntity } from "./encodeEntity";
import { KeySchema, ValueSchema, decodeValue, valueSchemaToFieldLayoutHex } from "@latticexyz/protocol-parser";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";

type SyncToRecsOptions<TConfig extends StoreConfig = StoreConfig> = SyncOptions<TConfig> & {
  world: RecsWorld;
  config: TConfig;
  startSync?: boolean;
};

type SyncToRecsResult<TConfig extends StoreConfig = StoreConfig> = SyncResult & {
  components: RecsStorageAdapter<TConfig>["components"];
  stopSync: () => void;
  getResourceSelector: (functionSelector: Hex) => Promise<Hex>;
};

export async function syncToRecs<TConfig extends StoreConfig = StoreConfig>({
  world,
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

  const sub = startSync ? storeSync.storedBlockLogs$.subscribe() : null;
  const stopSync = (): void => {
    sub?.unsubscribe();
  };

  world.registerDisposer(stopSync);

  const getResourceSelector = async (functionSelector: Hex): Promise<Hex> => {
    const entity = encodeEntity<
      KeySchema & {
        functionSelector: "bytes4";
      }
    >(components.FunctionSelectors.metadata.keySchema, {
      functionSelector,
    });

    const selectors = getComponentValue(components.FunctionSelectors, entity);

    // If we can't find selectors due to not being synced yet, we can try to read them from the world contract
    if (!selectors) {
      // TODO make fieldLayout a table metadata field
      const encodedFieldLayout = valueSchemaToFieldLayoutHex(components.FunctionSelectors.metadata.valueSchema);

      const [selectorRecord, encodedLengths, dynamicData] = await publicClient.readContract({
        address: address as Hex,
        abi: IBaseWorldAbi,
        functionName: "getRecord",
        args: [components.FunctionSelectors.id as Hex, [entity as Hex], encodedFieldLayout],
      });

      const decodedSelectors = decodeValue<
        ValueSchema & {
          resourceSelector: "bytes32";
          systemFunctionSelector: "bytes4";
        }
      >(components.FunctionSelectors.metadata.valueSchema, selectorRecord);

      return decodedSelectors.resourceSelector;
    }

    return selectors.resourceSelector as Hex;
  };

  return {
    ...storeSync,
    components,
    stopSync,
    getResourceSelector,
  };
}
