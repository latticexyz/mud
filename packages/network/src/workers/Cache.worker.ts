import { distinctUntilChanged, map, Observable, Subject, take } from "rxjs";
import { Components, ComponentValue, SchemaOf } from "@latticexyz/recs";
import { initCache } from "../initCache";
import { awaitStreamValue, DoWork, filterNullish, runWorker } from "@latticexyz/utils";
import { getCacheId } from "./utils";
import { NetworkComponentUpdate } from "../types";
import { ECSStateReply } from "../snapshot";

export type Input<Cm extends Components> = [
  NetworkComponentUpdate<Cm> | undefined,
  string | undefined,
  number | undefined
]; // [ECSEvent, blockNumber, worldContractAddress, chainId]
export type Output = never;

export type State<Cm extends Components> = { [key: string]: ComponentValue<SchemaOf<Cm[keyof Cm]>> };

export class CacheWorker<Cm extends Components> implements DoWork<Input<Cm>, number> {
  private ecsEventWithBlockNr$ = new Subject<Input<Cm>>();
  private reducedBlockNr$ = new Subject<number>();
  private state: State<Cm> = {};
  private blockNumber?: number;

  constructor() {
    this.init();
  }

  private async init() {
    const ecsEvent$ = this.ecsEventWithBlockNr$.pipe(
      map(([ecsEvent]) => ecsEvent),
      filterNullish()
    );

    ecsEvent$.subscribe(({ component, entity, value }) => {
      const key = `${component}/${entity}`;
      if (value == null) delete this.state[key];
      else this.state[key] = value;
    });

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
      ComponentValues: State<Cm>;
      BlockNumber: number;
      Checkpoint: ECSStateReply;
    }>(
      getCacheId(chainId, worldAddress), // Store a separate cache for each World contract address
      ["ComponentValues", "BlockNumber", "Checkpoint"]
    );

    // Init local data
    this.state = (await cache.get("ComponentValues", "current")) ?? {};
    this.blockNumber = this.blockNumber ?? (await cache.get("BlockNumber", "current")) ?? 0;

    // Store the local cache to IndexDB once every 10 seconds
    // (indexDB writes take too long to do then every time an event arrives)
    setInterval(() => {
      console.log("Store cache with size", Object.values(this.state).length, "at block", this.blockNumber);
      cache.set("ComponentValues", "current", this.state);
      cache.set("BlockNumber", "current", this.blockNumber ?? 0);
    }, 10000);
  }

  public work(input$: Observable<Input<Cm>>): Observable<number> {
    input$.subscribe(this.ecsEventWithBlockNr$);
    return this.reducedBlockNr$;
  }
}

runWorker(new CacheWorker());
