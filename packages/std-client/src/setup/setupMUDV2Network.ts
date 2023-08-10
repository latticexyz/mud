import {
  createNetwork,
  createContracts,
  Mappings,
  createTxQueue,
  createSyncWorker,
  Ack,
  InputType,
  SingletonID,
  RawTableRecord,
  keyTupleToEntityID,
} from "@latticexyz/network";
import { BehaviorSubject, concatMap, from, Subject } from "rxjs";
import { Components, defineComponent, Type, World } from "@latticexyz/recs";
import { computed } from "mobx";
import { keccak256 } from "@latticexyz/utils";
import { TableId } from "@latticexyz/common/deprecated";
import { World as WorldContract } from "@latticexyz/world/types/ethers-contracts/World";
import { IWorldKernel__factory } from "@latticexyz/world/types/ethers-contracts/factories/IWorldKernel.sol/IWorldKernel__factory";
import { defineStringComponent } from "../components";
import { ContractComponent, ContractComponents, SetupContractConfig } from "./types";
import { applyNetworkUpdates, createEncoders } from "./utils";
import * as devObservables from "../dev/observables";
import { Abi } from "abitype";
import { createDatabase, createDatabaseClient } from "@latticexyz/store-cache";
import { StoreConfig } from "@latticexyz/store";

type SetupMUDV2NetworkOptions<C extends ContractComponents, S extends StoreConfig> = {
  networkConfig: SetupContractConfig;
  world: World;
  contractComponents: C;
  initialGasPrice?: number;
  fetchSystemCalls?: boolean;
  syncThread?: "main" | "worker";
  syncStoreCache?: boolean;
  storeConfig: S;
  worldAbi: Abi; // TODO: should this extend IWorldKernel ABI or a subset of?
};

export async function setupMUDV2Network<C extends ContractComponents, S extends StoreConfig>({
  networkConfig,
  world,
  contractComponents,
  initialGasPrice,
  fetchSystemCalls,
  syncThread,
  storeConfig,
  syncStoreCache = true,
  worldAbi = IWorldKernel__factory.abi,
}: SetupMUDV2NetworkOptions<C, S>) {
  devObservables.worldAbi$.next(worldAbi);

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
    { valueSchema: Type.String, keySchema: Type.String },
    {
      metadata: {
        contractId: storeSchemaTableId.toHex(),
        tableId: storeSchemaTableId.toString(),
      },
    }
  );

  const components = {
    // v2 components
    storeSchemaComponent,
    ...contractComponents,
    // v1 components
    SystemsRegistry,
    ComponentsRegistry,
    LoadingState,
  } satisfies Components;

  // Mapping from component contract id to key in components object
  const mappings: Mappings<typeof components> = {};

  // Function to register new components in mappings object
  function registerComponent(key: string, component: ContractComponent) {
    if (typeof component.metadata?.tableId === "string") {
      mappings[component.metadata.tableId] = key;
    } else {
      mappings[
        keccak256(typeof component.metadata?.contractId === "string" ? component.metadata.contractId : component.id)
      ] = key;
    }
  }

  // Register initial components in mappings object
  for (const key of Object.keys(components)) {
    registerComponent(key, components[key]);
  }

  const network = await createNetwork(networkConfig);
  world.registerDisposer(network.dispose);

  const signerOrProvider = computed(() => network.signer.get() || network.providers.get().json);

  const { contracts, config: contractsConfig } = await createContracts<{ World: WorldContract }>({
    config: { World: { abi: IWorldKernel__factory.abi, address: networkConfig.worldAddress } },
    signerOrProvider,
  });

  const gasPriceInput$ = new BehaviorSubject<number>(
    // If no initial gas price is provided, check the gas price once and add a 30% buffer
    initialGasPrice || Math.ceil((await signerOrProvider.get().getGasPrice()).toNumber() * 1.3)
  );

  // TODO: replace this with `fastTxExecutor`
  const { txQueue, dispose: disposeTxQueue } = createTxQueue(contracts, network, gasPriceInput$, {
    devMode: networkConfig.devMode,
  });
  world.registerDisposer(disposeTxQueue);

  // For LoadingState updates
  const singletonEntity = world.registerEntity({ id: SingletonID });
  // Register player entity
  const address = network.connectedAddress.get();
  const playerEntity = address ? world.registerEntity({ id: keyTupleToEntityID([address]) }) : undefined;

  // Create sync worker
  const ack$ = new Subject<Ack>();
  // Avoid passing externalProvider to sync worker (too complex to copy)
  const {
    provider: { externalProvider: _, ...providerConfig },
    ...syncWorkerConfig
  } = networkConfig;
  const { ecsEvents$, input$, dispose } = createSyncWorker<typeof components>(ack$, { thread: syncThread });
  world.registerDisposer(dispose);

  function startSync(initialRecords?: RawTableRecord[], initialBlockNumber?: number) {
    input$.next({
      type: InputType.Config,
      data: {
        ...syncWorkerConfig,
        provider: providerConfig,
        worldContract: contractsConfig.World,
        initialBlockNumber: initialBlockNumber ?? networkConfig.initialBlockNumber,
        disableCache: networkConfig.disableCache || [31337, 1337].includes(networkConfig.chainId), // Disable cache on local networks (hardhat / anvil)
        fetchSystemCalls,
        initialRecords,
      },
    });
  }

  const db = createDatabase();
  const storeCache = createDatabaseClient(db, storeConfig);

  const { txReduced$ } = applyNetworkUpdates(
    world,
    components,
    ecsEvents$,
    mappings,
    ack$,
    syncStoreCache ? storeConfig : undefined,
    syncStoreCache ? storeCache : undefined
  );

  const encoders = networkConfig.encoders
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
    networkConfig,
    world,
    components,
    singletonEntityId: SingletonID,
    singletonEntity,
    playerEntity,
    storeCache,
  };
}
