import {
  createNetwork,
  createContracts,
  Mappings,
  createTxQueue,
  createSyncWorker,
  Ack,
  InputType,
} from "@latticexyz/network";
import { BehaviorSubject, concatMap, from, Subject } from "rxjs";
import { Components, createWorld, defineComponent, Type } from "@latticexyz/recs";
import { computed } from "mobx";
import { keccak256, TableId } from "@latticexyz/utils";
import { World as WorldContract } from "@latticexyz/solecs/types/ethers-contracts/World";
import { abi as WorldAbi } from "@latticexyz/solecs/abi/World.json";
import { defineStringComponent } from "../components";
import { ContractComponent, SetupContractConfig } from "./types";
import { applyNetworkUpdates, createEncoders } from "./utils";
import { defineStoreComponents } from "@latticexyz/recs";
import storeMudConfig from "@latticexyz/store/mud.config.mjs";
import worldMudConfig from "@latticexyz/world/mud.config.mjs";
import { MUDUserConfig } from "@latticexyz/cli";

export async function setupMUDV2Network<M extends MUDUserConfig = MUDUserConfig>(options: {
  mudConfig: M;
  networkConfig: SetupContractConfig;
  initialGasPrice?: number;
  fetchSystemCalls?: boolean;
  syncThread?: "main" | "worker";
}) {
  const world = createWorld();

  const SystemsRegistry = defineStringComponent(world, {
    id: "SystemsRegistry",
    metadata: { contractId: "world.component.systems" },
  });
  const ComponentsRegistry = defineStringComponent(world, {
    id: "ComponentsRegistry",
    metadata: { contractId: "world.component.components" },
  });

  // used by SyncWorker to notify client of sync progress
  const LoadingState = defineComponent(
    world,
    {
      state: Type.Number,
      msg: Type.String,
      percentage: Type.Number,
    },
    {
      id: "LoadingState",
      metadata: { contractId: "component.LoadingState" },
    }
  );

  const storeSchemaTableId = new TableId("mudstore", "schema");
  const storeSchemaComponent = defineComponent(
    world,
    { schema: Type.T },
    {
      metadata: {
        contractId: storeSchemaTableId.toHexString(),
        tableId: storeSchemaTableId.toString(),
      },
    }
  );

  const storeComponents = defineStoreComponents(world, storeMudConfig);
  const worldComponents = defineStoreComponents(world, worldMudConfig);
  const userComponents = defineStoreComponents(world, options.mudConfig);

  const components = {
    // v2 components
    storeSchemaComponent,
    ...storeComponents,
    ...worldComponents,
    ...userComponents,
    // v1 components
    SystemsRegistry,
    ComponentsRegistry,
    LoadingState,
  } satisfies Components;

  storeComponents.StoreMetadata;

  // Mapping from component contract id to key in components object
  const mappings: Mappings<typeof components> = {};

  // Function to register new components in mappings object
  function registerComponent(key: string, component: ContractComponent) {
    const { contractId, tableId } = component.metadata;
    if (tableId) {
      mappings[tableId] = key;
    } else {
      mappings[keccak256(contractId)] = key;
    }
  }

  // Register initial components in mappings object
  for (const key of Object.keys(components)) {
    registerComponent(key, components[key]);
  }

  const network = await createNetwork(options.networkConfig);
  world.registerDisposer(network.dispose);

  const signerOrProvider = computed(() => network.signer.get() || network.providers.get().json);

  const { contracts, config: contractsConfig } = await createContracts<{ World: WorldContract }>({
    config: { World: { abi: WorldAbi, address: options.networkConfig.worldAddress } },
    signerOrProvider,
  });

  const gasPriceInput$ = new BehaviorSubject<number>(
    // If no initial gas price is provided, check the gas price once and add a 30% buffer
    options?.initialGasPrice || Math.ceil((await signerOrProvider.get().getGasPrice()).toNumber() * 1.3)
  );

  const { txQueue, dispose: disposeTxQueue } = createTxQueue(contracts, network, gasPriceInput$, {
    devMode: options.networkConfig.devMode,
  });
  world.registerDisposer(disposeTxQueue);

  // Create sync worker
  const ack$ = new Subject<Ack>();
  // Avoid passing externalProvider to sync worker (too complex to copy)
  const {
    provider: { externalProvider: _, ...providerConfig },
    ...syncWorkerConfig
  } = options.networkConfig;
  const { ecsEvents$, input$, dispose } = createSyncWorker<typeof components>(ack$, { thread: options?.syncThread });
  world.registerDisposer(dispose);
  function startSync() {
    input$.next({
      type: InputType.Config,
      data: {
        ...syncWorkerConfig,
        provider: providerConfig,
        worldContract: contractsConfig.World,
        initialBlockNumber: options.networkConfig.initialBlockNumber ?? 0,
        disableCache: options.networkConfig.devMode, // Disable cache on local networks (hardhat / anvil)
        fetchSystemCalls: options?.fetchSystemCalls,
      },
    });
  }

  const { txReduced$ } = applyNetworkUpdates(world, components, ecsEvents$, mappings, ack$);

  const encoders = options.networkConfig.encoders
    ? createEncoders(world, ComponentsRegistry, signerOrProvider)
    : new Promise((resolve) => resolve({}));

  return {
    txQueue,
    txReduced$,
    encoders,
    network,
    startSync,
    gasPriceInput$,
    ecsEvent$: ecsEvents$.pipe(concatMap((updates) => from(updates))),
    mappings,
    registerComponent,
    components,
  };
}
