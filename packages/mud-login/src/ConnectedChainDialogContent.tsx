import { Button, Dialog, Flex } from "@radix-ui/themes";
import { useSwitchChain } from "wagmi";
import { useLoginConfig } from "./Context";

export function ConnectedChainDialogContent() {
  const { chainId } = useLoginConfig();
  const { switchChain, isPending, error } = useSwitchChain();

  // TODO: prompt user to add chain if missing

  return (
    <Dialog.Content>
      <Dialog.Title>Switch chain</Dialog.Title>
      <Dialog.Description size="2" mb="4">
        Switch chain to login
      </Dialog.Description>

      {error ? <>Error: {String(error)}</> : null}

      <Flex gap="3" mt="4" justify="end">
        <Dialog.Close>
          <Button variant="soft" color="gray">
            Cancel
          </Button>
        </Dialog.Close>
        <Button loading={isPending} onClick={() => switchChain({ chainId })}>
          Switch chain
        </Button>
      </Flex>
    </Dialog.Content>
  );
}
