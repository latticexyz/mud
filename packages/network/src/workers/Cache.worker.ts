import { DoWork, runWorker } from "observable-webworker";
import { distinctUntilChanged, map, Observable, ReplaySubject, Subject, take } from "rxjs";
import { Components, ComponentValue, SchemaOf } from "@latticexyz/recs";
import { initCache } from "../initCache";
import { awaitStreamValue, filterNullish } from "@latticexyz/utils";
import { getCacheId } from "./utils";
import { NetworkComponentUpdate } from "../types";
import { ECSStateReply } from "../snapshot";

export type Input<Cm extends Components> = [
  NetworkComponentUpdate<Cm> | undefined,
  number | undefined,
  string | undefined,
  number | undefined
]; // [ECSEvent, blockNumber, worldContractAddress, chainId]
export type Output = never;

export class CacheWorker<Cm extends Components> implements DoWork<Input<Cm>, number> {
  private ecsEventWithBlockNr$ = new ReplaySubject<Input<Cm>>();
  private reducedBlockNr$ = new Subject<number>();
  private cache: ReturnType<typeof initCache>;
  private entityToIndex = new Map<string, number>();
  private componentToIndex = new Map<string, number>();

  constructor() {
    this.init();
  }

  private getEntityIndex(id: string): number {
    let index = this.entityToIndex.get(id);
    if (index != null) return index;
    index = this.entityToIndex.size;
    this.entityToIndex.set(id, index);
    this.cache.set("Entities", id, index);
    return index;
  }

  private getComponentIndex(id: string): number {
    let index = this.componentToIndex.get(id);
    if (index != null) return index;
    index = this.componentToIndex.size;
    this.componentToIndex.set(id, index);
    this.cache.set("Components", id, index);
    return index;
  }

  private async init() {
    const ecsEvent$ = this.ecsEventWithBlockNr$.pipe(
      map(([ecsEvent]) => ecsEvent),
      filterNullish()
    );
    const blockNr$ = this.ecsEventWithBlockNr$.pipe(
      map(([, blockNr]) => blockNr),
      filterNullish()
    );

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

    const cache = await initCache<{
      ComponentValues: ComponentValue<SchemaOf<Cm[keyof Cm]>>;
      BlockNumber: number;
      Entities: number;
      Components: number;
      Checkpoint: ECSStateReply;
    }>(
      getCacheId(chainId, worldAddress), // Store a separate cache for each World contract address
      ["ComponentValues", "BlockNumber", "Entities", "Components", "Checkpoint"]
    );
    this.cache = cache;

    // Initialize maps
    const entities = await cache.entries("Entities");
    for (const [id, index] of entities) {
      this.entityToIndex.set(id, index);
    }

    const components = await cache.entries("Components");
    for (const [id, index] of components) {
      this.componentToIndex.set(id, index);
    }

    ecsEvent$
      .pipe(
        map((event) => ({
          key: `${this.getComponentIndex(String(event.component))}/${this.getEntityIndex(event.entity)}`,
          value: event.value,
        }))
      )
      .subscribe(({ key, value }) => {
        if (value === undefined) {
          cache.remove("ComponentValues", key);
        } else {
          cache.set("ComponentValues", key, value);
        }
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
