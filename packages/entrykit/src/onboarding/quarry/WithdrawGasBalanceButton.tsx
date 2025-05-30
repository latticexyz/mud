import { useAccount, useSwitchChain, useWriteContract } from "wagmi";
import { getPaymaster } from "../../getPaymaster";
import { paymasterAbi } from "../../quarry/common";
import { useEntryKitConfig } from "../../EntryKitConfigProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useShowQueryError } from "../../errors/useShowQueryError";
import { useBalance } from "./useBalance";
import { Address } from "viem";

export type Props = {
  userAddress: Address;
};

export function WithdrawGasBalanceButton({ userAddress }: Props) {
  const queryClient = useQueryClient();
  const { writeContractAsync } = useWriteContract();
  const { switchChain } = useSwitchChain();
  const { chain, chainId } = useEntryKitConfig();
  const { chainId: userChainId } = useAccount();
  const shouldSwitchChain = chainId != null && chainId !== userChainId;
  const paymaster = getPaymaster(chain);
  const balance = useShowQueryError(useBalance(userAddress));

  const handleWithdraw = async () => {
    if (!paymaster) throw new Error("No paymaster configured to withdraw from.");
    if (!balance.data) throw new Error("No paymaster balance to withdraw.");

    try {
      if (shouldSwitchChain) {
        await switchChain({ chainId });
      }

      await writeContractAsync({
        address: paymaster.address,
        abi: paymasterAbi,
        functionName: "withdrawTo",
        args: [userAddress, balance.data],
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["balance"] }),
        queryClient.invalidateQueries({ queryKey: ["getPrerequisites"] }),
      ]);
    } catch (error) {
      console.error("Error while withdrawing", error);
      throw error;
    }
  };

  if (balance.data == null || balance.data === 0n) {
    return null;
  }

  return (
    <button
      onClick={handleWithdraw}
      className="text-sm font-medium text-white/50 underline decoration-[#737373] underline-offset-4 hover:text-white hover:decoration-[#f97316]"
    >
      Withdraw
    </button>
  );
}
