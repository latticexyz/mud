import * as Dialog from "@radix-ui/react-dialog";
import { useAppAccountClient } from "../../useAppAccountClient";
import { usePublicClient, useWalletClient } from "wagmi";
import { useConfig } from "../../AccountKitProvider";
import { encodeFunctionData } from "viem";
import { waitForTransactionReceipt, writeContract } from "viem/actions";
import { resourceToHex } from "@latticexyz/common";
import GasTankAbi from "@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";
import { callWithSignature } from "../../utils/callWithSignature";
import { isGasSpenderQueryKey } from "../../useIsGasSpender";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../ui/Button";
import { AccountModalSection } from "../../AccountModalSection";
import { useOnboardingSteps } from "../../useOnboardingSteps";
import CallWithSignatureAbi from "@latticexyz/world-modules/out/IUnstable_CallWithSignatureSystem.sol/IUnstable_CallWithSignatureSystem.abi.json";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";
import { unlimitedDelegationControlId } from "../../common";
import { useSignRegisterDelegation } from "../app-account/useSignRegisterDelegation";

export function GasSpenderContent() {
  const queryClient = useQueryClient();
  const { chain, gasTankAddress, worldAddress } = useConfig();
  const publicClient = usePublicClient({ chainId: chain.id });
  const { data: userAccountClient } = useWalletClient({ chainId: chain.id });
  const appAccountClient = useAppAccountClient();
  const { resetStep } = useOnboardingSteps();
  const { registerDelegationSignature } = useSignRegisterDelegation();

  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      if (!publicClient) throw new Error("Public client not ready. Not connected?");
      if (!userAccountClient) throw new Error("Wallet client not ready. Not connected?");
      if (!appAccountClient) throw new Error("App account client not ready.");
      if (!registerDelegationSignature) throw new Error("Register Delegation Signature not ready.");

      console.log("registerSpender");
      const spenderHash = await callWithSignature({
        chainId: chain.id,
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
      console.log("registerSpender tx", spenderHash);

      const spenderReceipt = await waitForTransactionReceipt(publicClient, { hash: spenderHash });
      console.log("registerSpender receipt", spenderReceipt);
      if (spenderReceipt.status === "reverted") {
        console.error("Failed to register spender.", spenderReceipt);
        throw new Error("Failed to register spender.");
      }

      console.log("registerDelegation");
      const delegationHash = await writeContract(appAccountClient, {
        address: worldAddress,
        abi: CallWithSignatureAbi,
        functionName: "callWithSignature",
        args: [
          userAccountClient.account.address,
          resourceToHex({ type: "system", namespace: "", name: "Registration" }),
          encodeFunctionData({
            abi: IBaseWorldAbi,
            functionName: "registerDelegation",
            args: [appAccountClient.account.address, unlimitedDelegationControlId, "0x"],
          }),
          registerDelegationSignature,
        ],
      });

      const receipt = await waitForTransactionReceipt(publicClient, { hash: delegationHash });
      console.log("registerDelegation receipt", receipt);
      if (receipt.status === "reverted") {
        console.error("Failed to register delegation.", receipt);
        throw new Error("Failed to register delegation.");
      }

      // invalidating this cache will cause the balance to be fetched again
      // but this could fail for load balanced RPCs that aren't fully in sync
      // where the one we got the receipt one is ahead of the one that will
      // refetch the balance
      // TODO: figure out a better fix? maybe just assume we're good to go?
      queryClient.invalidateQueries({
        queryKey: isGasSpenderQueryKey({
          chainId: chain.id,
          gasTankAddress,
          userAccountAddress: userAccountClient.account.address,
          appAccountAddress: appAccountClient.account.address,
        }),
      });
      resetStep();
    },
  });

  return (
    <AccountModalSection>
      {error ? <>Error: {String(error)}</> : null}

      <div className="flex gap-3 justify-end">
        <Dialog.Close asChild>
          <Button variant="secondary">Cancel</Button>
        </Dialog.Close>
        <Button pending={isPending} onClick={() => mutate()}>
          Set up spender
        </Button>
      </div>
    </AccountModalSection>
  );
}
