import * as Dialog from "@radix-ui/react-dialog";
import { useAppAccountClient } from "../../useAppAccountClient";
import { usePublicClient, useWalletClient } from "wagmi";
import { useConfig } from "../../MUDAccountKitProvider";
import { encodeFunctionData } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { resourceToHex } from "@latticexyz/common";
import GasTankAbi from "@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";
import { callWithSignature } from "../../utils/callWithSignature";
import { isGasSpenderQueryKey } from "../../useIsGasSpender";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../ui/Button";
import { AccountModalContent } from "../../AccountModalContent";
import { useOnboardingSteps } from "../../useOnboardingSteps";

export function GasSpenderContent() {
  const queryClient = useQueryClient();
  const { chainId, gasTankAddress } = useConfig();
  const publicClient = usePublicClient({ chainId });
  const { data: userAccountClient } = useWalletClient({ chainId });
  const appAccountClient = useAppAccountClient();
  const { resetStep } = useOnboardingSteps();

  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      if (!publicClient) throw new Error("Public client not ready. Not connected?");
      if (!userAccountClient) throw new Error("Wallet client not ready. Not connected?");
      if (!appAccountClient) throw new Error("App account client not ready.");

      console.log("registerSpender");
      const hash = await callWithSignature({
        chainId,
        worldAddress: gasTankAddress,
        systemId: resourceToHex({ type: "system", namespace: "", name: "PaymasterSystem" }),
        callData: encodeFunctionData({
          abi: GasTankAbi,
          functionName: "registerSpender",
          args: [appAccountClient.account.address],
        }),
        publicClient,
        userAccountClient,
        appAccountClient,
      });
      console.log("registerSpender tx", hash);

      const receipt = await waitForTransactionReceipt(publicClient, { hash });
      console.log("registerSpender receipt", receipt);
      if (receipt.status === "reverted") {
        console.error("Failed to register spender.", receipt);
        throw new Error("Failed to register spender.");
      }

      // invalidating this cache will cause the balance to be fetched again
      // but this could fail for load balanced RPCs that aren't fully in sync
      // where the one we got the receipt one is ahead of the one that will
      // refetch the balance
      // TODO: figure out a better fix? maybe just assume we're good to go?
      queryClient.invalidateQueries({
        queryKey: isGasSpenderQueryKey({
          chainId,
          gasTankAddress,
          userAccountAddress: userAccountClient.account.address,
          appAccountAddress: appAccountClient.account.address,
        }),
      });
      resetStep();
    },
  });

  return (
    <AccountModalContent title="Gas spender">
      {error ? <>Error: {String(error)}</> : null}

      <div className="flex gap-3 justify-end">
        <Dialog.Close asChild>
          <Button variant="secondary">Cancel</Button>
        </Dialog.Close>
        <Button pending={isPending} onClick={() => mutate()}>
          Set up spender
        </Button>
      </div>
    </AccountModalContent>
  );
}
