import { Address } from "viem";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useClaimGasPass() {
  const queryClient = useQueryClient();

  // TODO: add types for RPC methods
  // TODO: use client.request once this is behind proxyd
  const { passIssuerTransport } = useEntryKitConfig();
  return useMutation({
    onError: (error) => console.error(error),
    mutationKey: ["claimGasPass"],
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

      await queryClient.invalidateQueries({ queryKey: ["readContract"] });
    },
  });
}
