import { Button } from "../../ui/Button";
import { AccountModalSection } from "../../AccountModalSection";
import { AccountModalTitle } from "../../AccoutModalTitle";
import { AppInfo } from "./AppInfo";
import { useSignRegisterDelegation } from "./useSignRegisterDelegation";
import { useOnboardingSteps } from "../../useOnboardingSteps";
import { useConfig } from "../../EntryKitConfigProvider";
import { Join } from "../../ui/Join";
import { TruncatedHex } from "../../ui/TruncatedHex";
import { useAccount } from "wagmi";
import { ErrorNotice } from "../../ErrorNotice";

export function AccountDelegationContent() {
  const config = useConfig();
  const { address: userAddress } = useAccount();
  // TODO: pass in app account client, display error if pending or not ready
  const { signRegisterDelegationAsync, isPending, error } = useSignRegisterDelegation();
  const { resetStep } = useOnboardingSteps();

  const termsOfUse = config.appInfo?.termsOfUse;
  const privacyPolicy = config.appInfo?.privacyPolicy;

  return (
    <>
      <AccountModalTitle title="Sign in" />
      <AccountModalSection className="flex-grow bg-white dark:bg-neutral-700">
        <AppInfo />
      </AccountModalSection>
      <AccountModalSection>
        <div className="flex flex-col gap-6 px-5 py-6">
          {error ? <ErrorNotice error={error} /> : null}

          {/* TODO: rework copy */}
          <p>
            A signing key will be registered to act on behalf of your wallet address (
            <span className="text-sm font-mono font-medium">
              <TruncatedHex hex={userAddress!} />
            </span>
            ) for a frictionless experience.
          </p>

          <div className="flex flex-col gap-2">
            <Button
              className="self-stretch"
              pending={isPending}
              onClick={async () => {
                await signRegisterDelegationAsync();
                resetStep();
              }}
            >
              Sign in
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
          </div>
        </div>
      </AccountModalSection>
    </>
  );
}
