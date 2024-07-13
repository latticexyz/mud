import { useAccount, useDisconnect } from "wagmi";
import { AccountModalSection } from "../../AccountModalSection";
import { AccountModalTitle } from "../../AccoutModalTitle";
import { useENS } from "../../useENS";
import { TruncatedHex } from "../../ui/TruncatedHex";
import { PendingIcon } from "../../icons/PendingIcon";
import { Button } from "../../ui/Button";
import { useOnboardingSteps } from "../../useOnboardingSteps";
import { useAccountModal } from "../../useAccountModal";
import { ErrorNotice } from "../../ErrorNotice";

export function WalletStep() {
  const userAccount = useAccount();
  const userAddress = userAccount.address;
  const { data: ens } = useENS(userAddress);
  const { disconnect, isPending: disconnectIsPending, error: disconnectError } = useDisconnect();
  const { resetStep } = useOnboardingSteps();
  const { closeAccountModal } = useAccountModal();

  // We should never reach this state. The outer component will always show RainbowKit's connect modal when not connected.
  // This is just here to make it easier to work with a not-undefined `userAddress` and so we have a reasonable fallback
  // in case we get into a weird state.
  if (!userAddress) {
    return (
      <>
        <AccountModalTitle title="Connecting…" />
        <AccountModalSection className="flex-grow">
          <div className="flex-grow grid place-items-center">
            <PendingIcon />
          </div>
        </AccountModalSection>
      </>
    );
  }

  // TODO: render ENS avatar if available?

  return (
    <>
      <AccountModalTitle title="Your wallet" />
      <AccountModalSection>
        <div className="flex flex-col gap-5 p-5">
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

          {disconnectError ? <ErrorNotice error={disconnectError} /> : null}

          <Button
            variant="secondary"
            className="self-start"
            pending={disconnectIsPending}
            onClick={() => {
              closeAccountModal();
              resetStep();
              disconnect();
            }}
          >
            Disconnect
          </Button>
        </div>
      </AccountModalSection>
    </>
  );
}
