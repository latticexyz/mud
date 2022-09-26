import { Components } from "@latticexyz/recs";
import { fromWorker } from "@latticexyz/utils";
import { Subject } from "rxjs";
import { NetworkComponentUpdate, SyncWorkerConfig } from "./types";
import { Output } from "./workers/SyncWorker";

/**
 * Create a new SyncWorker ({@link Sync.worker.ts}) to performn contract/client state sync.
 * The main thread and worker communicate via RxJS streams.
 *
 * @returns Object {
 * ecsEvent$: Stream of network component updates synced by the SyncWorker,
 * config$: RxJS subject to pass in config for the SyncWorker,
 * dispose: function to dispose of the sync worker
 * }
 */
export function createSyncWorker<Cm extends Components>() {
  const config$ = new Subject<SyncWorkerConfig>();
  const worker = new Worker(new URL("./workers/Sync.worker.ts", import.meta.url), { type: "module" });
  const ecsEvent$ = new Subject<NetworkComponentUpdate<Cm>>();

  // Pass in a "config stream", receive a stream of ECS events
  const subscription = fromWorker<SyncWorkerConfig, Output<Cm>>(worker, config$).subscribe(ecsEvent$);
  const dispose = () => {
    worker.terminate();
    subscription?.unsubscribe();
  };

  return {
    ecsEvent$,
    config$,
    dispose,
  };
}
