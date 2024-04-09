import * as Dialog from "@radix-ui/react-dialog";
import { useAppAccountClient } from "../../useAppAccountClient";
import { usePublicClient, useWalletClient } from "wagmi";
import { useConfig } from "../../MUDAccountKitProvider";
import { encodeFunctionData } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";
import { unlimitedDelegationControlId } from "../../common";
import { resourceToHex } from "@latticexyz/common";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { callWithSignature } from "../../utils/callWithSignature";
import { hasDelegationQueryKey } from "../../useHasDelegation";
import { Button } from "../../ui/Button";
import { AccountModalContent } from "../../AccountModalContent";

export function AccountDelegationContent() {
  const queryClient = useQueryClient();
  const { chainId, worldAddress } = useConfig();
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
    <AccountModalContent title="Delegation">
      {error ? <>Error: {String(error)}</> : null}

      <div className="flex gap-3 justify-end">
        <Dialog.Close asChild>
          <Button variant="tertiary">Cancel</Button>
        </Dialog.Close>
        <Button variant="secondary" pending={isPending} onClick={() => mutate()}>
          Set up delegation
        </Button>
      </div>
    </AccountModalContent>
  );
}
