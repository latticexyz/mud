import * as Dialog from "@radix-ui/react-dialog";
import { keccak256 } from "viem";
import { useSignMessage } from "wagmi";
import { useAppSigner } from "../../useAppSigner";
import { Button } from "../../ui/Button";
import { ModalContent } from "../../ui/ModalContent";

export function AppSignerContent() {
  const [, setAppSigner] = useAppSigner();
  const { signMessageAsync, isPending } = useSignMessage();

  return (
    <ModalContent title="Generate app signer" description="TODO">
      <div className="flex gap-3 justify-end">
        <Dialog.Close asChild>
          <Button variant="tertiary">Cancel</Button>
        </Dialog.Close>

        <Button
          variant="secondary"
          pending={isPending}
          onClick={async () => {
            const signature = await signMessageAsync({
              // TODO: improve message, include location.origin
              message: "Create app-signer",
            });
            setAppSigner(keccak256(signature));
          }}
        >
          Generate signer
        </Button>
      </div>
    </ModalContent>
  );
}
