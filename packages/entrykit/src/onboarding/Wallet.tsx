import { useDisconnect } from "wagmi";
import { useENS } from "../useENS";
import { TruncatedHex } from "../ui/TruncatedHex";
import { Button } from "../ui/Button";
import { useAccountModal } from "../useAccountModal";
import { Hex } from "viem";
import { useShowMutationError } from "../errors/useShowMutationError";
import { StepContentProps } from "./common";

export type Props = StepContentProps & {
  userAddress: Hex;
};

export function Wallet({ isActive, isExpanded, userAddress }: Props) {
  const { data: ens } = useENS(userAddress);
  const { disconnect, isPending: disconnectIsPending } = useShowMutationError(useDisconnect());
  const { closeAccountModal } = useAccountModal();

  // TODO: render ENS avatar if available?
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-4">
        <div>
          <div>Account</div>
          <div className="font-mono text-white">{ens?.name ?? <TruncatedHex hex={userAddress} />}</div>
        </div>
        <Button
          variant={isActive ? "primary" : "tertiary"}
          className="flex-shrink-0 text-sm p-1 w-28"
          autoFocus={isActive}
          pending={disconnectIsPending}
          onClick={() => {
            closeAccountModal();
            disconnect();
          }}
        >
          Sign out
        </Button>
      </div>
      {isExpanded ? (
        <p className="text-sm">Each of your onchain actions in this app is associated with your account.</p>
      ) : null}
    </div>
  );
}
