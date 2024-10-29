import { Hex } from "viem";
import { useAllowance } from "./useAllowance";
import { PendingIcon } from "../icons/PendingIcon";
import { useClaimGasPass } from "./useClaimGasPass";
import { Button } from "../ui/Button";
import { Balance } from "../ui/Balance";
import { useEffect, useRef } from "react";
import { minGasBalance } from "./common";

export type Props = {
  isExpanded: boolean;
  isActive: boolean;
  userAddress: Hex;
};

export function Allowance({ isActive, isExpanded, userAddress }: Props) {
  const allowance = useAllowance(userAddress);
  const claimGasPass = useClaimGasPass();

  // I assumed `queryClient.isMutating` would be useful to avoid multiple mutations at once,
  // but it seems like it's doing something else internally where kicking off a mutation
  // twice immediately (i.e. two renders) results in both returning 2 pending mutations.
  //
  // I also tried moving this into `useSetupSession` with `onMutate`, etc, but that seems
  // to just mimick what I am seeing with the behavior of `useMutation`.
  //
  // Working around this with a ref :(
  const isMutatingRef = useRef(false);
  useEffect(() => {
    if (
      isActive &&
      claimGasPass.status === "idle" &&
      allowance.isSuccess &&
      allowance.data < minGasBalance &&
      !isMutatingRef.current
    ) {
      isMutatingRef.current = true;
      claimGasPass.mutate(userAddress, { onSettled: () => (isMutatingRef.current = false) });
    }
  }, [allowance.data, allowance.isSuccess, claimGasPass, isActive, userAddress]);

  // TODO: show error if allowance fails to load
  // TODO: show claim error

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
