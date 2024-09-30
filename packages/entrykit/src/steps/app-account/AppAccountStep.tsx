import { useAppSigner } from "../../useAppSigner";
import { useHasDelegation } from "../../useHasDelegation";
import { AccountDelegationContent } from "./AccountDelegationContent";
import { AppSignerContent } from "./AppSignerContent";
import { useSignRegisterDelegation } from "./useSignRegisterDelegation";
import { AccountModalSection } from "../../AccountModalSection";
import { AccountModalTitle } from "../../AccoutModalTitle";
import { RevokeButton } from "./RevokeButton";

export function AppAccountStep() {
  const [appSigner] = useAppSigner();
  const { hasDelegation } = useHasDelegation();
  const { registerDelegationSignature } = useSignRegisterDelegation();

  if (!appSigner) {
    return <AppSignerContent />;
  }
  if (!hasDelegation && !registerDelegationSignature) {
    return <AccountDelegationContent />;
  }

  return (
    <>
      <AccountModalTitle title="Your signing key" />
      <AccountModalSection className="bg-green-600 text-white dark:bg-green-700">
        <div className="flex items-center gap-3 p-5">
          {/* TODO: swap with lock icon */}
          <span className="text-xl">🔒</span>
          <span className="text-xl font-mono uppercase">Active</span>
        </div>
      </AccountModalSection>
      <AccountModalSection>
        <div className="flex-grow flex flex-col gap-5 p-5">
          <div className="space-y-2">
            <p className="text-neutral-500 dark:text-neutral-400">What is a signing key?</p>
            <p className="">
              Signing keys are used to verify authorization of transactions on your behalf for trusted apps, for a
              frictionless user experience. You can opt-out or revoke permission at any time, or recreate a new key if
              you feel your old one may be compromised.
            </p>
          </div>
        </div>
      </AccountModalSection>
      {process.env.NODE_ENV !== "production" ? (
        <AccountModalSection>
          <div className="p-5">
            <RevokeButton />
          </div>
        </AccountModalSection>
      ) : null}
    </>
  );
}
