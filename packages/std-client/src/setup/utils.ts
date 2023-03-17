import {
  Ack,
  ack,
  createEncoder,
  isNetworkComponentUpdateEvent,
  isSystemCallEvent,
  Mappings,
  NetworkComponentUpdate,
  NetworkEvent,
  SystemCall,
} from "@latticexyz/network";
import {
  Components,
  World,
  Schema,
  Type,
  getComponentValue,
  removeComponent,
  setComponent,
  EntityIndex,
  getComponentEntities,
  getComponentValueStrict,
  Component,
  updateComponent,
} from "@latticexyz/recs";
import { toEthAddress } from "@latticexyz/utils";
import { Component as SolecsComponent } from "@latticexyz/solecs";
import ComponentAbi from "@latticexyz/solecs/abi/Component.json";
import { Contract, Signer } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { IComputedValue } from "mobx";
import { filter, map, Observable, Subject, timer } from "rxjs";
import { DecodedNetworkComponentUpdate } from "./types";

export function createDecodeNetworkComponentUpdate<C extends Components>(
  world: World,
  components: C,
  mappings: Mappings<C>
): (update: NetworkComponentUpdate) => DecodedNetworkComponentUpdate | undefined {
  return (update: NetworkComponentUpdate) => {
    const entityIndex = world.entityToIndex.get(update.entity) ?? world.registerEntity({ id: update.entity });
    const componentKey = mappings[update.component];
    const component = components[componentKey] as Component<Schema>;

    if (!componentKey) {
      console.error(`Component mapping not found for component ID ${update.component} ${JSON.stringify(update.value)}`);
      return undefined;
    }

    return {
      ...update,
      entity: entityIndex,
      component,
    };
  };
}

export async function createEncoders(
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
export function applyNetworkUpdates<C extends Components>(
  world: World,
  components: C,
  ecsEvents$: Observable<NetworkEvent<C>[]>,
  mappings: Mappings<C>,
  ack$: Subject<Ack>,
  decodeAndEmitSystemCall?: (event: SystemCall<C>) => void
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
      if (isNetworkComponentUpdateEvent<C>(update)) {
        if (update.lastEventInTx) txReduced$.next(update.txHash);

        const entityIndex = world.entityToIndex.get(update.entity) ?? world.registerEntity({ id: update.entity });
        const componentKey = mappings[update.component];
        if (!componentKey) {
          console.warn("Unknown component:", update);
          continue;
        }
        const component = components[componentKey] as Component<Schema>;

        // keep this logic aligned with CacheStore's storeEvent
        if (update.partialValue !== undefined) {
          if (!getComponentValue(component, entityIndex)) {
            console.warn("Can't make partial update on unset component value. Ignoring update.", {
              componentMetadata: component.metadata,
              entityIndex,
              update,
            });
          } else {
            updateComponent(component, entityIndex, update.partialValue);
          }
        } else if (update.value === undefined) {
          // undefined value means component removed
          removeComponent(component, entityIndex);
        } else {
          setComponent(component, entityIndex, update.value);
        }
      } else if (decodeAndEmitSystemCall && isSystemCallEvent(update)) {
        decodeAndEmitSystemCall(update);
      }
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
