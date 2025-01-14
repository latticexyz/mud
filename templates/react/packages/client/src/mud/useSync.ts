import { useContext } from "react";
import { SyncContext } from "./SyncProvider";
import { SyncResult } from "@latticexyz/store-sync";

export function useSync(): Partial<SyncResult> {
  const value = useContext(SyncContext);
  if (value == null) {
    throw new Error("`useSync` must be used inside a `SyncProvider`.");
  }
  const { sync } = value;
  return sync ?? {};
}
