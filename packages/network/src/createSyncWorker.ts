import { Components } from "@latticexyz/recs";
import { fromWorker } from "@latticexyz/utils";
import { map, Observable, Subject, timer } from "rxjs";
import { NetworkEvent, SyncWorkerConfig } from "./types";
import { Input, Ack } from "./workers/SyncWorker";

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
export function createSyncWorker<C extends Components = Components>(ack$?: Observable<Ack>) {
  const input$ = new Subject<Input>();
  const worker = new Worker(new URL("./workers/Sync.worker.ts", import.meta.url), { type: "module" });
  const ecsEvents$ = new Subject<NetworkEvent<C>[]>();

  // Send ack every 16ms if no external ack$ is provided
  ack$ = ack$ || timer(0, 16).pipe(map(() => ({ type: "ack" as const })));
  const ackSub = ack$.subscribe(input$);

  // Pass in a "config stream", receive a stream of ECS events
  const subscription = fromWorker<{ type: "config"; data: SyncWorkerConfig } | { type: "ack" }, NetworkEvent<C>[]>(
    worker,
    input$
  ).subscribe(ecsEvents$);
  const dispose = () => {
    worker.terminate();
    subscription?.unsubscribe();
    ackSub?.unsubscribe();
  };

  return {
    ecsEvents$,
    input$,
    dispose,
  };
}
