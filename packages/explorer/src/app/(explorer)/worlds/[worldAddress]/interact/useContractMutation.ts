import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Abi, AbiFunction, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { useWalletClient } from "wagmi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { readContract, waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { ACCOUNT_PRIVATE_KEYS } from "../../../../../consts";
import { useChainId } from "../../../../../hooks/useChainId";
import { useAppStore } from "../../../../../store";
import { wagmiConfig } from "../../../Providers";
import { FunctionType } from "./FunctionField";

type UseContractMutationProps = {
  abi: AbiFunction;
  operationType: FunctionType;
};

export function useContractMutation({ abi, operationType }: UseContractMutationProps) {
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const { account } = useAppStore();
  const { worldAddress } = useParams();
  const { data: connectedAccount } = useWalletClient();

  return useMutation({
    mutationFn: async ({ inputs, value }: { inputs: unknown[]; value?: string }) => {
      if (operationType === FunctionType.READ) {
        const result = await readContract(wagmiConfig, {
          abi: [abi] as Abi,
          address: worldAddress as Hex,
          functionName: abi.name,
          args: inputs,
          chainId,
        });

        return { result };
      } else {
        const txHash = await writeContract(wagmiConfig, {
          account: connectedAccount?.account
            ? connectedAccount.account
            : privateKeyToAccount(ACCOUNT_PRIVATE_KEYS[account]),
          abi: [abi] as Abi,
          address: worldAddress as Hex,
          functionName: abi.name,
          args: inputs,
          ...(value && { value: BigInt(value) }),
          chainId,
        });

        const receipt = await waitForTransactionReceipt(wagmiConfig, {
          hash: txHash,
          pollingInterval: 100,
        });

        return { txHash, receipt };
      }
    },
    onMutate: () => {
      if (operationType === FunctionType.WRITE) {
        const toastId = toast.loading("Transaction submitted");
        return { toastId };
      }
    },
    onSuccess: (data, _, context) => {
      if (operationType === FunctionType.WRITE && "txHash" in data) {
        toast.success(`Transaction successful with hash: ${data.txHash}`, {
          id: context?.toastId,
        });
      }

      queryClient.invalidateQueries({
        queryKey: [
          "balance",
          {
            address: account,
            chainId,
          },
        ],
      });
    },
    onError: (error: Error, _, context) => {
      console.error("Error:", error);
      toast.error(error.message || "Something went wrong. Please try again.", {
        id: context?.toastId,
      });
    },
  });
}
