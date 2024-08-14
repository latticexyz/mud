import { toast } from "sonner";
import { Abi, AbiFunction } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { useChainId } from "wagmi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { ACCOUNT_PRIVATE_KEYS } from "../../consts";
import { useWorldAddress } from "../../hooks/useWorldAddress";
import { useStore } from "../../store";
import { wagmiConfig } from "../Providers";
import { FunctionType } from "./FunctionField";

type UseContractMutationProps = {
  abi: AbiFunction;
  operationType: FunctionType;
};

type ContractMutationResult =
  | {
      txHash: string;
      receipt: unknown;
    }
  | {
      result: unknown;
    };

export function useContractMutation({
  abi,
  operationType,
}: UseContractMutationProps) {
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const { account } = useStore();
  const worldAddress = useWorldAddress();

  return useMutation({
    mutationFn: async ({
      inputs,
      value,
    }: {
      inputs: unknown[];
      value?: string;
    }): Promise<ContractMutationResult> => {
      if (operationType === FunctionType.READ) {
        const result = await readContract(wagmiConfig, {
          abi: [abi] as Abi,
          address: worldAddress,
          functionName: abi.name,
          args: inputs,
        });

        return { result };
      } else {
        const txHash = await writeContract(wagmiConfig, {
          account: privateKeyToAccount(ACCOUNT_PRIVATE_KEYS[account]),
          abi: [abi] as Abi,
          address: worldAddress,
          functionName: abi.name,
          args: inputs,
          ...(value && { value: BigInt(value) }),
        });

        const receipt = await waitForTransactionReceipt(wagmiConfig, {
          hash: txHash,
          pollingInterval: 100,
        });

        return { txHash, receipt };
      }
    },
    onMutate: () => {
      const toastId = toast.loading("Transaction submitted");
      return { toastId };
    },
    onSuccess: (data, _, { toastId }) => {
      if (operationType === FunctionType.READ) {
        toast.success("Read successful", { id: toastId });
      } else if (operationType === FunctionType.WRITE && "txHash" in data) {
        toast.success(`Transaction successful with hash: ${data.txHash}`, {
          id: toastId,
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
