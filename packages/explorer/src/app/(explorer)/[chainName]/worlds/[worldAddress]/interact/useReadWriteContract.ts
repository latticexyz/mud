import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Abi, AbiFunction, Address, decodeEventLog } from "viem";
import { useAccount, useConfig } from "wagmi";
import { readContract, waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useChain } from "../../../../hooks/useChain";
import { FunctionType, getOperationType } from "./getOperationType";

type UseReadWriteContractProps = {
  worldAbi: Abi;
  functionAbi: AbiFunction;
};

export function useReadWriteContract({ worldAbi, functionAbi }: UseReadWriteContractProps) {
  const operationType = getOperationType(functionAbi);
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
          address: worldAddress as Address,
          functionName: functionAbi.name,
          args: inputs,
          chainId,
        });
        return { result };
      } else {
        const txHash = await writeContract(wagmiConfig, {
          abi: worldAbi,
          address: worldAddress as Address,
          functionName: functionAbi.name,
          args: inputs,
          ...(value && { value: BigInt(value) }),
          chainId,
        });
        const receipt = await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
        const events = receipt?.logs.map((log) => decodeEventLog({ ...log, abi: worldAbi }));
        return { txHash, result: events };
      }
    },
    onMutate: () => {
      if (operationType === FunctionType.WRITE) {
        const toastId = toast.loading("Transaction in progress...");
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
