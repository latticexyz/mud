import { runWorker } from "@latticexyz/utils";
import { SyncWorker } from "./SyncWorker";

runWorker(new SyncWorker());
