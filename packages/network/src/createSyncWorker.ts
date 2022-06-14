import { Components } from "@latticexyz/recs";
import { observableToStream } from "@latticexyz/utils";
import { observable } from "mobx";
import { fromWorker } from "observable-webworker";
import { Config, Output } from "./workers/Sync.worker";

// TODO: rename this to something specific to workers and move the logic to actually create the stream to a util
export function createSyncWorker<Cm extends Components>(initialConfig: Config<Cm>) {
  const config = observable(initialConfig);
  const worker = new Worker(new URL("./workers/Sync.worker.ts", import.meta.url), { type: "module" });
  return {
    ecsEventStream$: fromWorker<Config<Cm>, Output<Cm>>(() => worker, observableToStream(config)),
    config,
  };
}
