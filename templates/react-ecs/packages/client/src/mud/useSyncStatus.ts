import { initialProgress } from "@latticexyz/store-sync/internal";
import { SyncStep } from "@latticexyz/store-sync";
import { useMemo } from "react";
import { useComponentValue } from "@latticexyz/react";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { components } from "./recs";

export function useSyncStatus() {
  const progress = useComponentValue(components.SyncProgress, singletonEntity, initialProgress);
  return useMemo(
    () => ({
      ...progress,
      isLive: progress.step === SyncStep.LIVE,
    }),
    [progress],
  );
}
