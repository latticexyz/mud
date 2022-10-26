import {
  createNetwork,
  createContracts,
  Mappings,
  createTxQueue,
  createSyncWorker,
  createEncoder,
  createSystemExecutor,
  NetworkConfig,
  SyncWorkerConfig,
  isNetworkComponentUpdateEvent,
  NetworkEvent,
  ack,
  Ack,
  InputType,
} from "@latticexyz/network";
import { BehaviorSubject, concatMap, filter, from, map, Observable, Subject, timer } from "rxjs";
import {
  Component,
  Components,
  EntityIndex,
  getComponentEntities,
  getComponentValueStrict,
  removeComponent,
  Schema,
  setComponent,
  Type,
  World,
} from "@latticexyz/recs";
import { computed, IComputedValue } from "mobx";
import { keccak256, toEthAddress } from "@latticexyz/utils";
import ComponentAbi from "@latticexyz/solecs/abi/Component.json";
import { Contract, ContractInterface, Signer } from "ethers";
import { Component as SolecsComponent } from "@latticexyz/solecs";
import { JsonRpcProvider } from "@ethersproject/providers";
import { World as WorldContract } from "@latticexyz/solecs/types/ethers-contracts/World";
import { abi as WorldAbi } from "@latticexyz/solecs/abi/World.json";
import { defineStringComponent } from "../components";

export type SetupContractConfig = NetworkConfig &
  Omit<SyncWorkerConfig, "worldContract" | "mappings"> & {
    worldAddress: string;
    devMode?: boolean;
  };

export type ContractComponent = Component<Schema, { contractId: string }>;

export type ContractComponents = {
  [key: string]: ContractComponent;
};

export type NetworkComponents<C extends ContractComponents> = C & {
  SystemsRegistry: Component<{ value: Type.String }>;
  ComponentsRegistry: Component<{ value: Type.String }>;
};

export async function setupMUDNetwork<C extends ContractComponents, SystemTypes extends { [key: string]: Contract }>(
  networkConfig: SetupContractConfig,
  world: World,
  components: C,
  SystemAbis: { [key in keyof SystemTypes]: ContractInterface },
  options?: { initialGasPrice?: number }
) {
  const SystemsRegistry = defineStringComponent(world, {
    id: "SystemsRegistry",
    metadata: { contractId: "world.component.systems" },
  });

  const ComponentsRegistry = defineStringComponent(world, {
    id: "ComponentsRegistry",
    metadata: { contractId: "world.component.components" },
  });

  (components as NetworkComponents<C>).SystemsRegistry = SystemsRegistry;
  (components as NetworkComponents<C>).ComponentsRegistry = ComponentsRegistry;

  // Mapping from component contract id to key in components object
  const mappings: Mappings<C> = {};

  // Function to register new components in mappings object
  function registerComponent(key: string, component: ContractComponent) {
    const { contractId } = component.metadata;
    mappings[keccak256(contractId)] = key;
  }

  // Register initial components in mappings object
  for (const key of Object.keys(components)) {
    registerComponent(key, components[key]);
  }

  const network = await createNetwork(networkConfig);
  world.registerDisposer(network.dispose);

  const signerOrProvider = computed(() => network.signer.get() || network.providers.get().json);

  const { contracts, config: contractsConfig } = await createContracts<{ World: WorldContract }>({
    config: { World: { abi: WorldAbi, address: networkConfig.worldAddress } },
    signerOrProvider,
  });

  const gasPriceInput$ = new BehaviorSubject<number>(
    // If no initial gas price is provided, check the gas price once and add a 30% buffer
    options?.initialGasPrice || Math.ceil((await signerOrProvider.get().getGasPrice()).toNumber() * 1.3)
  );

  const { txQueue, dispose: disposeTxQueue } = createTxQueue(contracts, network, gasPriceInput$, {
    devMode: networkConfig.devMode,
  });
  world.registerDisposer(disposeTxQueue);

  const { systems, untypedSystems } = createSystemExecutor<SystemTypes>(
    world,
    network,
    SystemsRegistry,
    SystemAbis,
    gasPriceInput$,
    {
      devMode: networkConfig.devMode,
    }
  );

  // Create sync worker
  const ack$ = new Subject<Ack>();
  const { ecsEvents$, input$, dispose } = createSyncWorker<C>(ack$);
  world.registerDisposer(dispose);
  function startSync() {
    input$.next({
      type: InputType.Config,
      data: {
        ...networkConfig,
        worldContract: contractsConfig.World,
        initialBlockNumber: networkConfig.initialBlockNumber ?? 0,
        disableCache: networkConfig.devMode, // Disable cache on local networks (hardhat / anvil)
      },
    });
  }

  const { txReduced$ } = applyNetworkUpdates(world, components, ecsEvents$, mappings, ack$);

  const encoders = networkConfig.encoders
    ? createEncoders(world, ComponentsRegistry, signerOrProvider)
    : new Promise((resolve) => resolve({}));

  return {
    txQueue,
    txReduced$,
    encoders,
    network,
    startSync,
    systems,
    untypedSystems,
    gasPriceInput$,
    ecsEvent$: ecsEvents$.pipe(concatMap((updates) => from(updates))),
    mappings,
    registerComponent,
  };
}

