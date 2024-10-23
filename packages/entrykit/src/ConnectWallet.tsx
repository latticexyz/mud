import { useAccount } from "wagmi";
import { Button } from "./ui/Button";
import { useAccountModal } from "./useAccountModal";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useMutation } from "@tanstack/react-query";
import { usePasskeyConnector } from "./usePasskeyConnector";
import { AppInfo } from "./AppInfo";
import { twMerge } from "tailwind-merge";

export function ConnectWallet() {
  const userAccount = useAccount();
  const { accountModalOpen } = useAccountModal();
  const { openConnectModal, connectModalOpen } = useConnectModal();

  // TODO: show error states

  const passkeyConnector = usePasskeyConnector();
  const createPasskey = useMutation({
    onError: (error) => console.error(error),
    mutationKey: ["createPasskey", passkeyConnector.id, accountModalOpen, connectModalOpen, userAccount.status],
    mutationFn: () => passkeyConnector.createPasskey(),
  });
  const reusePasskey = useMutation({
    onError: (error) => console.error(error),
    mutationKey: ["reusePasskey", passkeyConnector.id, accountModalOpen, connectModalOpen, userAccount.status],
    mutationFn: () => passkeyConnector.reusePasskey(),
  });

  const hasPasskey = passkeyConnector.hasPasskey();

  const buttons = [
    <Button
      key="create"
      variant={hasPasskey ? "secondary" : "primary"}
      className="self-auto flex justify-center"
      pending={createPasskey.status === "pending"}
      onClick={() => createPasskey.mutate()}
      autoFocus={!hasPasskey}
    >
      Create account
    </Button>,
    <Button
      key="signin"
      variant={hasPasskey ? "primary" : "secondary"}
      className="self-auto flex justify-center"
      pending={reusePasskey.status === "pending"}
      onClick={() => reusePasskey.mutate()}
      autoFocus={hasPasskey}
    >
      Sign in
    </Button>,
  ];

  if (hasPasskey) {
    buttons.reverse();
  }

  return (
    <div
      className={twMerge(
        "flex-grow grid place-items-center p-6",
        "animate-in animate-duration-300 fade-in slide-in-from-bottom-8",
      )}
    >
      <div className="flex flex-col gap-6">
        <div className="p-4">
          {/* TODO: render appImage if available? */}
          <AppInfo />
        </div>
        <div className="self-center flex flex-col gap-2 w-60">
          {buttons}
          <button
            className="text-sm self-center transition text-neutral-500 hover:text-white p-2"
            disabled={userAccount.status === "connecting"}
            // TODO: figure out how to prevent this from switching chains after connecting
            onClick={openConnectModal}
          >
            Already have a wallet?
          </button>
        </div>
      </div>
    </div>
  );
}
