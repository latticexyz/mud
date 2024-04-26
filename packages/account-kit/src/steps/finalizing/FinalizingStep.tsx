import { useEffect } from "react";
import { AccountModalSection } from "../../AccountModalSection";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PendingIcon } from "../../icons/PendingIcon";
import { useSignRegisterDelegation } from "../app-account/useSignRegisterDelegation";
import { resourceToHex } from "@latticexyz/common";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";
import { encodeFunctionData } from "viem";
import { writeContract } from "viem/actions";
import { usePublicClient, useWaitForTransactionReceipt, useWalletClient } from "wagmi";
import { unlimitedDelegationControlId } from "../../common";
import { useAppAccountClient } from "../../useAppAccountClient";
import { useOnboardingSteps } from "../../useOnboardingSteps";
import { useConfig } from "../../AccountKitConfigProvider";
import CallWithSignatureAbi from "@latticexyz/world-modules/out/IUnstable_CallWithSignatureSystem.sol/IUnstable_CallWithSignatureSystem.abi.json";
import { getAction } from "viem/utils";
import { useAppChain } from "../../useAppChain";

export function FinalizingStep() {
  const queryClient = useQueryClient();
  const { worldAddress } = useConfig();
  const chain = useAppChain();
  const publicClient = usePublicClient({ chainId: chain.id });
  const { data: userAccountClient } = useWalletClient({ chainId: chain.id });
  const { data: appAccountClient } = useAppAccountClient();
  const { resetStep } = useOnboardingSteps();
  const { registerDelegationSignature } = useSignRegisterDelegation();

  // We `writeContract` in a mutation here so we can control the client.
  // If we used wagmi's `useWriteContract`, it would write with the connected account instead, which is not what we want.

  const canRegisterDelegation = !!(
    publicClient?.uid &&
    userAccountClient?.uid &&
    appAccountClient?.uid &&
    registerDelegationSignature
  );

  const registerDelegation = useMutation({
    mutationKey: [
      "registerDelegation",
      canRegisterDelegation,
      publicClient?.uid,
      userAccountClient?.uid,
      appAccountClient?.uid,
      registerDelegationSignature,
    ],
    mutationFn: async () => {
      if (!publicClient) throw new Error("Public client not ready. Not connected?");
      if (!userAccountClient) throw new Error("Wallet client not ready. Not connected?");
      if (!appAccountClient) throw new Error("App account client not ready.");
      if (!registerDelegationSignature) throw new Error("No delegation signature.");

      console.log("calling registerDelegation");
      return await getAction(
        appAccountClient,
        writeContract,
        "writeContract",
      )({
        address: worldAddress,
        abi: CallWithSignatureAbi,
        functionName: "callWithSignature",
        account: appAccountClient.account,
        chain,
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

      // console.log("registerDelegation tx", delegationHash);

      // const receipt = await waitForTransactionReceipt(publicClient, {
      //   hash: delegationHash,
      //   pollingInterval: defaultPollingInterval,
      //   retryCount: 10,
      // });
      // console.log("registerDelegation receipt", receipt);
      // if (receipt.status === "reverted") {
      //   console.error("Failed to register delegation.", receipt);
      //   throw new Error("Failed to register delegation.");
      // }

      // queryClient.invalidateQueries();
      // resetStep();
    },
  });

  const receipt = useWaitForTransactionReceipt({
    chainId: chain.id,
    hash: registerDelegation.data,
    pollingInterval: 1_000,
  });

  useEffect(() => {
    if (receipt.data?.status === "success") {
      queryClient.invalidateQueries();
      resetStep();
    }
  }, [queryClient, receipt.data, resetStep]);

  useEffect(() => {
    if (canRegisterDelegation) {
      registerDelegation.mutateAsync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRegisterDelegation]);

  if (registerDelegation.error) {
    // TODO: make this prettier
    return <AccountModalSection>{String(registerDelegation.error)}</AccountModalSection>;
  }
  if (receipt.error) {
    // TODO: make this prettier
    return <AccountModalSection>{String(receipt.error)}</AccountModalSection>;
  }

  if (receipt.isPending) {
    // TODO: make this prettier
    return (
      <AccountModalSection className="flew-grow">
        <div className="grid place-items-center">
          receipt: {receipt.data} <PendingIcon />
        </div>
      </AccountModalSection>
    );
  }

  return <></>;
}
