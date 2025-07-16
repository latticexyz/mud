import { Hex, parseEther } from "viem";
import { useAllowance } from "./useAllowance";
import { PendingIcon } from "../../icons/PendingIcon";
import { useClaimGasPass } from "./useClaimGasPass";
import { Button } from "../../ui/Button";
import { Balance } from "../../ui/Balance";
import { useEffect } from "react";
import { useShowQueryError } from "../../errors/useShowQueryError";
import { useShowMutationError } from "../../errors/useShowMutationError";
import { StepContentProps } from "../common";

export type Props = StepContentProps & {
  userAddress: Hex;
};

export function Allowance({ isActive, isExpanded, userAddress }: Props) {
  const allowance = useShowQueryError(useAllowance(userAddress));
  const claimGasPass = useShowMutationError(useClaimGasPass());

  useEffect(() => {
    // There seems to be a tanstack-query bug(?) where multiple simultaneous renders loses
    // state between the two mutations. They're not treated as shared state but rather
    // individual mutations, even though the keys match. And the one we want the status of
    // seems to stay pending. This is sorta resolved by triggering this after a timeout.
    const timer = setTimeout(() => {
      if (
        isActive &&
        claimGasPass.status === "idle" &&
        allowance.isSuccess &&
        allowance.data != null &&
        allowance.data < parseEther("0.01")
      ) {
        claimGasPass.mutate(userAddress);
      }
    });
    return () => clearTimeout(timer);
  }, [allowance.data, allowance.isSuccess, claimGasPass, isActive, userAddress]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-4">
        <div>
          <div>Allowance</div>
          <div className="font-mono text-white">
            {allowance.data != null ? <Balance wei={allowance.data} /> : <PendingIcon className="text-sm" />}
          </div>
        </div>
        <Button
          variant={isActive ? "primary" : "tertiary"}
          className="flex-shrink-0 text-sm p-1 w-28"
          autoFocus={isActive || isExpanded}
          pending={allowance.status === "pending" || claimGasPass.status === "pending"}
          onClick={() => claimGasPass.mutate(userAddress)}
        >
          Top up
        </Button>
      </div>
      {isExpanded ? <p className="text-sm">Your allowance is used to pay for onchain computation.</p> : null}
    </div>
  );
}
