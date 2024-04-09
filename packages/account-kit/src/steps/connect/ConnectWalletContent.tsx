import * as Dialog from "@radix-ui/react-dialog";
import { useAccount, useSwitchChain } from "wagmi";
import { useConfig } from "../../MUDAccountKitProvider";
import { Button } from "../../ui/Button";
import { AccountModalContent } from "../../AccountModalContent";

export function ConnectWalletContent() {
  const { chainId } = useConfig();
  const account = useAccount();
  const { switchChain, isPending, error } = useSwitchChain();

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
          <Button variant="secondary" pending={isPending} onClick={() => switchChain({ chainId })}>
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
      </div>
    </AccountModalContent>
  );
}
