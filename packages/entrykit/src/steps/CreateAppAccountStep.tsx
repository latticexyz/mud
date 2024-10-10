import { DialogTitle } from "@radix-ui/react-dialog";
import { AccountModalSection } from "../AccountModalSection";
import { AccountModalNav } from "../AccoutModalNav";
import { keccak256 } from "viem";
import { useConnectorClient, useSignMessage } from "wagmi";
import { ErrorNotice } from "../ErrorNotice";
import { Button } from "../ui/Button";
import { useAppInfo } from "../useAppInfo";
import { useAppSigner } from "../useAppSigner";
import { useOnboardingSteps } from "../useOnboardingSteps";
import { getAppSignerMessage } from "./app-account/getAppSignerMessage";
import { useEffect } from "react";
import { useEntryKitConfig } from "../EntryKitConfigProvider";
import { privateKeyToAccount } from "viem/accounts";
import { useAppAccount } from "../useAppAccount";
import { PendingIcon } from "../icons/PendingIcon";
import { TruncatedHex } from "../ui/TruncatedHex";

export function CreateAppAccountStep() {
  const { chainId } = useEntryKitConfig();
  const { appName } = useAppInfo();
  const { data: connectorClient } = useConnectorClient({ chainId });
  const [appSigner, setAppSigner] = useAppSigner();
  const appAccount = useAppAccount();
  const { signMessageAsync, isPending, error } = useSignMessage();
  const { resetStep } = useOnboardingSteps();

  // Smart accounts can't sign messages and signers for those accounts may not have
  // deterministic signatures, so we'll create a random app signer.
  useEffect(() => {
    if (appSigner) return;
    if (!connectorClient) return;
    // TODO: more robust check for smart accounts, because e.g. coinbase wallet might return json-rpc here
    if (connectorClient.account.type === "smart") {
      const privateKey = keccak256(crypto.getRandomValues(new Uint8Array(256)));
      // convert to account just to validate that the private key is good
      privateKeyToAccount(privateKey);
      setAppSigner(privateKey);
    }
  }, [appSigner, connectorClient, setAppSigner]);

  if (appSigner) {
    return (
      <>
        <AccountModalNav />
        <AccountModalSection>
          <DialogTitle className="text-lg font-medium">Your app account</DialogTitle>
          {appAccount.status === "error" ? (
            <ErrorNotice error={appAccount.error} />
          ) : appAccount.status === "pending" ? (
            <PendingIcon />
          ) : (
            <>
              <p>
                A smart account at{" "}
                <span className="text-sm font-mono font-medium">
                  <TruncatedHex hex={appAccount.data?.address} />
                </span>{" "}
                has been created for use with this app. This acts as a security layer to protect your primary
                account&apos;s funds.
              </p>
              <p>All interactions within this app will still appear as if they came from your primary account.</p>
            </>
          )}
        </AccountModalSection>
      </>
    );
  }

  return (
    <>
      <AccountModalNav />
      <AccountModalSection>
        <DialogTitle className="text-lg font-medium">Create account</DialogTitle>
        {error ? <ErrorNotice error={error} /> : null}

        {/* TODO: rework this copy */}
        <p>
          Get started with <span className="font-medium">{appName}</span> by proving your identity. You will be asked
          for a signature via your wallet. This will not cost you anything.
        </p>
        <Button
          className="self-start"
          pending={isPending}
          onClick={async () => {
            const signature = await signMessageAsync({
              // BE CAREFUL MODIFYING THESE ARGUMENTS!
              //
              // Once modified, all prior accounts will not be recoverable via our SDK.
              message: getAppSignerMessage(location.host),
            });
            setAppSigner(keccak256(signature));
            resetStep();
          }}
        >
          Continue
        </Button>
      </AccountModalSection>
    </>
  );
}
