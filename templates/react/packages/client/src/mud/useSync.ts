import { useContext } from "react";
import { StashSyncContext } from "./StashSyncProvider";
import { SyncToStashResult } from "@latticexyz/store-sync/internal";

export function useSync(): Partial<SyncToStashResult> {
  const value = useContext(StashSyncContext);
  if (value == null) {
    throw new Error("`useSync` must be used inside a `StashSyncProvider`.");
  }
  const { sync } = value;
  return sync ?? {};
}
