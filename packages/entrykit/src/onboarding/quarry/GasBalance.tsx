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

export function GasBalance({ isActive, isExpanded, userAddress, onTopUp }: Props) {
  const balance = useShowQueryError(useBalance(userAddress));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-4">
        <div>
          <div>Gas balance</div>
          <div className="font-mono text-white">
            {balance.data != null ? <Balance wei={balance.data} /> : <PendingIcon className="text-sm" />}
          </div>
        </div>
        <Button
          variant={isActive ? "primary" : "tertiary"}
          className="flex-shrink-0 text-sm p-1 w-28"
          autoFocus={isActive || isExpanded}
          pending={balance.status === "pending"}
          onClick={onTopUp}
        >
          Top up
        </Button>
      </div>
      {isExpanded ? <p className="text-sm">Your gas balance is used to pay for onchain computation.</p> : null}
    </div>
  );
}
