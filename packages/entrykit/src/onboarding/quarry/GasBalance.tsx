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
import { useAllowance } from "./useAllowance";
import { useRequestAllowance } from "./useRequestAllowance";
import { Paymaster } from "../../getPaymaster";

export type Props = StepContentProps & {
  userAddress: Hex;
  paymaster: Paymaster;
};

export function GasBalance({ isActive, isExpanded, isFocused, setFocused, userAddress, paymaster }: Props) {
  const queryClient = useQueryClient();
  const balance = useShowQueryError(useBalance(userAddress));
  const prevBalance = usePrevious(balance.data || 0n);

  const allowance = useShowQueryError(useAllowance(userAddress));
  const prevAllowance = usePrevious(allowance.data || 0n);
  const requestAllowance = useRequestAllowance();

  useEffect(() => {
    if (balance.data != null && prevBalance === 0n && balance.data > 0n) {
      queryClient.invalidateQueries({ queryKey: ["getPrerequisites"] });
      setFocused(false);
    }
  }, [balance.data, prevBalance, setFocused, queryClient, userAddress]);

  useEffect(() => {
    if (allowance.data != null && prevAllowance === 0n && allowance.data > 0n) {
      queryClient.invalidateQueries({ queryKey: ["getPrerequisites"] });
      setFocused(false);
    }
  }, [allowance.data, prevAllowance, setFocused, queryClient, userAddress]);

  const gasBalance = balance.data != null && allowance.data != null ? balance.data + allowance.data : null;
  useEffect(() => {
    if (!isActive) return;
    if (!paymaster.canSponsor) return;
    if (gasBalance !== 0n) return;
    if (requestAllowance.status !== "idle") return;

    // There seems to be a tanstack-query bug(?) where multiple simultaneous renders loses
    // state between the two mutations. They're not treated as shared state but rather
    // individual mutations, even though the keys match. And the one we want the status of
    // seems to stay pending. This is sorta resolved by triggering this after a timeout.
    const timer = setTimeout(() => {
      console.log("no funds, requesting allowance");
      requestAllowance.mutate(userAddress, {
        onSuccess(data) {
          console.log("got allowance", data);
        },
        onError(error) {
          console.log("failed to get allowance", error);
        },
      });
    });
    return () => clearTimeout(timer);
  }, [isActive, paymaster.canSponsor, gasBalance, requestAllowance, userAddress]);

  if (isFocused) {
    return (
      <div>
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
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-4">
        <div>
          <div>Gas balance</div>
          <div className="font-mono text-white">
            {gasBalance != null ? <Balance wei={gasBalance} /> : <PendingIcon className="text-sm" />}
          </div>
        </div>

        <div className="flex flex-col gap-1 justify-center items-center">
          <Button
            variant={isActive ? "primary" : "tertiary"}
            className="flex-shrink-0 text-sm p-1 w-28"
            autoFocus={isActive || isExpanded}
            pending={
              balance.status === "pending" || allowance.status === "pending" || requestAllowance.status === "pending"
            }
            onClick={() => setFocused(true)}
          >
            Top up
          </Button>

          <WithdrawGasBalanceButton userAddress={userAddress} />
        </div>
      </div>
      {isExpanded ? (
        <div className="text-sm space-y-2">
          <p>Your gas balance is used to pay for onchain computation.</p>
          <p>
            You have{" "}
            <span className="font-mono">
              {balance.data != null ? <Balance wei={balance.data} /> : <PendingIcon className="text-sm" />}
            </span>{" "}
            in gas deposits and{" "}
            <span className="font-mono">
              {allowance.data != null ? <Balance wei={allowance.data} /> : <PendingIcon className="text-sm" />}
            </span>{" "}
            in gas grants.
          </p>
        </div>
      ) : null}
    </div>
  );
}
