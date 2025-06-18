import { useEffect } from "react";
import { useSetFieldMutation } from "./useSetFieldMutation";

export function useTrackPendingValue(write: ReturnType<typeof useSetFieldMutation>, blockHeight: number) {
  useEffect(() => {
    if (write.status === "success" && BigInt(blockHeight) >= write.data.receipt.blockNumber) {
      write.reset();
    }
  }, [write, blockHeight]);
}
