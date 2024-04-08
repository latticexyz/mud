import * as Dialog from "@radix-ui/react-dialog";
import { useSwitchChain } from "wagmi";
import { useLoginConfig } from "./Context";
import { Button } from "./ui/Button";
import { ModalContent } from "./ui/ModalContent";

export function ConnectedChainDialogContent() {
  const { chainId } = useLoginConfig();
  const { switchChain, isPending, error } = useSwitchChain();

  // TODO: prompt user to add chain if missing

  return (
    <ModalContent title="Switch chain" description="Switch chain to login">
      {error ? <>Error: {String(error)}</> : null}

      <div className="flex gap-3 justify-end">
        <Dialog.Close>
          <Button variant="tertiary">Cancel</Button>
        </Dialog.Close>
        <Button variant="secondary" pending={isPending} onClick={() => switchChain({ chainId })}>
          Switch chain
        </Button>
      </div>
    </ModalContent>
  );
}
