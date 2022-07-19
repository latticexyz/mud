import {
  createNetwork,
  createContracts,
  Mappings,
  createTxQueue,
  createSyncWorker,
  createEncoder,
  SyncWorkerConfig,
  NetworkComponentUpdate,
  NetworkConfig,
  createSystemExecutor,
} from "@latticexyz/network";
import { World as WorldContract } from "ri-contracts/types/ethers-contracts/World";
import { abi as WorldAbi } from "ri-contracts/abi/World.json";
import { bufferTime, filter, Observable, Subject } from "rxjs";
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
import { stretch, toEthAddress } from "@latticexyz/utils";
import ComponentAbi from "@latticexyz/solecs/abi/Component.json";
import { Contract, Signer } from "ethers";
import { Component as SolecsComponent } from "@latticexyz/solecs";
import { SystemTypes } from "ri-contracts/types/SystemTypes";
import { SystemAbis } from "ri-contracts/types/SystemAbis.mjs";
import { JsonRpcProvider } from "@ethersproject/providers";

export type ContractComponents = {
  [key: string]: Component<Schema, { contractId: string }>;
};

export type SetupContractConfig = NetworkConfig & Omit<SyncWorkerConfig, "worldContract" | "mappings">;

export async function setupContracts<C extends ContractComponents>(
  worldAddress: string,
  config: SetupContractConfig,
  world: World,
  systemsComponent: Component<{ value: Type.String }>,
  componentsComponent: Component<{ value: Type.String }>,
  components: C,
  mappings: Mappings<C>,
  devMode?: boolean
) {
  const network = await createNetwork(config);
  world.registerDisposer(network.dispose);

  console.log(
    "Initial block",
    config.initialBlockNumber,
    await network.providers.get().json.getBlock(config.initialBlockNumber)
  );

  const signerOrProvider = computed(() => network.signer.get() || network.providers.get().json);

  const { contracts, config: contractsConfig } = await createContracts<{ World: WorldContract }>({
    config: { World: { abi: WorldAbi, address: worldAddress } },
    signerOrProvider,
  });

  const { txQueue, dispose: disposeTxQueue } = createTxQueue(contracts, network, { devMode });
  world.registerDisposer(disposeTxQueue);

  const systems = createSystemExecutor<SystemTypes>(world, network, systemsComponent, SystemAbis, { devMode });

  // Create sync worker
  const { ecsEvent$, config$, dispose } = createSyncWorker<C>();
  world.registerDisposer(dispose);
  function startSync() {
    config$.next({
      provider: config.provider,
      worldContract: contractsConfig.World,
      initialBlockNumber: config.initialBlockNumber ?? 0,
      mappings,
      chainId: config.chainId,
      disableCache: devMode, // Disable cache on hardhat
      checkpointServiceUrl: config.checkpointServiceUrl,
    });
  }

  const { txReduced$ } = applyNetworkUpdates(world, components, ecsEvent$);

  const encoders = createEncoders(world, componentsComponent, signerOrProvider);

  return { txQueue, txReduced$, encoders, network, startSync, systems };
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
  ecsEvent$: Observable<NetworkComponentUpdate<C>>
) {
  const txReduced$ = new Subject<string>();

  const ecsEventSub = ecsEvent$
    .pipe(
      // We throttle the client side event processing to 1000 events every 16ms, so 62.500 events per second.
      // This means if the chain were to emit more than 62.500 events per second, the client would not keep up.
      // The only time we get close to this number is when initializing from a checkpoint/cache.
      bufferTime(16, null, 1000),
      filter((updates) => updates.length > 0),
      stretch(16)
    )
    .subscribe((updates) => {
      // Running this in a mobx action would result in only one system update per frame (should increase performance)
      // but it currently breaks defineUpdateAction (https://linear.app/latticexyz/issue/LAT-594/defineupdatequery-does-not-work-when-running-multiple-component)
      for (const update of updates) {
        const entityIndex = world.entityToIndex.get(update.entity) ?? world.registerEntity({ id: update.entity });

        if (update.value === undefined) {
          // undefined value means component removed
          removeComponent(components[update.component] as Component<Schema>, entityIndex);
        } else {
          setComponent(components[update.component] as Component<Schema>, entityIndex, update.value);
        }

        if (update.lastEventInTx) txReduced$.next(update.txHash);
      }
    });

  world.registerDisposer(() => ecsEventSub?.unsubscribe());
  return { txReduced$: txReduced$.asObservable() };
}
