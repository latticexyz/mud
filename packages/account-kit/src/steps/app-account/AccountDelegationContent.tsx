import { Button } from "../../ui/Button";
import { AccountModalSection } from "../../AccountModalSection";
import { AccountModalTitle } from "../../AccoutModalTitle";
import { AppInfo } from "./AppInfo";
import { useSignRegisterDelegation } from "./useSignRegisterDelegation";
import { useOnboardingSteps } from "../../useOnboardingSteps";

export function AccountDelegationContent() {
  const { signRegisterDelegationAsync, isPending, error } = useSignRegisterDelegation();
  const { resetStep } = useOnboardingSteps();

  return (
    <>
      <AccountModalTitle title="Sign in" />
      <AccountModalSection className="flex-grow bg-white dark:bg-neutral-700">
        <AppInfo />
      </AccountModalSection>
      <AccountModalSection>
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
        </div>
      </AccountModalSection>
    </>
  );
}
