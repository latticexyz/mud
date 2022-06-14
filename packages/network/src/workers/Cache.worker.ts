import { DoWork, runWorker } from "observable-webworker";
import { distinctUntilChanged, filter, map, Observable, ReplaySubject, Subject, take } from "rxjs";
import { Components, ComponentValue, ExtendableECSEvent, SchemaOf } from "@latticexyz/recs";
import { initCache } from "../initCache";
import { awaitStreamValue, filterNullish } from "@latticexyz/utils";
import { getCacheId } from "./utils";

export type ECSEventWithTx<C extends Components> = ExtendableECSEvent<
  C,
  { lastEventInTx: boolean; txHash: string; entity: string }
>;

export type Input<Cm extends Components> = [ECSEventWithTx<Cm>, number, string | undefined, number | undefined]; // [ECSEvent, blockNumber, worldContractAddress, chainId]
export type Output = never;

export class CacheWorker<Cm extends Components> implements DoWork<Input<Cm>, number> {
  private ecsEventWithBlockNr$ = new ReplaySubject<Input<Cm>>();
  private reducedBlockNr$ = new Subject<number>();

  constructor() {
    this.init();
  }

  private async init() {
    const ecsEvent$ = this.ecsEventWithBlockNr$.pipe(
      filter((e) => typeof e !== "string"),
      map(([ecsEvent]) => ecsEvent)
    );
    const blockNr$ = this.ecsEventWithBlockNr$.pipe(map(([, blockNr]) => blockNr));

    const worldAddress = await awaitStreamValue(
      this.ecsEventWithBlockNr$.pipe(
        map(([, , worldAddress]) => worldAddress),
        filterNullish(), // Only emit if not undefined
        take(1) // Complete after the first emit
      )
    );

    const chainId = await awaitStreamValue(
      this.ecsEventWithBlockNr$.pipe(
        map(([, , , chainId]) => chainId),
        filterNullish(), // Only emit if not undefined
        take(1) // Complete after the first emit
      )
    );

    const cache = await initCache<{ ComponentValues: ComponentValue<SchemaOf<Cm[keyof Cm]>>; BlockNumber: number }>(
      getCacheId(chainId, worldAddress), // Store a separate cache for each World contract address
      ["ComponentValues", "BlockNumber"]
    );

    ecsEvent$
      .pipe(map((event) => ({ key: `${event.component}/${event.entity}`, value: event.value })))
      .subscribe(({ key, value }) => {
        cache.set("ComponentValues", key, value);
      });

    // Only set this if the block number changed
    blockNr$.pipe(distinctUntilChanged()).subscribe((blockNr) => {
      cache.set("BlockNumber", "current", blockNr);
      this.reducedBlockNr$.next(blockNr);
    });
  }

  public work(input$: Observable<Input<Cm>>): Observable<number> {
    input$.subscribe(this.ecsEventWithBlockNr$);
    return this.reducedBlockNr$;
  }
}

runWorker(CacheWorker);
