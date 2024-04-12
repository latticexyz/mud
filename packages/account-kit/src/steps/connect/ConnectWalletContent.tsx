import * as Dialog from "@radix-ui/react-dialog";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import { useConfig } from "../../MUDAccountKitProvider";
import { Button } from "../../ui/Button";
import { AccountModalContent } from "../../AccountModalContent";

export function ConnectWalletContent() {
  const { chainId } = useConfig();
  const account = useAccount();
  const { switchChain, isPending: switchChainPending, error } = useSwitchChain();
  const { disconnect, isPending: disconnectPending } = useDisconnect();

  // TODO: prompt to connect wallet if not yet connected
  // TODO: prompt user to add chain if missing
  // TODO: show connected wallet info if all connected

  if (account.chainId !== chainId) {
    return (
      <AccountModalContent title="Switch chain">
        {error ? <>Error: {String(error)}</> : null}

        <div className="flex gap-3 justify-end">
          <Dialog.Close asChild>
            <Button variant="tertiary">Cancel</Button>
          </Dialog.Close>
          <Button variant="secondary" pending={switchChainPending} onClick={() => switchChain({ chainId })}>
            Switch chain
          </Button>
        </div>
      </AccountModalContent>
    );
  }

  return (
    <AccountModalContent title="Connected wallet">
      {account.address}
      <div className="flex gap-3 justify-end">
        <Dialog.Close asChild>
          <Button variant="tertiary">Cancel</Button>
        </Dialog.Close>
        <Dialog.Close asChild>
          <Button variant="secondary" pending={disconnectPending} onClick={() => disconnect()}>
            Disconnect
          </Button>
        </Dialog.Close>
      </div>
    </AccountModalContent>
  );
}
