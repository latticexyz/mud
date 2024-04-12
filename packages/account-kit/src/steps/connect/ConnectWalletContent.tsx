import * as Dialog from "@radix-ui/react-dialog";
import { useAccount, useDisconnect } from "wagmi";
import { Button } from "../../ui/Button";
import { AccountModalContent } from "../../AccountModalContent";

export function ConnectWalletContent() {
  const account = useAccount();
  const { disconnect, isPending: disconnectPending } = useDisconnect();

  // TODO: prompt to connect wallet if not yet connected
  // TODO: show connected wallet info if all connected

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
