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
  getComponentEntities,
  getComponentValueStrict,
  Component,
  updateComponent,
  Entity,
} from "@latticexyz/recs";
import { isDefined, toEthAddress } from "@latticexyz/utils";
import { Component as SolecsComponent } from "@latticexyz/solecs";
import ComponentAbi from "@latticexyz/solecs/abi/Component.sol/Component.json";
import { Contract, BigNumber, Signer } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { IComputedValue } from "mobx";
import { filter, map, Observable, Subject, timer } from "rxjs";
import { DecodedNetworkComponentUpdate, DecodedSystemCall } from "./types";
import { StoreConfig } from "@latticexyz/store";
import { createDatabaseClient } from "@latticexyz/store-cache";

export function createDecodeNetworkComponentUpdate<C extends Components>(
  world: World,
  components: C,
  mappings: Mappings<C>
): (update: NetworkComponentUpdate) => DecodedNetworkComponentUpdate | undefined {
  return (update: NetworkComponentUpdate) => {
    const entity = update.entity ?? world.registerEntity({ id: update.entity });
    const componentKey = mappings[update.component];
    const component = components[componentKey] as Component<Schema>;

    if (!componentKey) {
      console.error(`Component mapping not found for component ID ${update.component} ${JSON.stringify(update.value)}`);
      return undefined;
    }

    return {
      ...update,
      entity,
      component,
    };
  };
}

export function createSystemCallStreams<C extends Components, SystemTypes extends { [key: string]: Contract }>(
  world: World,
  systemNames: string[],
  systemsRegistry: Component<{ value: Type.String }>,
  getSystemContract: (systemId: string) => { name: string; contract: Contract },
  decodeNetworkComponentUpdate: ReturnType<typeof createDecodeNetworkComponentUpdate>
) {
  const systemCallStreams = systemNames.reduce(
    (streams, systemId) => ({ ...streams, [systemId]: new Subject<DecodedSystemCall<SystemTypes>>() }),
    {} as Record<string, Subject<DecodedSystemCall<SystemTypes, C>>>
  );

  return {
    systemCallStreams,
    decodeAndEmitSystemCall: (systemCall: SystemCall<C>) => {
      const { tx } = systemCall;

      const systemEntity = BigNumber.from(tx.to).toHexString().toLowerCase() as Entity;
      if (!systemEntity) return;

      const hashedSystemId = getComponentValue(systemsRegistry, systemEntity)?.value;
      if (!hashedSystemId) return;

      const { name, contract } = getSystemContract(hashedSystemId);

      const decodedTx = contract.interface.parseTransaction({ data: tx.data, value: tx.value });

      // If this is a newly registered System make a new Subject
      if (!systemCallStreams[name]) {
        systemCallStreams[name] = new Subject<DecodedSystemCall<SystemTypes>>();
      }

      systemCallStreams[name].next({
        ...systemCall,
        updates: systemCall.updates.map(decodeNetworkComponentUpdate).filter(isDefined),
        systemId: name,
        args: decodedTx.args,
      });
    },
  };
}

export async function createEncoders(
  world: World,
  components: Component<{ value: Type.String }>,
  signerOrProvider: IComputedValue<JsonRpcProvider | Signer>
) {
  const encoders = {} as Record<string, ReturnType<typeof createEncoder>>;

  async function fetchAndCreateEncoder(entity: Entity) {
    const componentAddress = toEthAddress(entity);
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
export function applyNetworkUpdates<C extends Components, S extends StoreConfig>(
  world: World,
  components: C,
  ecsEvents$: Observable<NetworkEvent<C>[]>,
  mappings: Mappings<C>,
  ack$: Subject<Ack>,
  storeConfig?: S,
  storeCache?: ReturnType<typeof createDatabaseClient<S>>,
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

        if (storeCache && storeConfig) {
          // Apply network updates to store cache
          const { namespace, table, key } = update;

          const tableConfig = storeConfig.tables[table];

          // Apply network updates to cache store
          if (!tableConfig || namespace !== tableConfig.namespace) {
            // console.warn("Ignoring table config outside own mud config", update, tableConfig.namespace);
          } else {
            // TODO: key names are not yet part of the on-chain table metadata, so we have to
            // load them from the local mud.config (and have to ignore all tables that are not
            // defined in the local mud config)
            // (see https://github.com/latticexyz/mud/issues/824)

            // `Object.getOwnPropertyNames` guarantees key order, `Object.keys` does not
            const namedKey = nameKeys(key, Object.getOwnPropertyNames(tableConfig.keySchema));

            // StoreCache handles setting partial value and initializing with default values
            const value = update.value ?? update.partialValue;
            if (value) {
              const namedValue = nameKeys(value, Object.getOwnPropertyNames(tableConfig.schema));
              storeCache.set(namespace, table, namedKey as any, namedValue as any);
            } else {
              storeCache.remove(namespace, table, namedKey as any);
            }
          }
        }

        const entity = update.entity ?? world.registerEntity({ id: update.entity });
        const componentKey = mappings[update.component];
        if (!componentKey) {
          console.warn("Unknown component:", update);
          continue;
        }
        const component = components[componentKey] as Component<Schema>;

        // keep this logic aligned with CacheStore's storeEvent
        if (update.partialValue !== undefined) {
          updateComponent(component, entity, update.partialValue, update.initialValue);
        } else if (update.value === undefined) {
          // undefined value means component removed
          removeComponent(component, entity);
        } else {
          setComponent(component, entity, update.value);
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

function nameKeys(indexedRecord: Record<number, unknown>, keyNames: string[]) {
  const namedRecord: Record<string, unknown> = {};
  keyNames.forEach((key, index) => {
    if (index in indexedRecord) {
      namedRecord[key] = indexedRecord[index];
    }
  });
  return namedRecord;
}
