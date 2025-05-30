import { useEffect } from "react";
import { Hex } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { PendingIcon } from "../../icons/PendingIcon";
import { Button } from "../../ui/Button";
import { Balance } from "../../ui/Balance";
import { useShowQueryError } from "../../errors/useShowQueryError";
import { useBalance } from "./useBalance";
import { DepositFormContainer } from "../deposit/DepositFormContainer";
import { ArrowLeftIcon } from "../../icons/ArrowLeftIcon";
import { StepContentProps } from "../common";
import { usePrevious } from "../../errors/usePrevious";
import { WithdrawGasBalanceButton } from "./WithdrawGasBalanceButton";

export type Props = StepContentProps & {
  userAddress: Hex;
};

export function GasBalance({ isActive, isExpanded, isFocused, setFocused, userAddress }: Props) {
  const queryClient = useQueryClient();
  const balance = useShowQueryError(useBalance(userAddress));
  const prevBalance = usePrevious(balance.data || 0n);

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

          <WithdrawGasBalanceButton userAddress={userAddress} />
        </div>
      </div>
      {isExpanded ? <p className="text-sm">Your gas balance is used to pay for onchain computation.</p> : null}
    </div>
  );
}
