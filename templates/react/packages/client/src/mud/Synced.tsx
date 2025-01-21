import { ReactNode } from "react";
import { useSyncStatus } from "./useSyncStatus";
import { TableRecord } from "@latticexyz/stash/internal";
import { SyncProgress } from "@latticexyz/store-sync/stash/common";

export type Props = {
  children: ReactNode;
  fallback?: (props: TableRecord<typeof SyncProgress>) => ReactNode;
};

export function Synced({ children, fallback }: Props) {
  const status = useSyncStatus();
  return status.isLive ? children : fallback?.(status);
}
