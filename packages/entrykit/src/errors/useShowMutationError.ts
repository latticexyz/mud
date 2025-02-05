import { UseMutationResult } from "@tanstack/react-query";
import { addError } from "./store";
import { useEffect } from "react";

export function useShowMutationError<result extends Pick<UseMutationResult, "error" | "reset">>(
  result: result,
): result {
  const { error, reset } = result;

  useEffect(() => {
    if (!error) return;
    return addError({ error, dismiss: reset });
  }, [error, reset]);

  return result;
}
