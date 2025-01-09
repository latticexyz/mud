import { useAccount } from "wagmi";
import { Button } from "./ui/Button";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { AppInfo } from "./AppInfo";
import { twMerge } from "tailwind-merge";

export function ConnectWallet() {
  const userAccount = useAccount();
  const { openConnectModal, connectModalOpen } = useConnectModal();

  // TODO: show error states?
  // TODO: fix passkey issue where pending state disappears but we don't transition right away

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
      variant={hasPasskey ? "tertiary" : "secondary"}
      className="self-auto flex justify-center"
      pending={createPasskey.status === "pending" || createPasskey.status === "success"}
      onClick={() => createPasskey.mutate()}
      autoFocus={!hasPasskey}
    >
      Create account
    </Button>,
    <Button
      key="signin"
      variant={hasPasskey ? "secondary" : "tertiary"}
      className="self-auto flex justify-center"
      pending={reusePasskey.status === "pending" || reusePasskey.status === "success"}
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
      className={twMerge("flex flex-col gap-6 p-6", "animate-in animate-duration-300 fade-in slide-in-from-bottom-8")}
    >
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
  );
}
