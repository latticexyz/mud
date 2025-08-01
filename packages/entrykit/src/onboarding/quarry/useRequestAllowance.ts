import { Address } from "viem";
import { useEntryKitConfig } from "../../EntryKitConfigProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestAllowance } from "../../quarry/requestAllowance";

export function useRequestAllowance() {
  const queryClient = useQueryClient();
  const { chain } = useEntryKitConfig();

  const mutationKey = ["requestAllowance", chain.id];
  return useMutation({
    retry: 0,
    mutationKey,
    mutationFn: async (userAddress: Address) => {
      await requestAllowance({ chain, userAddress });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["getAllowance"] }),
        queryClient.invalidateQueries({ queryKey: ["getFunds"] }),
        queryClient.invalidateQueries({ queryKey: ["getPrerequisites"] }),
      ]);
    },
  });
}
