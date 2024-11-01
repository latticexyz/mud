import { Address } from "viem";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quarryPassIssuer } from "../transports/quarryPassIssuer";

export function useClaimGasPass() {
  const queryClient = useQueryClient();
  const { chain } = useEntryKitConfig();

  const mutationKey = ["claimGasPass", chain.id];
  return useMutation({
    mutationKey,
    onError: (error) => console.error(error),
    mutationFn: async (userAddress: Address) => {
      const transport = quarryPassIssuer()({ chain });
      // TODO: handle case where you already have a pass?
      await transport.request({
        method: "quarry_issuePass",
        params: ["0x01", userAddress],
      });
      await transport.request({
        method: "quarry_claimAllowance",
        params: ["0x01", userAddress],
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["getAllowance"] }),
        queryClient.invalidateQueries({ queryKey: ["getPrerequisites"] }),
      ]);
    },
    retry: 0,
  });
}
