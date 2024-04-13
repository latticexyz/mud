import * as Dialog from "@radix-ui/react-dialog";
import { keccak256 } from "viem";
import { useSignMessage } from "wagmi";
import { useAppSigner } from "../../useAppSigner";
import { Button } from "../../ui/Button";
import { AccountModalContent } from "../../AccountModalContent";
import { useOnboardingSteps } from "../../useOnboardingSteps";

export function AppSignerContent() {
  const [, setAppSigner] = useAppSigner();
  const { signMessageAsync, isPending } = useSignMessage();
  const { resetStep } = useOnboardingSteps();

  return (
    <AccountModalContent title="Generate app signer">
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
            resetStep();
          }}
        >
          Generate signer
        </Button>
      </div>
    </AccountModalContent>
  );
}
