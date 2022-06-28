import { Components } from "@latticexyz/recs";
import { fromWorker } from "@latticexyz/utils";
import { Subject } from "rxjs";
import { NetworkComponentUpdate, SyncWorkerConfig } from "./types";
import { Output } from "./workers/Sync.worker";

export function createSyncWorker<Cm extends Components>() {
  const config$ = new Subject<SyncWorkerConfig<Cm>>();
  const worker = new Worker(new URL("./workers/Sync.worker.ts", import.meta.url), { type: "module" });
  const ecsEvent$ = new Subject<NetworkComponentUpdate<Cm>>();

  // Pass in a "config stream", receive a stream of ECS events
  const subscription = fromWorker<SyncWorkerConfig<Cm>, Output<Cm>>(worker, config$).subscribe(ecsEvent$);
  const dispose = () => subscription?.unsubscribe();

  return {
    ecsEvent$,
    config$,
    dispose,
  };
}
