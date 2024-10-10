import { AccountModalSection } from "../AccountModalSection";
import { ErrorNotice } from "../ErrorNotice";
import { Hex } from "viem";
import { useAllowance } from "../onboarding/useAllowance";
import { PendingIcon } from "../icons/PendingIcon";
import { useClaimGasPass } from "./useClaimGasPass";
import { Button } from "../ui/Button";
import { Balance } from "../ui/Balance";
import { useEffect } from "react";

export type Props = {
  userAddress: Hex;
};

export function ClaimGasPass({ userAddress }: Props) {
  const allowance = useAllowance(userAddress);
  const claimGasPass = useClaimGasPass();

  // TODO: improve pending state since this is kicked off automatically and showing a pending button is weird
  useEffect(() => {
    if (claimGasPass.status === "idle" && allowance.data?.allowance === 0n) {
      claimGasPass.mutate(userAddress);
    }
  }, [allowance.data?.allowance, claimGasPass, userAddress]);

  if (allowance.status === "pending") {
    // TODO: better loading state/message
    return (
      <AccountModalSection className="items-center justify-center">
        <PendingIcon />
      </AccountModalSection>
    );
  }

  if (allowance.status === "error") {
    // TODO: better error state/message
    return (
      <AccountModalSection>
        <ErrorNotice error={allowance.error} />
      </AccountModalSection>
    );
  }

  return (
    <>
      <AccountModalSection>
        <div className="text-lg font-medium">Top up</div>
        <div className="space-y-4">
          {allowance.data.allowance > 0n ? (
            <p>
              You currently have <Balance wei={allowance.data.allowance} /> allowance to spend on gas.
            </p>
          ) : (
            <>
              <p>You haven&apos;t claimed a gas pass yet.</p>
              <div className="flex flex-col">
                <Button
                  className="self-start"
                  pending={claimGasPass.status === "pending"}
                  onClick={() => claimGasPass.mutate(userAddress)}
                >
                  Claim gas pass
                </Button>
                {/* TODO: better error styles */}
                {claimGasPass.status === "error" ? (
                  <div className="bg-red-100 text-red-700 text-sm p-2 animate-in animate-duration-200 fade-in">
                    {claimGasPass.error.message}
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </AccountModalSection>
    </>
  );
}
