import { SyncStep } from "../SyncStep";
import { assertExhaustive } from "@latticexyz/common/utils";

export function syncStepToMessage(step: SyncStep): string {
  switch (step) {
    case SyncStep.INITIALIZE:
      return "Connecting";
    case SyncStep.SNAPSHOT:
      return "Hydrating from snapshot";
    case SyncStep.RPC:
      return "Hydrating from RPC";
    case SyncStep.LIVE:
      return "All caught up!";
    default:
      assertExhaustive(step);
  }
}