async function createEncoders(
  world: World,
  components: Component<{ value: Type.String }>,
  signerOrProvider: IComputedValue<JsonRpcProvider | Signer>
) {
  const encoders = {} as Record<string, ReturnType<typeof createEncoder>>;

  async function fetchAndCreateEncoder(entity: EntityIndex) {
    const componentAddress = toEthAddress(world.entities[entity]);
    const componentId = getComponentValueStrict(components, entity).value;
    console.info("[SyncUtils] Creating encoder for " + componentAddress);
    const componentContract = new Contract(
      componentAddress,
      ComponentAbi.abi,
      signerOrProvider.get()
    ) as SolecsComponent;
    const [componentSchemaPropNames, componentSchemaTypes] = await componentContract.getSchema();
    encoders[componentId] = createEncoder(componentSchemaPropNames, componentSchemaTypes);
  }

  // Initial setup
  for (const entity of getComponentEntities(components)) fetchAndCreateEncoder(entity);

  // Keep up to date
  const subscription = components.update$.subscribe((update) => fetchAndCreateEncoder(update.entity));
  world.registerDisposer(() => subscription?.unsubscribe());

  return encoders;
}

/**
 * Sets up synchronization between contract components and client components
 */
function applyNetworkUpdates<C extends Components>(
  world: World,
  components: C,
  ecsEvents$: Observable<NetworkEvent<C>[]>,
  mappings: Mappings<C>,
  ack$: Subject<Ack>
) {
  const txReduced$ = new Subject<string>();

  // Send "ack" to tell the sync worker we're ready to receive events while not processing
  let processing = false;
  const ackSub = timer(0, 100)
    .pipe(
      filter(() => !processing),
      map(() => ack)
    )
    .subscribe(ack$);

  const delayQueueSub = ecsEvents$.subscribe((updates) => {
    processing = true;
    for (const update of updates) {
      if (!isNetworkComponentUpdateEvent<C>(update)) return;

      const entityIndex = world.entityToIndex.get(update.entity) ?? world.registerEntity({ id: update.entity });
      const componentKey = mappings[update.component];
      if (!componentKey) return console.warn("Unknown component:", update);

      if (update.value === undefined) {
        // undefined value means component removed
        removeComponent(components[componentKey] as Component<Schema>, entityIndex);
      } else {
        setComponent(components[componentKey] as Component<Schema>, entityIndex, update.value);
      }

      if (update.lastEventInTx) txReduced$.next(update.txHash);
    }
    // Send "ack" after every processed batch of events to process faster than ever 100ms
    ack$.next(ack);
    processing = false;
  });

  world.registerDisposer(() => {
    delayQueueSub?.unsubscribe();
    ackSub?.unsubscribe();
  });
  return { txReduced$: txReduced$.asObservable() };
}
