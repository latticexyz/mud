import * as Dialog from "@radix-ui/react-dialog";
import { useSwitchChain } from "wagmi";
import { useConfig } from "../../MUDAccountKitProvider";
import { Button } from "../../ui/Button";
import { ModalContent } from "../../ui/ModalContent";

export function ConnectWalletContent() {
  const { chainId } = useConfig();
  const { switchChain, isPending, error } = useSwitchChain();

  // TODO: prompt to connect wallet if not yet connected
  // TODO: prompt user to add chain if missing
  // TODO: show connected wallet info if all connected

  return (
    <ModalContent title="Switch chain" description="Switch chain to sign in">
      {error ? <>Error: {String(error)}</> : null}

      <div className="flex gap-3 justify-end">
        <Dialog.Close asChild>
          <Button variant="tertiary">Cancel</Button>
        </Dialog.Close>
        <Button variant="secondary" pending={isPending} onClick={() => switchChain({ chainId })}>
          Switch chain
        </Button>
      </div>
    </ModalContent>
  );
}
