import { useContext } from "react";
import { SyncContext } from "./SyncProvider";
import { SyncResult } from "../common";
import { UseQueryResult } from "@tanstack/react-query";

export function useSync(): UseQueryResult<SyncResult> {
  const value = useContext(SyncContext);
  if (value == null) {
    throw new Error("`useSync` must be used inside a `SyncProvider`.");
  }
  return value;
}
