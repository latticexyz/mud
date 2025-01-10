import { stash } from "./stash";
import { initialProgress, SyncProgress } from "@latticexyz/store-sync/internal";
import { SyncStep } from "@latticexyz/store-sync";
import { useMemo } from "react";
import { useRecord } from "./useRecord";

export function useSyncProgress() {
  const progress = useRecord({
    stash,
    table: SyncProgress,
    key: {},
    defaultValue: initialProgress,
  });
  return useMemo(
    () => ({
      ...progress,
      isLive: progress.step === SyncStep.LIVE,
    }),
    [progress],
  );
}
