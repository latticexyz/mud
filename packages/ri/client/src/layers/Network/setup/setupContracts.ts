import { createNetwork, createContracts, Mappings, createTxQueue, createSyncWorker } from "@latticexyz/network";
import { DEV_PRIVATE_KEY, DIAMOND_ADDRESS, RPC_URL, RPC_WS_URL } from "../constants.local";
import { World as WorldContract } from "ri-contracts/types/ethers-contracts/World";
import { CombinedFacets } from "ri-contracts/types/ethers-contracts/CombinedFacets";
import WorldAbi from "ri-contracts/abi/World.json";
import CombinedFacetsAbi from "ri-contracts/abi/CombinedFacets.json";
import { bufferTime, filter, Observable, Subject } from "rxjs";
import { Component, Components, ExtendableECSEvent, Schema, setComponent, World } from "@latticexyz/recs";
import { computed } from "mobx";
import { stretch } from "@latticexyz/utils";

export type ECSEventWithTx<C extends Components> = ExtendableECSEvent<
  C,
  { lastEventInTx: boolean; txHash: string; entity: string }
>;

const config: Parameters<typeof createNetwork>[0] = {
  clock: {
    period: 5000,
    initialTime: 0,
    syncInterval: 5000,
  },
  provider: {
    jsonRpcUrl: RPC_URL,
    wsRpcUrl: RPC_WS_URL,
    options: {
      batch: false,
    },
  },
  privateKey: DEV_PRIVATE_KEY,
  chainId: 1337,
};

export async function setupContracts<C extends Components>(world: World, components: C, mappings: Mappings<C>) {
  const network = await createNetwork(config);
  world.registerDisposer(network.dispose);

  const signerOrProvider = computed(() => network.signer.get() || network.providers.get().json);

  const { contracts, config: contractsConfig } = await createContracts<{ Game: CombinedFacets; World: WorldContract }>({
    config: { Game: { abi: CombinedFacetsAbi.abi, address: DIAMOND_ADDRESS } },
    asyncConfig: async (c) => ({ World: { abi: WorldAbi.abi, address: await c.Game.world() } }),
    signerOrProvider,
  });

  const { txQueue, dispose: disposeTxQueue } = createTxQueue(contracts, network);
  world.registerDisposer(disposeTxQueue);

  const { ecsEvent$ } = createSyncWorker({
    provider: config.provider,
    worldContract: contractsConfig.World,
    initialBlockNumber: 0,
    mappings,
    chainId: config.chainId,
    disableCache: config.chainId === 1337, // Disable cache on hardhat
  });

  const { txReduced$ } = applyNetworkUpdates(world, components, ecsEvent$);

  return { txQueue, txReduced$ };
}

/**
 * Sets up synchronization between contract components and client components
 */
function applyNetworkUpdates<C extends Components>(
  world: World,
  components: C,
  ecsEvent$: Observable<ECSEventWithTx<C>>
) {
  const txReduced$ = new Subject<string>();

  const ecsEventSub = ecsEvent$
    .pipe(
      // We throttle the client side event processing to 200 events every 16ms, so 12.500 events per second.
      // This means if the chain were to emit more than 12.500 events per second, the client would not keep up.
      // (We're not close to 12.500 events per second on the chain yet)
      bufferTime(16, null, 200),
      filter((updates) => updates.length > 0),
      stretch(16)
    )
    .subscribe((updates) => {
      // Running this in a mobx action would result in only one system update per frame (should increase performance)
      // but it currently breaks defineUpdateAction (https://linear.app/latticexyz/issue/LAT-594/defineupdatequery-does-not-work-when-running-multiple-component)
      // runInAction(() => {
      for (const update of updates) {
        if (!world.entities.has(update.entity)) {
          world.registerEntity({ id: update.entity });
        }
        setComponent(components[update.component] as Component<Schema>, update.entity, update.value);
        if (update.lastEventInTx) txReduced$.next(update.txHash);
      }
      // });
    });

  world.registerDisposer(() => ecsEventSub?.unsubscribe());
  return { txReduced$: txReduced$.asObservable() };
}
