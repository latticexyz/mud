import { Components } from "@latticexyz/recs";
import { observableToStream } from "@latticexyz/utils";
import { observable } from "mobx";
import { fromWorker } from "observable-webworker";
import { Subject } from "rxjs";
import { ECSEventWithTx } from "./types";
import { Config, Output } from "./workers/Sync.worker";

export function createSyncWorker<Cm extends Components>(initialConfig: Config<Cm>) {
  const config = observable(initialConfig);
  const worker = new Worker(new URL("./workers/Sync.worker.ts", import.meta.url), { type: "module" });
  const ecsEvent$ = new Subject<ECSEventWithTx<Cm>>();

  // Pass in a "config stream", receive a stream of ECS events
  fromWorker<Config<Cm>, Output<Cm>>(() => worker, observableToStream(config)).subscribe(ecsEvent$);

  return {
    ecsEvent$,
    config,
  };
}
