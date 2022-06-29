import { distinctUntilChanged, map, Observable, Subject, take } from "rxjs";
import { Components, ComponentValue } from "@latticexyz/recs";
import { initCache } from "../initCache";
import { awaitStreamValue, DoWork, filterNullish, packTuple, runWorker, unpackTuple } from "@latticexyz/utils";
import { getCacheId } from "./utils";
import { NetworkComponentUpdate } from "../types";
import { ECSStateReply } from "../snapshot";

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
  private state: State = new Map<number, ComponentValue>();
  private components: string[] = [];
  private componentToIndex = new Map<string, number>();
  private entities: string[] = [];
  private entityToIndex = new Map<string, number>();
  private blockNumber?: number;

  constructor() {
    this.init();
  }

  // Update state with ECS event
  private storeEvent(component: string, entity: string, value: ComponentValue | undefined) {
    // Get component index
    let componentIndex = this.componentToIndex.get(component);
    if (componentIndex == null) {
      componentIndex = this.components.push(component) - 1;
      this.componentToIndex.set(component as string, componentIndex);
    }

    // Get entity index
    let entityIndex = this.entityToIndex.get(entity);
    if (entityIndex == null) {
      entityIndex = this.entities.push(entity) - 1;
      this.entityToIndex.set(entity, entityIndex);
    }

    // Entity index gets the right 24 bits, component index the left 8 bits
    const key = packTuple([componentIndex, entityIndex]);
    if (value == null) this.state.delete(key);
    else this.state.set(key, value);
  }

  private async init() {
    const ecsEvent$ = this.ecsEventWithBlockNr$.pipe(
      map(([ecsEvent]) => ecsEvent),
      filterNullish()
    );

    ecsEvent$.subscribe(({ component, entity, value }) => this.storeEvent(component as string, entity, value));

    // Only set this if the block number changed
    ecsEvent$
      .pipe(
        map((e) => e.blockNumber),
        distinctUntilChanged()
      )
      .subscribe((blockNr) => {
        console.log("New block number", blockNr);
        this.blockNumber = blockNr - 1; // The previous block number is set the first time a new block number arrives
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

    const cache = await initCache<{
      ComponentValues: State;
      BlockNumber: number;
      Mappings: string[];
      Checkpoint: ECSStateReply;
    }>(
      getCacheId(chainId, worldAddress), // Store a separate cache for each World contract address
      ["ComponentValues", "BlockNumber", "Mappings", "Checkpoint"]
    );

    // Init local data
    // Store events that might have arrived before the cache was initialized
    const prevState = this.state;
    const prevComponents = this.components;
    const prevEntities = this.entities;
    const prevBlockNumber = this.blockNumber;

    this.state = (await cache.get("ComponentValues", "current")) ?? new Map<number, ComponentValue>();
    this.blockNumber = (await cache.get("BlockNumber", "current")) ?? 0;
    this.components = (await cache.get("Mappings", "components")) || [];
    this.entities = (await cache.get("Mappings", "entities")) || [];

    // Init componentToIndex map
    for (let i = 0; i < this.components.length; i++) {
      this.componentToIndex.set(this.components[i], i);
    }

    // Init entityToIndex map
    for (let i = 0; i < this.entities.length; i++) {
      this.entityToIndex.set(this.entities[i], i);
    }

    // Integrate events that might have arrived before the cache was initialized
    if (prevBlockNumber != null && prevBlockNumber > this.blockNumber) {
      for (const [prevKey, prevValue] of prevState.entries()) {
        const [prevComponentIndex, prevEntityIndex] = unpackTuple(prevKey);
        const prevComponent = prevComponents[prevComponentIndex];
        const prevEntity = prevEntities[prevEntityIndex];
        this.storeEvent(prevComponent, prevEntity, prevValue);
      }
    }

    // Store the local cache to IndexDB once every 10 seconds
    // (indexDB writes take too long to do then every time an event arrives)
    setInterval(async () => {
      console.log("Store cache with size", this.state.size, "at block", this.blockNumber);
      await cache.set("ComponentValues", "current", this.state);
      await cache.set("Mappings", "components", this.components);
      await cache.set("Mappings", "entities", this.entities);
      await cache.set("BlockNumber", "current", this.blockNumber ?? 0);
    }, 10000);
  }

  public work(input$: Observable<Input<Cm>>): Observable<number> {
    input$.subscribe(this.ecsEventWithBlockNr$);
    return this.reducedBlockNr$;
  }
}

runWorker(new CacheWorker());
