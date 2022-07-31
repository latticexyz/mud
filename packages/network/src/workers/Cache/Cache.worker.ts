import { distinctUntilChanged, EMPTY, map, Observable, Subject, take } from "rxjs";
import { Components, ComponentValue } from "@latticexyz/recs";
import { awaitStreamValue, DoWork, filterNullish, runWorker } from "@latticexyz/utils";
import { NetworkComponentUpdate } from "../../types";
import {
  createCacheStore,
  getIndexDbCache,
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
  private output$ = new Subject<number>();
  private store = createCacheStore();

  constructor() {
    this.init();
  }

  private async init() {
    const ecsEvent$ = this.ecsEventWithBlockNr$.pipe(
      map(([ecsEvent]) => ecsEvent),
      filterNullish()
    );

    ecsEvent$.subscribe((event) => storeEvent(this.store, event));

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
    const cache = await getIndexDbCache(chainId, worldAddress);
    const indexDbCacheStore = await loadIndexDbCacheStore(cache);
    const prevCacheStore = this.store;
    this.store = mergeCacheStores([prevCacheStore, indexDbCacheStore]);

    // Store the local cache to IndexDB once every 10 seconds
    // (indexDB writes take too long to do then every time an event arrives)
    setInterval(() => saveCacheStoreToIndexDb(cache, this.store), 10000);
  }

  public work(input$: Observable<Input<Cm>>): Observable<number> {
    input$.subscribe(this.ecsEventWithBlockNr$);
    return this.output$;
  }
}

runWorker(new CacheWorker());
