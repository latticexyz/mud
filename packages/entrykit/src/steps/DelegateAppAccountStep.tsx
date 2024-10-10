import { DialogTitle } from "@radix-ui/react-dialog";
import { AccountModalSection } from "../AccountModalSection";
import { AccountModalNav } from "../AccoutModalNav";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { useAccount, useTransactionReceipt, useWriteContract } from "wagmi";
// import { useSignRegisterDelegation } from "./app-account/useSignRegisterDelegation";
import { useOnboardingSteps } from "../useOnboardingSteps";
import { TruncatedHex } from "../ui/TruncatedHex";
import { ErrorNotice } from "../ErrorNotice";
import { Button } from "../ui/Button";
import { Join } from "../ui/Join";
import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";
import { useAppAccount } from "../useAppAccount";
import { unlimitedDelegationControlId } from "../common";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useHasDelegation } from "../useHasDelegation";

export function DelegateAppAccountStep() {
  const queryClient = useQueryClient();
  const config = useEntryKitConfig();
  const wallet = useAccount();
  const { data: appAccount } = useAppAccount();
  const { hasDelegation } = useHasDelegation();

  // TODO: sign delegation for EOAs
  // const { signRegisterDelegationAsync, isPending, error } = useSignRegisterDelegation();

  const registerDelegation = useWriteContract();
  const registerDelegationReceipt = useTransactionReceipt({ hash: registerDelegation.data });

  // console.log("registerDelegation", registerDelegation);
  // console.log("registerDelegationReceipt", registerDelegationReceipt);

  const termsOfUse = config.appInfo?.termsOfUse;
  const privacyPolicy = config.appInfo?.privacyPolicy;

  const { resetStep } = useOnboardingSteps();
  useEffect(() => {
    if (registerDelegationReceipt.data) {
      console.log("got receipt", registerDelegationReceipt.data);
      queryClient.invalidateQueries({ queryKey: ["hasDelegation"] }).then(resetStep);
    }
  }, [queryClient, registerDelegationReceipt.data, resetStep]);

  if (hasDelegation) {
    return (
      <>
        <AccountModalNav />
        <AccountModalSection>
          <DialogTitle className="text-lg font-medium">Set up account</DialogTitle>
          {/* TODO: rework copy */}
          <p>All sorted.</p>
        </AccountModalSection>
      </>
    );
  }

  return (
    <>
      <AccountModalNav />
      <AccountModalSection>
        <DialogTitle className="text-lg font-medium">Set up account</DialogTitle>
        {registerDelegation.error || registerDelegationReceipt.error ? (
          <ErrorNotice error={registerDelegation.error || registerDelegationReceipt.error} />
        ) : null}

        {/* TODO: rework copy */}
        <p>
          A signing key will be registered to act on behalf of your wallet address (
          <span className="text-sm font-mono font-medium">
            <TruncatedHex hex={wallet.address!} />
          </span>
          ) for a frictionless experience.
        </p>
      </AccountModalSection>
      <AccountModalSection className="justify-end gap-2">
        <Button
          className="self-stretch sm:self-start"
          disabled={!appAccount}
          pending={
            registerDelegation.isPending || (registerDelegation.isSuccess && registerDelegationReceipt.isPending)
          }
          onClick={async () => {
            if (!appAccount) return;
            await registerDelegation.writeContractAsync({
              chainId: config.chainId,
              address: config.worldAddress,
              abi: IBaseWorldAbi,
              functionName: "registerDelegation",
              args: [appAccount.address, unlimitedDelegationControlId, "0x"],
            });
          }}
        >
          Set up
        </Button>

        {termsOfUse || privacyPolicy ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            By signing in, you are agreeing to the{" "}
            <Join separator=" and ">
              {termsOfUse ? (
                <a href={termsOfUse} target="_blank" rel="noreferrer noopener">
                  Terms of Use
                </a>
              ) : null}
              {privacyPolicy ? (
                <a href={privacyPolicy} target="_blank" rel="noreferrer noopener">
                  Privacy Policy
                </a>
              ) : null}
            </Join>
            .
          </p>
        ) : null}
      </AccountModalSection>
    </>
  );
}
