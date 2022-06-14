import { DoWork, runWorker } from "observable-webworker";
import { distinctUntilChanged, map, Observable, ReplaySubject, Subject } from "rxjs";
import { Components, ComponentValue, ExtendableECSEvent, SchemaOf } from "@latticexyz/recs";
import { initCache } from "../initCache";

export type ECSEventWithTx<C extends Components> = ExtendableECSEvent<
  C,
  { lastEventInTx: boolean; txHash: string; entity: string }
>;

export type Input<Cm extends Components> = [ECSEventWithTx<Cm>, number];
export type Output = never;

export class CacheWorker<Cm extends Components> implements DoWork<Input<Cm>, number> {
  private ecsEventWithBlockNr$ = new ReplaySubject<Input<Cm>>();
  private reducedBlockNr$ = new Subject<number>();

  constructor() {
    this.init();
  }

  private async init() {
    const cache = await initCache<{ ComponentValues: ComponentValue<SchemaOf<Cm[keyof Cm]>>; BlockNumber: number }>(
      "ECSCache",
      ["ComponentValues", "BlockNumber"]
    );

    const ecsEvent$ = this.ecsEventWithBlockNr$.pipe(map(([ecsEvent]) => ecsEvent));
    const blockNr$ = this.ecsEventWithBlockNr$.pipe(map(([, blockNr]) => blockNr));

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
