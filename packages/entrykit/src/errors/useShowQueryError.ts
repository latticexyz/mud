import { UseQueryResult } from "@tanstack/react-query";
import { addError } from "./store";
import { useEffect } from "react";

export function useShowQueryError<result extends Pick<UseQueryResult, "error" | "refetch">>(result: result): result {
  const { error, refetch } = result;

  useEffect(() => {
    if (!error) return;
    return addError({ error, retry: refetch, dismiss: () => {} });
  }, [error, refetch]);

  return result;
}
