import { awaitValue, filterNullish } from "@latticexyz/utils";
import { autorun, computed, IComputedValue, IObservableValue, observable, reaction } from "mobx";
import { DoWork, runWorker } from "observable-webworker";
import { concatMap, identity, map, Observable, of, Subject, withLatestFrom } from "rxjs";
import { fetchEventsInBlockRange } from "../networkUtils";
import { createBlockNumberStream } from "../createBlockNumberStream";
import { createReconnectingProvider } from "../createProvider";
import { ContractEvent, Contracts, ContractsConfig, ContractTopics, Mappings, ProviderConfig } from "../types";
import { observableToBeFn } from "rxjs/internal/testing/TestScheduler";
import { BigNumber, Contract } from "ethers";
import { createDecoder } from "../createDecoder";
import { Components, ComponentValue, ExtendableECSEvent, SchemaOf } from "@latticexyz/recs";

export type Config<Cn extends Contracts, Cm extends Components> = {
  provider: ProviderConfig;
  initialBlockNumber: number;
  topics: ContractTopics<Cn>[];
  contracts: ContractsConfig<Cn>;
  mappings: Mappings<Cm>;
};

export type ECSEventWithTx<C extends Components> = ExtendableECSEvent<
  C,
  { lastEventInTx: boolean; txHash: string; entity: string }
>;

export type Output<Cm extends Components> = ECSEventWithTx<Cm>;

export class SyncWorker<Cn extends Contracts, Cm extends Components> implements DoWork<Config<Cn, Cm>, Output<Cm>> {
  private config = observable.box<Config<Cn, Cm>>() as IObservableValue<Config<Cn, Cm>>;
  private clientBlockNumber = 1;
  private decoders: { [key: string]: (data: string) => unknown } = {};
  private output$ = new Subject<Output<Cm>>();

  constructor() {
    this.init();
  }

  private async init() {
    // Only run this once we have an initial config
    await awaitValue(this.config);

    const { providers, connected } = await createReconnectingProvider(computed(() => this.config.get().provider));

    const { blockNumber$ } = createBlockNumberStream(providers, {
      // TODO: Start from given initial block number
      initialSync: { initialBlockNumber: 0, interval: 200, gap: 32 },
    });

    // If ECS sidecar is not available
    // TODO: move this into own utility to be able to create a contract event stream without a webworker too
    // TODO: add some kind of config to return a ContractEvent stream and disregard ECS (or maybe that should be a separate worker?)
    blockNumber$
      .pipe(
        map((e) => {
          console.log("Blocknr", e);
          return e;
        }),
        withLatestFrom(awaitValue(this.config), awaitValue(connected)), // Only process if config is available and connected
        map(([blockNumber, config]) => {
          // TODO: Figure out why we call this like 10 times when there is a new event
          const events = fetchEventsInBlockRange(
            providers.get().json,
            config.topics,
            this.clientBlockNumber + 1,
            blockNumber,
            config.contracts,
            config.provider.options?.batch
          );

          this.clientBlockNumber = blockNumber;
          return events;
        }),
        concatMap(identity), // Await promises
        concatMap((v) => of(...v)), // Flatten contract event array into stream of contract events
        map(async (event) => {
          if (event.contractKey !== "World") return; // We only care about events from the World contract
          if (event.eventKey !== "ComponentValueSet" && event.eventKey !== "ComponentValueRemoved") return; // We only care about these events

          const {
            component: address,
            entity,
            data,
            componentId,
          } = event.args as unknown as {
            component: string;
            entity: BigNumber;
            data: string;
            componentId: BigNumber;
          };

          const contractComponentId = BigNumber.from(componentId).toHexString();
          const clientComponentKey = this.config.get().mappings[contractComponentId];

          if (!clientComponentKey) return; // No client mapping for this component contract

          // Create decoder and cache for later
          let decoder = this.decoders[contractComponentId];
          if (!decoder) {
            decoder = await createDecoder(address, providers.get().json);
            this.decoders[contractComponentId] = decoder;
          }

          return {
            component: clientComponentKey,
            value: decoder(data) as ComponentValue<SchemaOf<Cm[typeof clientComponentKey]>>,
            entity: BigNumber.from(entity).toHexString(),
            lastEventInTx: event.lastEventInTx,
            txHash: event.txHash,
          };
        }),
        concatMap(identity), // Await promises
        filterNullish() // Only emit if a ECS event was constructed
      )
      .subscribe(this.output$);
  }

  public work(input$: Observable<Config<Cn, Cm>>): Observable<Output<Cm>> {
    input$.subscribe((config) => this.config.set(config));
    return this.output$.asObservable();
  }
}

runWorker(SyncWorker);
