import { useAccount } from "wagmi";
import { Button } from "./ui/Button";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { AppInfo } from "./AppInfo";
import { twMerge } from "tailwind-merge";

export function ConnectWallet() {
  const userAccount = useAccount();
  const { openConnectModal } = useConnectModal();

  // TODO: show error states?
  // TODO: automatically open connect modal instead of showing a button
  //       (doing it like this for now for ease of modal states, ESC key, etc)

  return (
    <div
      className={twMerge("flex flex-col gap-6 p-6", "animate-in animate-duration-300 fade-in slide-in-from-bottom-8")}
    >
      <div className="p-4">
        {/* TODO: render appImage if available? */}
        <AppInfo />
      </div>
      <div className="self-center flex flex-col gap-2 w-60">
        <Button
          key="create"
          variant="secondary"
          className="self-auto flex justify-center"
          disabled={userAccount.status === "connecting"}
          onClick={openConnectModal}
          autoFocus
        >
          Connect wallet
        </Button>
      </div>
    </div>
  );
}
