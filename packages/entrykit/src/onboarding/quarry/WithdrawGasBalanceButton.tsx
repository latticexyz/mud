import { Address } from "viem";
import { getAction } from "viem/utils";
import { waitForTransactionReceipt } from "viem/actions";
import { useAccount, useClient, useSwitchChain, useWriteContract } from "wagmi";
import { twMerge } from "tailwind-merge";
import { useMutation } from "@tanstack/react-query";
import { getPaymaster } from "../../getPaymaster";
import { paymasterAbi } from "../../quarry/common";
import { useEntryKitConfig } from "../../EntryKitConfigProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useShowQueryError } from "../../errors/useShowQueryError";
import { useBalance } from "./useBalance";
import { PendingIcon } from "../../icons/PendingIcon";

export type Props = {
  userAddress: Address;
};

export function WithdrawGasBalanceButton({ userAddress }: Props) {
  const { writeContractAsync } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const { chain, chainId } = useEntryKitConfig();
  const { chainId: userChainId } = useAccount();
  const queryClient = useQueryClient();
  const client = useClient({ chainId });
  const shouldSwitchChain = chainId != null && chainId !== userChainId;
  const paymaster = getPaymaster(chain);
  const balance = useShowQueryError(useBalance(userAddress));

  const withdraw = useMutation({
    mutationKey: ["withdraw", userAddress],
    mutationFn: async () => {
      if (!client) throw new Error("Client not ready.");
      if (!paymaster) throw new Error("Paymaster not found");
      if (!balance.data) throw new Error("No gas balance to withdraw.");

      try {
        const hash = await writeContractAsync({
          address: paymaster.address,
          abi: paymasterAbi,
          functionName: "withdrawTo",
          args: [userAddress, balance.data],
          chainId,
        });
        await getAction(client, waitForTransactionReceipt, "waitForTransactionReceipt")({ hash });

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

  return (
    <button
      onClick={() => {
        if (shouldSwitchChain) {
          return switchChain({ chainId });
        }
        withdraw.mutate();
      }}
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
