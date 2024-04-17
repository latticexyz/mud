import { useAccount, useConfig as useWagmiConfig, useWriteContract } from "wagmi";
import { useConfig } from "../../../AccountKitProvider";
import { getGasTankBalanceQueryKey } from "../../../useGasTankBalance";
import { waitForTransactionReceipt } from "wagmi/actions";
import { useQueryClient } from "@tanstack/react-query";
import { useOnboardingSteps } from "../../../useOnboardingSteps";

export const useDirectDeposit = () => {
  const queryClient = useQueryClient();
  const wagmiConfig = useWagmiConfig();
  const { chain, gasTankAddress } = useConfig();
  const { resetStep } = useOnboardingSteps();
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;

  return useWriteContract({
    mutation: {
      onSuccess: async (hash) => {
        const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
        if (receipt.status === "success") {
          queryClient.invalidateQueries({
            queryKey: getGasTankBalanceQueryKey({ chainId: chain.id, gasTankAddress, userAccountAddress }),
          });
          resetStep();
        }
      },
    },
  });
};
