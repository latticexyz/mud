import { Modal } from "./ui/Modal";
import { useAccount, useDisconnect } from "wagmi";
import { useAccountModal } from "./useAccountModal";
import { twMerge } from "tailwind-merge";
import { Button } from "./ui/Button";
import { usePasskeyConnector } from "./usePasskeyConnector";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useMutation } from "@tanstack/react-query";

export function SignInModal() {
  const { address, status } = useAccount();
  const { accountModalOpen, toggleAccountModal } = useAccountModal();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();

  const passkeyConnector = usePasskeyConnector();
  const createPasskey = useMutation({
    mutationKey: ["createPasskey", passkeyConnector.id],
    mutationFn: async () => {
      return await passkeyConnector.createPasskey();
    },
  });

  return (
    <Modal open={accountModalOpen} onOpenChange={toggleAccountModal}>
      {accountModalOpen ? (
        <div
          className={twMerge(
            "flex flex-col min-h-[20rem] items-center justify-center border-t sm:border divide-x",
            "bg-neutral-100 text-neutral-700 border-neutral-300 divide-neutral-300",
            "dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:divide-neutral-700",
            "links:font-medium links:underline links:underline-offset-4",
            "links:text-black dark:links:text-white",
            "links:decoration-neutral-300 dark:links:decoration-neutral-500 hover:links:decoration-orange-500",
          )}
        >
          {status === "connected" ? (
            <div className="flex-grow flex flex-col items-center justify-center gap-2">
              {address}
              <Button onClick={() => disconnect()}>Sign out</Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="flex flex-col gap-2">
                <Button
                  className="self-auto flex justify-center"
                  pending={createPasskey.status === "pending"}
                  onClick={() => createPasskey.mutate()}
                >
                  Create account
                </Button>
                <Button
                  className="self-auto flex justify-center text-sm py-1"
                  variant="secondary"
                  pending={status === "connecting"}
                  onClick={openConnectModal}
                >
                  Connect with passkey or wallet
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
