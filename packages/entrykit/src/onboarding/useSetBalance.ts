import { useQueryClient, useMutation } from "@tanstack/react-query";
import { SetBalanceParameters, TestClient } from "viem";
import { setBalance } from "viem/actions";
import { useClient } from "wagmi";
import { useEntryKitConfig } from "../EntryKitConfigProvider";

/**
 * Set balance at address. This assumes the configured chain is an Anvil chain and supports `anvil_setAccountBalance`.
 */
export function useSetBalance() {
  const queryClient = useQueryClient();
  const { chainId } = useEntryKitConfig();
  const client = useClient({ chainId });

  return useMutation({
    mutationKey: ["setBalance", chainId],
    onError: (error) => console.error(error),
    mutationFn: async (params: SetBalanceParameters) => {
      if (!client) return null;

      await setBalance({ ...(client as TestClient), mode: "anvil" }, params);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["balance"] }),
        queryClient.invalidateQueries({ queryKey: ["getPrerequisites"] }),
      ]);

      return null;
    },
    retry: 0,
  });
}
