import { stash } from "./stash";
import { initialProgress, SyncProgress } from "@latticexyz/store-sync/internal";
import { SyncStep } from "@latticexyz/store-sync";
import { useMemo } from "react";
import { useRecord } from "@latticexyz/stash/react";

export function useSyncStatus() {
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
