import { runWorker } from "@latticexyz/utils";
import { SyncWorker } from "./SyncWorker";

console.log("Starting Sync Worker");
runWorker(new SyncWorker());
