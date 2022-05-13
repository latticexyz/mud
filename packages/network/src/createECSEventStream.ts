import { map, Observable } from "rxjs";
import { ComponentValue, Components, ExtendableECSEvent, SchemaOf } from "@mud/recs";
import { ContractEvent } from "./createContractsEventStream";
import { BaseContract, BigNumber } from "ethers";

export type ValueOf<T extends object> = T[keyof T];

type ECSEventStreamConfig<C extends Components> = {
  mappings: Mappings<C>;
};

export type Mappings<C extends Components> = {
  [key in keyof C]: {
    decoder: (data: string) => ComponentValue<SchemaOf<C[key]>>;
    componentAddress: string;
  };
};

export type ECSEventWithTx<C extends Components> = ExtendableECSEvent<
  C,
  { lastEventInTx: boolean; txHash: string; entity: number }
>;

export type ECSEventStream<C extends Components> = {
  ecsEventStream$: Observable<ECSEventWithTx<C>>;
};

export function createECSStream<C extends Components, W extends BaseContract>(
  config: ECSEventStreamConfig<C>,
  eventStream$: Observable<ContractEvent<{ World: W }>>
): ECSEventStream<C> {
  const { mappings } = config;

  const mappingByContract: { [address: string]: keyof C } = {};
  for (const key of Object.keys(config.mappings)) {
    const { componentAddress } = mappings[key];
    mappingByContract[componentAddress] = key;
  }

  const ecsEventStream$ = eventStream$.pipe(
    map((e) => {
      if (e.contractKey === "World") {
        if (e.eventKey === "ComponentValueSet") {
          const {
            component: address,
            entity,
            data,
          } = e.args as unknown as {
            component: string;
            entity: BigNumber;
            data: string;
          };
          const component = mappingByContract[address];
          if (component) {
            const { decoder } = mappings[component];
            return {
              component,
              value: decoder(data),
              entity: entity.toNumber(),
              lastEventInTx: e.lastEventInTx,
              txHash: e.txHash,
            };
          }
          console.warn("No mapping for this event", e);
        }
        console.warn("Received unexpected event", e);
      }
      console.warn("Received event from unexpecred contract", e);
    })
  );

  return {
    ecsEventStream$,
  } as ECSEventStream<C>;
}
