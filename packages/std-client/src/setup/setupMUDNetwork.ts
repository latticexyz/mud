import {
  createNetwork,
  createContracts,
  Mappings,
  createTxQueue,
  createSyncWorker,
  createEncoder,
  NetworkComponentUpdate,
  createSystemExecutor,
  NetworkConfig,
  SyncWorkerConfig,
  isNetworkComponentUpdateEvent,
} from "@latticexyz/network";
import { BehaviorSubject, bufferTime, filter, Observable, Subject } from "rxjs";
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
import { keccak256, stretch, toEthAddress } from "@latticexyz/utils";
import ComponentAbi from "@latticexyz/solecs/abi/Component.json";
import { Contract, ContractInterface, Signer } from "ethers";
import { Component as SolecsComponent } from "@latticexyz/solecs";
import { JsonRpcProvider } from "@ethersproject/providers";
import { World as WorldContract } from "@latticexyz/solecs/types/ethers-contracts/World";
import { abi as WorldAbi } from "@latticexyz/solecs/abi/World.json";
import { defineStringComponent } from "../components";

export type SetupContractConfig = NetworkConfig &
  Omit<SyncWorkerConfig, "worldContract" | "mappings"> & { worldAddress: string; devMode?: boolean };

export type ContractComponents = {
  [key: string]: Component<Schema, { contractId: string }>;
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

  components = {
    ...components,
    SystemsRegistry,
    ComponentsRegistry,
  };

  const mappings: Mappings<C> = {};
  for (const key of Object.keys(components)) {
    const { contractId } = components[key].metadata;
    mappings[keccak256(contractId)] = key;
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

  const systems = createSystemExecutor<SystemTypes>(world, network, SystemsRegistry, SystemAbis, gasPriceInput$, {
    devMode: networkConfig.devMode,
  });

  // Create sync worker
  const { ecsEvent$, config$, dispose } = createSyncWorker<C>();
  world.registerDisposer(dispose);
  function startSync() {
    config$.next({
      provider: networkConfig.provider,
      worldContract: contractsConfig.World,
      initialBlockNumber: networkConfig.initialBlockNumber ?? 0,
      chainId: networkConfig.chainId,
      disableCache: networkConfig.devMode, // Disable cache on local networks (hardhat / anvil)
      snapshotServiceUrl: networkConfig.snapshotServiceUrl,
      streamServiceUrl: networkConfig.streamServiceUrl,
    });
  }

  const { txReduced$ } = applyNetworkUpdates(
    world,
    components,
    ecsEvent$.pipe(filter(isNetworkComponentUpdateEvent)),
    mappings
  );

  const encoders = createEncoders(world, ComponentsRegistry, signerOrProvider);

  return { txQueue, txReduced$, encoders, network, startSync, systems, gasPriceInput$, ecsEvent$, mappings };
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
    console.info("Creating encoder for", componentAddress);
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
  ecsEvent$: Observable<NetworkComponentUpdate<C>>,
  mappings: Mappings<C>
) {
  const txReduced$ = new Subject<string>();

  const ecsEventSub = ecsEvent$
    .pipe(
      // We throttle the client side event processing to 1000 events every 16ms, so 62.500 events per second.
      // This means if the chain were to emit more than 62.500 events per second, the client would not keep up.
      // The only time we get close to this number is when initializing from a snapshot/cache.
      bufferTime(16, null, 1000),
      filter((updates) => updates.length > 0),
      stretch(16)
    )
    .subscribe((updates) => {
      // Running this in a mobx action would result in only one system update per frame (should increase performance)
      // but it currently breaks defineUpdateAction (https://linear.app/latticexyz/issue/LAT-594/defineupdatequery-does-not-work-when-running-multiple-component)
      for (const update of updates) {
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
    });

  world.registerDisposer(() => ecsEventSub?.unsubscribe());
  return { txReduced$: txReduced$.asObservable() };
}
