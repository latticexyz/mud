import * as Dialog from "@radix-ui/react-dialog";
import { keccak256 } from "viem";
import { useSignMessage, useWalletClient } from "wagmi";
import { useAppSigner } from "../../useAppSigner";
import { Button } from "../../ui/Button";
import { AccountModalContent } from "../../AccountModalContent";
import { useConfig } from "../../MUDAccountKitProvider";
import { switchChain } from "viem/actions";

export function AppSignerContent() {
  const wallet = useWalletClient();
  const { chainId: appChainId } = useConfig();
  const [, setAppSigner] = useAppSigner();
  const { signMessageAsync, isPending } = useSignMessage();

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
            if (!wallet.data) return;
            if (wallet.data.chain.id !== appChainId) {
              await switchChain(wallet.data, { id: appChainId });
            }

            const signature = await signMessageAsync({
              message: `Create app-signer (${window.location.hostname})`,
            });
            setAppSigner(keccak256(signature));
          }}
        >
          Generate signer
        </Button>
      </div>
    </AccountModalContent>
  );
}
