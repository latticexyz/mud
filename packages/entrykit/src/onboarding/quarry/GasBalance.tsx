import { Hex } from "viem";
import { PendingIcon } from "../../icons/PendingIcon";
import { Button } from "../../ui/Button";
import { Balance } from "../../ui/Balance";
import { useShowQueryError } from "../../errors/useShowQueryError";
import { useBalance } from "./useBalance";
import { DepositFormContainer } from "../deposit/DepositFormContainer";
import { ArrowLeftIcon } from "../../icons/ArrowLeftIcon";
import { StepContentProps } from "../common";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePrevious } from "../../errors/usePrevious";
import { useEntryKitConfig } from "../../EntryKitConfigProvider";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";
import { getPaymaster } from "../../getPaymaster";
import { paymasterAbi } from "../../quarry/common";

export type Props = StepContentProps & {
  userAddress: Hex;
};

export function GasBalance({ isActive, isExpanded, isFocused, setFocused, userAddress }: Props) {
  const { chain, chainId } = useEntryKitConfig();
  const paymaster = getPaymaster(chain);
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();
  const balance = useShowQueryError(useBalance(userAddress));
  const prevBalance = usePrevious(balance.data || 0n);

  const { chainId: userChainId } = useAccount();
  const shouldSwitchChain = chainId != null && chainId !== userChainId;
  const { switchChain } = useSwitchChain();

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

  useEffect(() => {
    if (balance.data != null && prevBalance === 0n && balance.data > 0n) {
      queryClient.invalidateQueries({ queryKey: ["getPrerequisites"] });
      setFocused(false);
    }
  }, [balance.data, prevBalance, setFocused, queryClient, userAddress]);

  if (isFocused) {
    return (
      <>
        {isFocused && (
          <div className="absolute top-0 left-0">
            <div
              className="flex items-center justify-center w-10 h-10 text-white/20 hover:text-white/40 cursor-pointer"
              onClick={() => setFocused(false)}
            >
              <ArrowLeftIcon className="m-0" />
            </div>
          </div>
        )}
        <DepositFormContainer />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-4">
        <div>
          <div>Gas balance</div>
          <div className="font-mono text-white">
            {balance.data != null ? <Balance wei={balance.data} /> : <PendingIcon className="text-sm" />}
          </div>
        </div>

        <div className="flex flex-col gap-1 justify-center items-center">
          <Button
            variant={isActive ? "primary" : "tertiary"}
            className="flex-shrink-0 text-sm p-1 w-28"
            autoFocus={isActive || isExpanded}
            pending={balance.status === "pending"}
            onClick={() => setFocused(true)}
          >
            Top up
          </Button>

          {balance.data != null && balance.data > 0n && (
            <a role="button" onClick={handleWithdraw} className="text-sm opacity-40 hover:opacity-100">
              Withdraw
            </a>
          )}
        </div>
      </div>
      {isExpanded ? <p className="text-sm">Your gas balance is used to pay for onchain computation.</p> : null}
    </div>
  );
}
