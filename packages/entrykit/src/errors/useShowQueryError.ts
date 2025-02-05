import { UseQueryResult } from "@tanstack/react-query";
import { addError } from "./store";
import { useEffect } from "react";

export function useShowQueryError<result extends UseQueryResult>(result: result): result {
  const { error, refetch } = result;

  useEffect(() => {
    if (!error) return;
    return addError(error, refetch);
  }, [error, refetch]);

  return result;
}
