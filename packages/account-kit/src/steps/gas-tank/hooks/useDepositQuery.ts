import { useQueryClient } from "@tanstack/react-query";
import { useConfig as useWagmiConfig, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { useOnboardingSteps } from "../../../useOnboardingSteps";

export const useDepositQuery = () => {
  const queryClient = useQueryClient();
  const wagmiConfig = useWagmiConfig();
  const { resetStep } = useOnboardingSteps();

  return useWriteContract({
    mutation: {
      onSuccess: async (hash) => {
        const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
        if (receipt.status === "success") {
          queryClient.invalidateQueries();
          resetStep();
        }
      },
    },
  });
};
