import { runWorker } from "@latticexyz/utils";
import { SyncWorker } from "./SyncWorker";

console.log("[SyncWorker] Starting Sync Worker");
runWorker(new SyncWorker());
