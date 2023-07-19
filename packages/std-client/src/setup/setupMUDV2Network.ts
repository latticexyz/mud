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
import { Components, ComponentValue, defineComponent, setComponent, Type, World } from "@latticexyz/recs";
import { computed } from "mobx";
import { keccak256 } from "@latticexyz/utils";
import { TableId } from "@latticexyz/common";
import { World as WorldContract } from "@latticexyz/world/types/ethers-contracts/World";
import { IWorldKernel__factory } from "@latticexyz/world/types/ethers-contracts/factories/IWorldKernel.sol/IWorldKernel__factory";
import { defineStringComponent } from "../components";
import { ContractComponent, ContractComponents, SetupContractConfig } from "./types";
import { applyNetworkUpdates, createEncoders, nameKeys } from "./utils";
import { defineContractComponents as defineStoreComponents } from "../mud-definitions/store/contractComponents";
import { defineContractComponents as defineWorldComponents } from "../mud-definitions/world/contractComponents";
import * as devObservables from "../dev/observables";
import { Abi } from "abitype";
import { DatabaseClient, Key, Value, createDatabase, createDatabaseClient } from "@latticexyz/store-cache";
import { StoreConfig } from "@latticexyz/store";
import superjson from "superjson";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter, TableWithRecords } from "@latticexyz/store-indexer";

type SetupMUDV2NetworkOptions<C extends Components, S extends StoreConfig> = {
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

function setupIndexer(options: { type: "trpc"; url: string }) {
  return createTRPCProxyClient<AppRouter>({
    transformer: superjson,
    links: [httpBatchLink({ url: options.url })],
  });
}

async function applyInitialState<S extends StoreConfig>(
  tables: TableWithRecords[],
  database: { recsComponents?: ContractComponents; storeCache?: DatabaseClient<S> },
  config: StoreConfig,
  mappings: Mappings<ContractComponents>
) {
  const { recsComponents, storeCache } = database;

  // apply updated to recs
  for (const table of tables) {
    if (recsComponents) {
      const componentId = new TableId(table.namespace, table.name).toString();
      const componentKey = mappings[componentId];
      const component = recsComponents[componentKey];
      if (!component) {
        console.warn(
          `Skipping update for unknown component: ${componentId}. Available components: ${Object.keys(recsComponents)}`
        );
        continue;
      }
      for (const record of table.records) {
        const entity = keyTupleToEntityID(Object.values(record.key) as unknown[]);
        console.log("applying component update", componentId, entity, record.value);
        setComponent(component, entity, record.value as ComponentValue);
      }
    }
  }

  // apply updates to storeCache
  if (storeCache) {
    for (const table of tables) {
      const tableConfig = config.tables[table.name];
      if (!tableConfig) {
        console.warn(
          `Skipping update for unknown table: ${table.name}. Availables tables: ${Object.keys(config.tables)}`
        );
        continue;
      }
      const keyNames = Object.getOwnPropertyNames(tableConfig.keySchema);
      for (const record of table.records) {
        const namedKey = nameKeys(record.key, keyNames) as Key<S, keyof S["tables"]>;
        console.log(
          "applying table update",
          new TableId(table.namespace, table.name).toString(),
          namedKey,
          record.value
        );
        await storeCache.set(table.namespace, table.name, namedKey, record.value as Value<S, keyof S["tables"]>);
      }
    }
  }
}

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

  const storeComponents = defineStoreComponents(world);
  const worldComponents = defineWorldComponents(world);

  const components = {
    // v2 components
    storeSchemaComponent,
    ...storeComponents,
    ...worldComponents,
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

  const db = createDatabase();
  const storeCache = createDatabaseClient(db, storeConfig);

  // Sync initial events from indexer
  if (networkConfig.indexer) {
    const indexer = setupIndexer(networkConfig.indexer);
    // TODO: should separately check the block number to avoid loading unnecessary data
    const result = await indexer.findAll.query({ chainId: networkConfig.chainId, address: networkConfig.worldAddress });
    if (result.blockNumber != null && result.blockNumber >= networkConfig.initialBlockNumber) {
      // Update block number from which the sync worker starts syncing from
      networkConfig.initialBlockNumber = Number(result.blockNumber + 1n);
      console.log("got initial state from trpc indexer", result);
      await applyInitialState(
        result.tables,
        { recsComponents: contractComponents as ContractComponents, storeCache },
        storeConfig,
        mappings as Mappings<ContractComponents>
      );
    }
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
