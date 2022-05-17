import { World as WorldContract } from "ri-contracts/types/ethers-contracts/World";
import { EmberFacet } from "ri-contracts/types/ethers-contracts/EmberFacet";
import { setComponent, World, Component, Schema } from "@mud/recs";
import { createECSStream, Mappings, ContractEvent } from "@mud/network";
import { mergeMap, Observable, Subject } from "rxjs";
import { NetworkLayer } from "../types";

/**
 * Sets up syncronization between contract components and client components by listening to World contract events
 */
export function setupMappings(
  world: World,
  components: NetworkLayer["components"],
  contracts$: Observable<{
    Ember: EmberFacet;
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

  const ecsEventSub = ecsEventStream$.subscribe((update) => {
    if (!world.entities.has(update.entity)) {
      world.registerEntity(update.entity);
    }
    setComponent(components[update.component] as Component<Schema>, update.entity, update.value);
    if (update.lastEventInTx) txReduced$.next(update.txHash);
  });

  world.registerDisposer(() => ecsEventSub?.unsubscribe());
  return { txReduced$: txReduced$.asObservable() };
}
