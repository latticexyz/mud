import { ReactNode } from "react";
import { useSyncStatus } from "./useSyncStatus";
import { ComponentValue } from "@latticexyz/recs";
import { components } from "./recs";

export type Props = {
  children: ReactNode;
  fallback?: (props: ComponentValue<(typeof components)["SyncProgress"]["schema"]>) => ReactNode;
};

export function Synced({ children, fallback }: Props) {
  const status = useSyncStatus();
  return status.isLive ? children : fallback?.(status);
}
