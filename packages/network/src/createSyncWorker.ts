import { Components } from "@latticexyz/recs";
import { fromWorker } from "@latticexyz/utils";
import { map, Observable, Subject, timer } from "rxjs";
import { NetworkEvent } from "./types";
import { Input, Ack, ack, SyncWorker } from "./workers/SyncWorker";

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
export function createSyncWorker<C extends Components = Components>(
  ack$?: Observable<Ack>,
  options?: { thread?: "main" | "worker" }
) {
  const thread = options?.thread || "worker";
  const input$ = new Subject<Input>();
  const ecsEvents$ = new Subject<NetworkEvent<C>[]>();
  let dispose: () => void;

  // Send ack every 16ms if no external ack$ is provided
  ack$ = ack$ || timer(0, 16).pipe(map(() => ack));
  const ackSub = ack$.subscribe(input$);

  // If thread option is "worker", create a new web worker to sync the state
  if (thread === "worker") {
    const worker = new Worker(new URL("./workers/Sync.worker.js", import.meta.url), { type: "module" });

    // Pass in a "config stream", receive a stream of ECS events
    const subscription = fromWorker<Input, NetworkEvent<C>[]>(worker, input$).subscribe(ecsEvents$);
    dispose = () => {
      worker.terminate();
      subscription?.unsubscribe();
      ackSub?.unsubscribe();
    };
  } else {
    // Otherwise sync the state in the main thread
    // Pass in a "config stream", receive a stream of ECS events
    const subscription = new SyncWorker<C>().work(input$).subscribe(ecsEvents$);
    dispose = () => {
      subscription?.unsubscribe();
      ackSub?.unsubscribe();
    };
  }

  return {
    ecsEvents$,
    input$,
    dispose,
  };
}
