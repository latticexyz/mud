import { Hex } from "viem";
import { PendingIcon } from "../../icons/PendingIcon";
import { Button } from "../../ui/Button";
import { Balance } from "../../ui/Balance";
import { useShowQueryError } from "../../errors/useShowQueryError";
import { useBalance } from "./useBalance";
import { DepositFormContainer } from "../deposit/DepositFormContainer";
import { ArrowLeftIcon } from "../../icons/ArrowLeftIcon";
import { Step } from "../common";

export type Props = Step & {
  isExpanded: boolean;
  isActive: boolean;
  focused: boolean;
  userAddress: Hex;
  setFocused: (focused: boolean) => void;
};

export function GasBalance({ isActive, isExpanded, userAddress, focused, setFocused }: Props) {
  const balance = useShowQueryError(useBalance(userAddress));

  if (focused) {
    return (
      <>
        {focused && (
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
        <Button
          variant={isActive ? "primary" : "tertiary"}
          className="flex-shrink-0 text-sm p-1 w-28"
          autoFocus={isActive || isExpanded}
          pending={balance.status === "pending"}
          onClick={() => setFocused(true)}
        >
          Top up
        </Button>
      </div>
      {isExpanded ? <p className="text-sm">Your gas balance is used to pay for onchain computation.</p> : null}
    </div>
  );
}
