import { Hex } from "viem";
import { PendingIcon } from "../../icons/PendingIcon";
import { Button } from "../../ui/Button";
import { Balance } from "../../ui/Balance";
import { useShowQueryError } from "../../errors/useShowQueryError";
import { useBalance } from "./useBalance";

export type Props = {
  isExpanded: boolean;
  isActive: boolean;
  userAddress: Hex;
  onTopUp: () => void;
};

export function Allowance({ isActive, isExpanded, userAddress, onTopUp }: Props) {
  // const allowance = useShowQueryError(useAllowance(userAddress));
  // const claimGasPass = useShowMutationError(useClaimGasPass());
  const balance = useShowQueryError(useBalance(userAddress));

  // TODO: add back ??
  // useEffect(() => {
  //   // There seems to be a tanstack-query bug(?) where multiple simultaneous renders loses
  //   // state between the two mutations. They're not treated as shared state but rather
  //   // individual mutations, even though the keys match. And the one we want the status of
  //   // seems to stay pending. This is sorta resolved by triggering this after a timeout.
  //   const timer = setTimeout(() => {
  //     if (
  //       isActive &&
  //       claimGasPass.status === "idle" &&
  //       allowance.isSuccess &&
  //       allowance.data != null &&
  //       allowance.data < minGasBalance
  //     ) {
  //       // claimGasPass.mutate(userAddress);
  //     }
  //   });
  //   return () => clearTimeout(timer);
  // }, [allowance.data, allowance.isSuccess, claimGasPass, isActive, userAddress]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-4">
        <div>
          <div>Allowance</div>
          <div className="font-mono text-white">
            {balance.data != null ? <Balance wei={balance.data} /> : <PendingIcon className="text-sm" />}
          </div>
        </div>
        <Button
          variant={isActive ? "primary" : "tertiary"}
          className="flex-shrink-0 text-sm p-1 w-28"
          autoFocus={isActive || isExpanded}
          pending={balance.status === "pending"}
          // onClick={() => claimGasPass.mutate(userAddress)} // TODO: add back
          onClick={onTopUp}
        >
          Top up
        </Button>
      </div>
      {isExpanded ? <p className="text-sm">Your allowance is used to pay for onchain computation.</p> : null}
    </div>
  );
}
