import {
  createNetwork,
  createContracts,
  Mappings,
  createTxQueue,
  createSyncWorker,
  createEncoder,
  SyncWorkerConfig,
  NetworkComponentUpdate,
} from "@latticexyz/network";
import { World as WorldContract } from "ri-contracts/types/ethers-contracts/World";
import { CombinedFacets } from "ri-contracts/types/ethers-contracts/CombinedFacets";
import WorldAbi from "ri-contracts/abi/World.json";
import CombinedFacetsAbi from "ri-contracts/abi/CombinedFacets.json";
import { bufferTime, filter, Observable, Subject } from "rxjs";
import { Component, Components, removeComponent, Schema, setComponent, World } from "@latticexyz/recs";
import { computed } from "mobx";
import { stretch } from "@latticexyz/utils";
import ComponentAbi from "@latticexyz/solecs/abi/Component.json";
import { Contract } from "ethers";
import { Component as SolecsComponent } from "@latticexyz/solecs";

export type ContractComponents = {
  [key: string]: Component<Schema, { contractId: string }>;
};

export type SetupContractConfig = Parameters<typeof createNetwork>[0] &
  Omit<SyncWorkerConfig, "worldContract" | "mappings">;

export async function setupContracts<C extends ContractComponents>(
  address: string,
  config: SetupContractConfig,
  world: World,
  components: C,
  mappings: Mappings<C>
) {
  const network = await createNetwork(config);
  world.registerDisposer(network.dispose);

  const signerOrProvider = computed(() => network.signer.get() || network.providers.get().json);

  const { contracts, config: contractsConfig } = await createContracts<{ Game: CombinedFacets; World: WorldContract }>({
    config: { Game: { abi: CombinedFacetsAbi.abi, address } },
    asyncConfig: async (c) => ({ World: { abi: WorldAbi.abi, address: await c.Game.world() } }),
    signerOrProvider,
  });

  const { txQueue, dispose: disposeTxQueue } = createTxQueue(contracts, network);
  world.registerDisposer(disposeTxQueue);

  // Create sync worker
  const { ecsEvent$, config$, dispose } = createSyncWorker<C>();
  world.registerDisposer(dispose);
  function startSync() {
    config$.next({
      provider: config.provider,
      worldContract: contractsConfig.World,
      initialBlockNumber: 0,
      mappings,
      chainId: config.chainId,
      disableCache: config.chainId === 31337, // Disable cache on hardhat
      checkpointServiceUrl: config.checkpointServiceUrl,
    });
  }

  const { txReduced$ } = applyNetworkUpdates(world, components, ecsEvent$);

  const encoders = {} as Record<string, ReturnType<typeof createEncoder>>;
  for (const [, component] of Object.entries(components)) {
    const componentAddress = await txQueue.World.getComponent(component.metadata.contractId);
    const componentContract = new Contract(
      componentAddress,
      ComponentAbi.abi,
      signerOrProvider.get()
    ) as SolecsComponent;

    const [componentSchemaPropNames, componentSchemaTypes] = await componentContract.getSchema();
    encoders[component.id] = createEncoder(componentSchemaPropNames, componentSchemaTypes);
  }
  return { txQueue, txReduced$, encoders, network, startSync };
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

  const ecsEventSub = ecsEvent$.subscribe((update) => {
    // Running this in a mobx action would result in only one system update per frame (should increase performance)
    // but it currently breaks defineUpdateAction (https://linear.app/latticexyz/issue/LAT-594/defineupdatequery-does-not-work-when-running-multiple-component)
    const entityIndex = world.entityToIndex.get(update.entity) ?? world.registerEntity({ id: update.entity });

    if (update.value === undefined) {
      // undefined value means component removed
      removeComponent(components[update.component] as Component<Schema>, entityIndex);
    } else {
      setComponent(components[update.component] as Component<Schema>, entityIndex, update.value);
    }

    if (update.lastEventInTx) txReduced$.next(update.txHash);
  });

  world.registerDisposer(() => ecsEventSub?.unsubscribe());
  return { txReduced$: txReduced$.asObservable() };
}
