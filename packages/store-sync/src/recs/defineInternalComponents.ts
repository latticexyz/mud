import { World } from "@latticexyz/recs";
import { tablesToComponents } from "./tablesToComponents";
import { SyncProgress } from "../SyncProgress";

export type InternalComponents = tablesToComponents<{
  SyncProgress: typeof SyncProgress;
}>;

export function defineInternalComponents(world: World): InternalComponents {
  return tablesToComponents(world, {
    SyncProgress,
  });
}
