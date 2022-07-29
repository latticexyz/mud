import { distinctUntilChanged, map, Observable, Subject, take } from "rxjs";
import { Components, ComponentValue } from "@latticexyz/recs";
import { awaitStreamValue, DoWork, filterNullish, runWorker } from "@latticexyz/utils";
import { NetworkComponentUpdate } from "../../types";
import {
  createCacheStore,
  loadIndexDbCacheStore,
  mergeCacheStores,
  saveCacheStoreToIndexDb,
  storeEvent,
} from "./CacheStore";

export type Input<Cm extends Components> = [
  NetworkComponentUpdate<Cm> | undefined,
  string | undefined,
  number | undefined
]; // [ECSEvent, blockNumber, worldContractAddress, chainId]
export type Output = never;

export type State = Map<number, ComponentValue>;

export class CacheWorker<Cm extends Components> implements DoWork<Input<Cm>, number> {
  private ecsEventWithBlockNr$ = new Subject<Input<Cm>>();
  private reducedBlockNr$ = new Subject<number>();
  private cacheStore = createCacheStore();

  constructor() {
    console.log("Cache constructor");
    this.init();
  }

  private async init() {
    const ecsEvent$ = this.ecsEventWithBlockNr$.pipe(
      map(([ecsEvent]) => ecsEvent),
      filterNullish()
    );

    ecsEvent$.subscribe((event) => storeEvent(this.cacheStore, event));

    // Only set this if the block number changed
    ecsEvent$
      .pipe(
        map((e) => e.blockNumber),
        distinctUntilChanged()
      )
      .subscribe((blockNr) => {
        console.log("New block number", blockNr);
        this.cacheStore.blockNumber = blockNr - 1; // The previous block number is set the first time a new block number arrives
        this.reducedBlockNr$.next(blockNr);
      });

    const worldAddress = await awaitStreamValue(
      this.ecsEventWithBlockNr$.pipe(
        map(([, worldAddress]) => worldAddress),
        filterNullish(), // Only emit if not undefined
        take(1) // Complete after the first emit
      )
    );

    const chainId = await awaitStreamValue(
      this.ecsEventWithBlockNr$.pipe(
        map(([, , chainId]) => chainId),
        filterNullish(), // Only emit if not undefined
        take(1) // Complete after the first emit
      )
    );

    // Load index db cache store and merge into existing cache store (event that arrived before initialization)
    const indexDbCacheStore = await loadIndexDbCacheStore(chainId, worldAddress);
    const prevCacheStore = this.cacheStore;
    this.cacheStore = mergeCacheStores([prevCacheStore, indexDbCacheStore]);

    // Store the local cache to IndexDB once every 10 seconds
    // (indexDB writes take too long to do then every time an event arrives)
    setInterval(() => saveCacheStoreToIndexDb(this.cacheStore, chainId, worldAddress), 10000);
  }

  public work(input$: Observable<Input<Cm>>): Observable<number> {
    input$.subscribe(this.ecsEventWithBlockNr$);
    return this.reducedBlockNr$;
  }
}

runWorker(new CacheWorker());
console.log("Cache.worker.ts");
