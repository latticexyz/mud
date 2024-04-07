import { Button, Dialog, Flex } from "@radix-ui/themes";
import { useAppAccountClient } from "./useAppAccountClient";
import { usePublicClient, useWalletClient } from "wagmi";
import { useLoginConfig } from "./Context";
import { encodeFunctionData } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";
import { unlimitedDelegationControlId } from "./common";
import { resourceToHex } from "@latticexyz/common";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { callWithSignature } from "./callWithSignature";
import { hasDelegationQueryKey } from "./useHasDelegation";

export function AccountDelegationDialogContent() {
  const queryClient = useQueryClient();
  const { chainId, worldAddress } = useLoginConfig();
  const publicClient = usePublicClient({ chainId });
  const { data: userAccountClient } = useWalletClient({ chainId });
  const appAccountClient = useAppAccountClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      if (!publicClient) throw new Error("Public client not ready. Not connected?");
      if (!userAccountClient) throw new Error("Wallet client not ready. Not connected?");
      if (!appAccountClient) throw new Error("App account client not ready.");

      console.log("registerDelegation");
      const hash = await callWithSignature({
        chainId,
        worldAddress,
        systemId: resourceToHex({ type: "system", namespace: "", name: "Registration" }),
        callData: encodeFunctionData({
          abi: IBaseWorldAbi,
          functionName: "registerDelegation",
          args: [appAccountClient.account.address, unlimitedDelegationControlId, "0x"],
        }),
        publicClient,
        userAccountClient,
        appAccountClient,
      });
      console.log("registerDelegation tx", hash);

      const receipt = await waitForTransactionReceipt(publicClient, { hash });
      console.log("registerDelegation receipt", receipt);
      if (receipt.status === "reverted") {
        console.error("Failed to register delegation.", receipt);
        throw new Error("Failed to register delegation.");
      }

      queryClient.invalidateQueries({
        queryKey: hasDelegationQueryKey({
          chainId,
          worldAddress,
          userAccountAddress: userAccountClient.account.address,
          appAccountAddress: appAccountClient.account.address,
        }),
      });
    },
  });

  return (
    <Dialog.Content>
      <Dialog.Title>Delegation</Dialog.Title>
      <Dialog.Description size="2" mb="4">
        Delegation description
      </Dialog.Description>

      {error ? <>Error: {String(error)}</> : null}

      <Flex gap="3" mt="4" justify="end">
        <Dialog.Close>
          <Button variant="soft" color="gray">
            Cancel
          </Button>
        </Dialog.Close>
        <Button loading={isPending} onClick={() => mutate()}>
          Set up delegation
        </Button>
      </Flex>
    </Dialog.Content>
  );
}
