import { Address } from "viem";
import { useAccount, usePublicClient, useSwitchChain, useWriteContract } from "wagmi";
import { twMerge } from "tailwind-merge";
import { getPaymaster } from "../../getPaymaster";
import { paymasterAbi } from "../../quarry/common";
import { useEntryKitConfig } from "../../EntryKitConfigProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useShowQueryError } from "../../errors/useShowQueryError";
import { useBalance } from "./useBalance";
import { PendingIcon } from "../../icons/PendingIcon";
import { useMutation } from "@tanstack/react-query";

export type Props = {
  userAddress: Address;
};

export function WithdrawGasBalanceButton({ userAddress }: Props) {
  const queryClient = useQueryClient();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const { chain, chainId } = useEntryKitConfig();
  const { chainId: userChainId } = useAccount();
  const shouldSwitchChain = chainId != null && chainId !== userChainId;
  const paymaster = getPaymaster(chain);
  const balance = useShowQueryError(useBalance(userAddress));

  const withdraw = useMutation({
    mutationKey: ["withdraw", userAddress],
    mutationFn: async () => {
      if (!paymaster) throw new Error("No paymaster configured to withdraw from.");
      if (!publicClient) throw new Error("Public client not found");
      if (!balance.data) throw new Error("No paymaster balance to withdraw.");

      try {
        const hash = await writeContractAsync({
          address: paymaster.address,
          abi: paymasterAbi,
          functionName: "withdrawTo",
          args: [userAddress, balance.data],
        });
        await publicClient.waitForTransactionReceipt({ hash });

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["balance"] }),
          queryClient.invalidateQueries({ queryKey: ["getPrerequisites"] }),
        ]);
      } catch (error) {
        console.error("Error while withdrawing", error);
        throw error;
      }
    },
  });

  if (balance.data == null || balance.data === 0n) {
    return null;
  }

  const handleClick = () => {
    if (shouldSwitchChain) {
      return switchChain({ chainId });
    }
    withdraw.mutate();
  };

  return (
    <button
      onClick={handleClick}
      className={twMerge(
        "text-sm font-medium text-white/50 group whitespace-nowrap",
        withdraw.isPending ? "opacity-50 pointer-events-none" : "cursor-pointer hover:text-white",
      )}
      disabled={withdraw.isPending}
    >
      <span className="inline-block">
        <span
          className={twMerge(
            "inline-flex items-center gap-1 underline decoration-neutral-500 underline-offset-4",
            !withdraw.isPending && "hover:decoration-orange-500",
            shouldSwitchChain && "group-hover:hidden",
          )}
        >
          {withdraw.isPending && <PendingIcon className="w-3 h-3" />}
          Withdraw
        </span>

        {shouldSwitchChain && (
          <span className="hidden group-hover:inline-block underline decoration-neutral-500 underline-offset-4 hover:decoration-orange-500">
            Switch chain
          </span>
        )}
      </span>
    </button>
  );
}
