import { Address } from "viem";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useClaimGasPass() {
  const queryClient = useQueryClient();
  // TODO: add types for RPC methods
  // TODO: use client.request once this is behind proxyd
  const { passIssuerTransport } = useEntryKitConfig();

  const mutationKey = ["claimGasPass"];
  return useMutation({
    mutationKey,
    onError: (error) => console.error(error),
    mutationFn: async (userAddress: Address) => {
      const transport = passIssuerTransport({ retryCount: 0 });
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
