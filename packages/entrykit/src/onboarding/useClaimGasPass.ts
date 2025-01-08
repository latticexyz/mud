import { Address, parseEther } from "viem";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { claimGasPass } from "../quarry/claimGasPass";
import { setAllowanceSlot } from "../quarry/getAllowance";
import { useClient } from "wagmi";

export function useClaimGasPass() {
  const queryClient = useQueryClient();
  const { chain } = useEntryKitConfig();
  const client = useClient({ chainId: chain.id });

  const mutationKey = ["claimGasPass", chain.id];
  return useMutation({
    mutationKey,
    onError: (error) => console.error(error),
    mutationFn: async (userAddress: Address) => {
      if (chain.id === 31337) {
        if (!client) throw new Error("No client?");
        await setAllowanceSlot({ client, userAddress, allowance: parseEther("1") });
      } else {
        // TODO: handle case where you already have a pass?
        // TODO: get returned tx hashes to check if success
        await claimGasPass({ chain, userAddress });
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["getAllowance"] }),
        queryClient.invalidateQueries({ queryKey: ["getPrerequisites"] }),
      ]);
    },
    retry: 0,
  });
}
