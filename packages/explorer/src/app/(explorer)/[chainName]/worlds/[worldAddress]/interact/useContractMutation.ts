import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Abi, AbiFunction, Hex } from "viem";
import { useAccount, useConfig } from "wagmi";
import { readContract, waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useChain } from "../../../../hooks/useChain";
import { FunctionType } from "./FunctionField";

type UseContractMutationProps = {
  worldAbi: Abi;
  functionAbi: AbiFunction;
  operationType: FunctionType;
};

export function useContractMutation({ worldAbi, functionAbi, operationType }: UseContractMutationProps) {
  const { worldAddress } = useParams();
  const { id: chainId } = useChain();
  const queryClient = useQueryClient();
  const wagmiConfig = useConfig();
  const account = useAccount();

  return useMutation({
    mutationFn: async ({ inputs, value }: { inputs: unknown[]; value?: string }) => {
      if (operationType === FunctionType.READ) {
        const result = await readContract(wagmiConfig, {
          abi: worldAbi,
          address: worldAddress as Hex,
          functionName: functionAbi.name,
          args: inputs,
          chainId,
        });

        return { result };
      } else {
        const txHash = await writeContract(wagmiConfig, {
          abi: worldAbi,
          address: worldAddress as Hex,
          functionName: functionAbi.name,
          args: inputs,
          ...(value && { value: BigInt(value) }),
          chainId,
        });

        const receipt = await waitForTransactionReceipt(wagmiConfig, { hash: txHash });

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
