import { useAccount } from "wagmi";
import { Button } from "./ui/Button";
import { useAccountModal } from "./useAccountModal";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useMutation, useQuery } from "@tanstack/react-query";
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

  const { data: hasPasskey } = useQuery({
    queryKey: ["hasPasskey", passkeyConnector.id, accountModalOpen, connectModalOpen, userAccount.status],
    queryFn: () => passkeyConnector.hasPasskey(),
  });

  return (
    <>
      <div className="flex-grow grid place-items-center p-6">
        <div className="flex flex-col gap-6">
          <div className="p-4">
            {/* TODO: render appImage if available? */}
            <AppInfo />
          </div>
          <div className="self-center flex flex-col gap-2 w-60">
            <div className={twMerge("flex flex-col gap-2", hasPasskey ? "flex-col-reverse" : null)}>
              <Button
                variant={hasPasskey ? "secondary" : "primary"}
                className="self-auto flex justify-center"
                pending={createPasskey.status === "pending"}
                onClick={() => createPasskey.mutate()}
              >
                Create account
              </Button>
              <Button
                variant={hasPasskey ? "primary" : "secondary"}
                className="self-auto flex justify-center"
                pending={reusePasskey.status === "pending"}
                onClick={() => reusePasskey.mutate()}
              >
                Sign in
              </Button>
            </div>

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
    </>
  );
}
