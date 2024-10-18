import { Hex } from "viem";
import { useAllowance } from "./useAllowance";
import { PendingIcon } from "../icons/PendingIcon";
import { useClaimGasPass } from "./useClaimGasPass";
import { Button } from "../ui/Button";
import { Balance } from "../ui/Balance";
import { useEffect } from "react";
import { minGasBalance } from "./common";

export type Props = {
  isExpanded: boolean;
  isActive: boolean;
  userAddress: Hex;
};

export function Allowance({ isActive, isExpanded, userAddress }: Props) {
  const allowance = useAllowance(userAddress);
  const claimGasPass = useClaimGasPass();

  // TODO: improve pending state since this is kicked off automatically and showing a pending button is weird
  useEffect(() => {
    if (isActive && claimGasPass.status === "idle" && allowance.data && allowance.data.allowance < minGasBalance) {
      // claimGasPass.mutate(userAddress);
    }
  }, [allowance.data, claimGasPass, isActive, userAddress]);

  // TODO: show error if allowance fails to load
  // TODO: show claim error

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-4">
        <div>
          <div>Allowance</div>
          <div className="font-mono text-white">
            {allowance.data ? <Balance wei={allowance.data.allowance} /> : <PendingIcon />}
          </div>
        </div>
        <Button
          variant={isActive ? "primary" : "secondary"}
          className="flex-shrink-0 text-sm p-1 w-28"
          pending={claimGasPass.status === "pending"}
          onClick={() => claimGasPass.mutate(userAddress)}
        >
          Top up
        </Button>
      </div>
      {isExpanded ? <p className="text-sm">Your allowance is used to pay for onchain computation.</p> : null}
    </div>
  );
}
