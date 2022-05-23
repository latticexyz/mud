import { World as WorldContract } from "ri-contracts/types/ethers-contracts/World";
import { CombinedFacets } from "ri-contracts/types/ethers-contracts/CombinedFacets";
import { setComponent, World, Component, Schema } from "@mudkit/recs";
import { createECSStream, Mappings, ContractEvent } from "@mudkit/network";
import { bufferCount, filter, mergeMap, Observable, Subject } from "rxjs";
import { NetworkLayer } from "../types";
import { stretch } from "@mudkit/utils";

/**
 * Sets up syncronization between contract components and client components by listening to World contract events
 */
export function setupMappings(
  world: World,
  components: NetworkLayer["components"],
  contracts$: Observable<{
    Ember: CombinedFacets;
    World: WorldContract;
  }>,
  contractEventStream$: Observable<
    ContractEvent<{
      World: WorldContract;
    }>
  >,
  mappings: Mappings<NetworkLayer["components"]>
) {
  const ecsEventStream$ = contracts$.pipe(
    mergeMap(
      () =>
        createECSStream<typeof components, WorldContract>(
          {
            mappings,
          },
          contractEventStream$
        ).ecsEventStream$
    )
  );

  const txReduced$ = new Subject<string>();

  const ecsEventSub = ecsEventStream$
    .pipe(
      // We throttle the client side event processing to 200 events every 16ms, so 12.000 events per second.
      // This means if the chain would emit more than 12.000 events per second, the client couldn't keep up.
      // (We're not close to 12.000 events per second on the chain yet)
      bufferCount(200, 16),
      filter((updates) => updates.length > 0),
      stretch(16)
    )
    .subscribe((updates) => {
      // Running this in a mobx action would result in only one system update per frame (should increase performance)
      // but it currently breaks defineUpdateAction (https://linear.app/latticexyz/issue/LAT-594/defineupdatequery-does-not-work-when-running-multiple-component)
      // runInAction(() => {
      for (const update of updates) {
        if (!world.entities.has(update.entity)) {
          world.registerEntity(update.entity);
        }
        setComponent(components[update.component] as Component<Schema>, update.entity, update.value);
        if (update.lastEventInTx) txReduced$.next(update.txHash);
      }
      // });
    });

  world.registerDisposer(() => ecsEventSub?.unsubscribe());
  return { txReduced$: txReduced$.asObservable() };
}
