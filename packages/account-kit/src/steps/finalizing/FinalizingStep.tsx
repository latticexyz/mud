import { useEffect } from "react";
import { AccountModalSection } from "../../AccountModalSection";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PendingIcon } from "../../icons/PendingIcon";
import { useSignRegisterDelegation } from "../app-account/useSignRegisterDelegation";
import { resourceToHex } from "@latticexyz/common";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";
import { encodeFunctionData } from "viem";
import { writeContract, waitForTransactionReceipt } from "viem/actions";
import { usePublicClient, useWalletClient } from "wagmi";
import { unlimitedDelegationControlId } from "../../common";
import { useAppAccountClient } from "../../useAppAccountClient";
import { hasDelegationQueryKey } from "../../useHasDelegation";
import { useOnboardingSteps } from "../../useOnboardingSteps";
import { useConfig } from "../../AccountKitProvider";
import CallWithSignatureAbi from "@latticexyz/world-modules/out/IUnstable_CallWithSignatureSystem.sol/IUnstable_CallWithSignatureSystem.abi.json";

export function FinalizingStep() {
  const queryClient = useQueryClient();
  const { chain, worldAddress } = useConfig();
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
      if (!registerDelegationSignature) throw new Error("No delegation signature.");

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

      queryClient.invalidateQueries({
        queryKey: hasDelegationQueryKey({
          chainId: chain.id,
          worldAddress,
          userAccountAddress: userAccountClient.account.address,
          appAccountAddress: appAccountClient.account.address,
        }),
      });
      resetStep();
    },
  });

  useEffect(() => {
    console.log("finalizing");
    mutate();
  }, [mutate]);

  if (isPending) {
    // TODO: make this prettier
    return (
      <AccountModalSection className="flew-grow">
        <div className="grid place-items-center">
          <PendingIcon />
        </div>
      </AccountModalSection>
    );
  }

  if (error) {
    // TODO: make this prettier
    return <AccountModalSection>{String(error)}</AccountModalSection>;
  }
}
