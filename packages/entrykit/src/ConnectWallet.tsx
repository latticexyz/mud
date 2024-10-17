import { useAccount } from "wagmi";
import { Button } from "./ui/Button";
import { useAccountModal } from "./useAccountModal";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useMutation } from "@tanstack/react-query";
import { usePasskeyConnector } from "./usePasskeyConnector";
import { AppInfo } from "./AppInfo";

export function ConnectWallet() {
  const userAccount = useAccount();
  const { accountModalOpen } = useAccountModal();
  const { openConnectModal, connectModalOpen } = useConnectModal();

  const passkeyConnector = usePasskeyConnector();
  const createPasskey = useMutation({
    mutationKey: ["createPasskey", passkeyConnector.id, accountModalOpen, connectModalOpen, userAccount.status],
    mutationFn: async () => {
      return await passkeyConnector.createPasskey();
    },
  });
  const reusePasskey = useMutation({
    mutationKey: ["reusePasskey", passkeyConnector.id, accountModalOpen, connectModalOpen, userAccount.status],
    mutationFn: async () => {
      return await passkeyConnector.reusePasskey();
    },
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
                <div className="bg-red-800 text-white text-sm p-2 animate-in animate-duration-200 fade-in">
                  {createPasskey.error.message}
                </div>
              ) : null}
            </div>
            <Button
              className="self-auto flex justify-center"
              variant="secondary"
              pending={reusePasskey.status === "pending"}
              onClick={() => reusePasskey.mutate()}
            >
              Sign in
            </Button>

            <button
              className="text-sm transition text-neutral-500 hover:text-white"
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
