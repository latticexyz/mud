import { Components } from "@latticexyz/recs";
import { observableToStream } from "@latticexyz/utils";
import { observable } from "mobx";
import { fromWorker } from "observable-webworker";
import { Contracts } from "./types";
import { Config, Output } from "./workers/Sync.worker";

export function createECSEventStream<Cn extends Contracts, Cm extends Components>(initialConfig: Config<Cn, Cm>) {
  const config = observable(initialConfig);
  const worker = new Worker(new URL("./workers/Sync.worker.ts", import.meta.url), { type: "module" });
  return {
    ecsEventStream$: fromWorker<Config<Cn, Cm>, Output<Cn, Cm>>(() => worker, observableToStream(config)),
    config,
  };
}
