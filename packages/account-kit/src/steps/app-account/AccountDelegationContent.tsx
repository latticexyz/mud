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
import { useOnboardingSteps } from "../../useOnboardingSteps";
import { AccountModalTitle } from "../../AccoutModalTitle";
import { AppInfo } from "./AppInfo";

export function AccountDelegationContent() {
  const queryClient = useQueryClient();
  const { chain, worldAddress } = useConfig();
  const publicClient = usePublicClient({ chainId: chain.id });
  const { data: userAccountClient } = useWalletClient({ chainId: chain.id });
  const appAccountClient = useAppAccountClient();
  const { resetStep } = useOnboardingSteps();

  const { mutate, isPending, error } = useMutation({
    mutationFn: async () => {
      if (!publicClient) throw new Error("Public client not ready. Not connected?");
      if (!userAccountClient) throw new Error("Wallet client not ready. Not connected?");
      if (!appAccountClient) throw new Error("App account client not ready.");

      console.log("registerDelegation");
      const hash = await callWithSignature({
        chainId: chain.id,
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
          chainId: chain.id,
          worldAddress,
          userAccountAddress: userAccountClient.account.address,
          appAccountAddress: appAccountClient.account.address,
        }),
      });
      resetStep();
    },
  });

  return (
    <>
      <AccountModalTitle title="Sign in" />
      <AccountModalContent className="flex-grow bg-white dark:bg-neutral-700">
        <AppInfo />
      </AccountModalContent>
      <AccountModalContent>
        <div className="flex flex-col gap-6 px-5 py-6">
          {/* TODO: better error display */}
          {error ? <p className="whitespace-break-spaces break-all">Error: {String(error)}</p> : null}

          <p>
            By signing in, you are agreeing to the{" "}
            <a
              href="#"
              className="font-medium underline underline-offset-4 decoration-neutral-300 dark:decoration-neutral-500 hover:decoration-orange-500"
            >
              Terms of Use
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="font-medium underline underline-offset-4 decoration-neutral-300 dark:decoration-neutral-500 hover:decoration-orange-500"
            >
              Privacy Policy
            </a>{" "}
            for this app, and creating a signing key for a frictionless experience.
          </p>

          <Button className="self-stretch" pending={isPending} onClick={() => mutate()}>
            Sign in
          </Button>
        </div>
      </AccountModalContent>
    </>
  );
}
