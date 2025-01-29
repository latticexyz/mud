import { createWorld } from "@latticexyz/recs";
import { createSyncAdapter } from "@latticexyz/store-sync/recs";
import config from "contracts/mud.config";

export const world = createWorld();
export const { syncAdapter, components } = createSyncAdapter({ world, config });
