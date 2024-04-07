import { Button, Dialog, Flex } from "@radix-ui/themes";
import { keccak256 } from "viem";
import { useSignMessage } from "wagmi";
import { useAppSigner } from "./useAppSigner";

export function AppSignerDialogContent() {
  const [, setAppSigner] = useAppSigner();
  const { signMessageAsync, isPending } = useSignMessage();

  return (
    <Dialog.Content>
      <Dialog.Title>Generate app-signer</Dialog.Title>
      <Dialog.Description size="2" mb="4">
        Generate app-signer description
      </Dialog.Description>

      <Flex gap="3" mt="4" justify="end">
        <Dialog.Close>
          <Button variant="soft" color="gray">
            Cancel
          </Button>
        </Dialog.Close>

        <Button
          loading={isPending}
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
      </Flex>
    </Dialog.Content>
  );
}
