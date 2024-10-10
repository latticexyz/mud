import { useDisconnect } from "wagmi";
import { AccountModalSection } from "../AccountModalSection";
import { useENS } from "../useENS";
import { TruncatedHex } from "../ui/TruncatedHex";
import { Button } from "../ui/Button";
import { useAccountModal } from "../useAccountModal";
import { ErrorNotice } from "../ErrorNotice";
import { Hex } from "viem";

export type Props = {
  userAddress: Hex;
};

export function ConnectedWallet({ userAddress }: Props) {
  const { data: ens } = useENS(userAddress);
  const { disconnect, isPending: disconnectIsPending, error: disconnectError } = useDisconnect();
  const { closeAccountModal } = useAccountModal();

  // TODO: render ENS avatar if available?
  return (
    <>
      <AccountModalSection>
        <div className="text-lg font-medium">Your wallet</div>
        <div className="space-y-4">
          <p>
            Hello,{" "}
            {ens.name ? (
              <span className="font-medium">{ens.name}</span>
            ) : (
              <span className="text-sm font-mono font-medium">
                <TruncatedHex hex={userAddress} />
              </span>
            )}
            !
          </p>
          <p>
            Once signed in, your wallet address (
            <span className="text-sm font-mono font-medium">
              <TruncatedHex hex={userAddress} />
            </span>
            ) will be associated with all onchain actions for this app.
          </p>
        </div>
      </AccountModalSection>
      <AccountModalSection className="justify-end">
        {disconnectError ? <ErrorNotice error={disconnectError} /> : null}
        <Button
          variant="secondary"
          className="self-stretch sm:self-start"
          pending={disconnectIsPending}
          onClick={() => {
            closeAccountModal();
            disconnect();
          }}
        >
          Disconnect
        </Button>
      </AccountModalSection>
    </>
  );
}
