import { Address } from "viem";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { claimGasPass } from "@latticexyz/paymaster/internal";

export function useClaimGasPass() {
  const queryClient = useQueryClient();
  const { chain } = useEntryKitConfig();

  const mutationKey = ["claimGasPass", chain.id];
  return useMutation({
    mutationKey,
    onError: (error) => console.error(error),
    mutationFn: async (userAddress: Address) => {
      // TODO: handle case where you already have a pass?
      // TODO: get returned tx hashes to check if success
      await claimGasPass({ chain, userAddress });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["getAllowance"] }),
        queryClient.invalidateQueries({ queryKey: ["getPrerequisites"] }),
      ]);
    },
    retry: 0,
  });
}
