import { useAccount, useDisconnect } from "wagmi";
import { AccountModalSection } from "../AccountModalSection";
import { AccountModalNav } from "../AccoutModalNav";
import { useENS } from "../useENS";
import { TruncatedHex } from "../ui/TruncatedHex";
import { Button } from "../ui/Button";
import { useOnboardingSteps } from "../useOnboardingSteps";
import { useAccountModal } from "../useAccountModal";
import { ErrorNotice } from "../ErrorNotice";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useMutation } from "@tanstack/react-query";
import { usePasskeyConnector } from "../usePasskeyConnector";
import { AppInfo } from "./app-account/AppInfo";
import { Logo } from "../icons/Logo";
import { DialogTitle } from "@radix-ui/react-dialog";

export function ConnectWalletStep() {
  const userAccount = useAccount();
  const userAddress = userAccount.address;
  const { data: ens } = useENS(userAddress);
  const { disconnect, isPending: disconnectIsPending, error: disconnectError } = useDisconnect();
  const { resetStep } = useOnboardingSteps();
  const { closeAccountModal, accountModalOpen } = useAccountModal();
  const { openConnectModal, connectModalOpen } = useConnectModal();

  const passkeyConnector = usePasskeyConnector();
  const createPasskey = useMutation({
    mutationKey: ["createPasskey", passkeyConnector.id, accountModalOpen, connectModalOpen, userAccount.status],
    mutationFn: async () => {
      return await passkeyConnector.createPasskey();
    },
  });

  if (!userAddress) {
    return (
      <div className="flex-grow grid place-items-center p-6">
        <div className="flex flex-col gap-6">
          <div className="p-4">
            {/* TODO: render appImage if available? */}
            <AppInfo />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col">
              <Button
                className="self-auto flex justify-center"
                pending={createPasskey.status === "pending"}
                onClick={() => createPasskey.mutate()}
              >
                Create account
              </Button>
              {/* TODO: better error styles */}
              {createPasskey.status === "error" ? (
                <div className="bg-red-100 text-red-700 text-sm p-2 animate-in animate-duration-200 fade-in">
                  {createPasskey.error.message}
                </div>
              ) : null}
            </div>
            <Button
              className="self-auto flex justify-center text-sm py-1"
              variant="secondary"
              pending={userAccount.status === "connecting"}
              // TODO: figure out how to prevent this from switching chains after connecting
              onClick={openConnectModal}
            >
              Connect with passkey or wallet
            </Button>
          </div>
          <a
            href="https://mud.dev"
            target="_blank"
            rel="noreferrer noopener"
            className="self-center p-2 flex items-center justify-center gap-1.5 text-sm"
          >
            <span className="block w-4 h-4">
              <Logo className="w-full h-full text-orange-500 dark:bg-neutral-800" />
            </span>
            <span>Powered by MUD</span>
          </a>
        </div>
      </div>
    );
  }

  // TODO: render ENS avatar if available?

  return (
    <>
      <AccountModalNav />
      <AccountModalSection>
        <DialogTitle className="text-lg font-medium">Your wallet</DialogTitle>
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
            resetStep();
            disconnect();
          }}
        >
          Disconnect
        </Button>
      </AccountModalSection>
    </>
  );
}
