import { useAppSigner } from "../../useAppSigner";
import { useHasDelegation } from "../../useHasDelegation";
import { AccountDelegationContent } from "./AccountDelegationContent";
import { AppSignerContent } from "./AppSignerContent";
import { useSignRegisterDelegation } from "./useSignRegisterDelegation";

export function AppAccountStep() {
  const [appSigner] = useAppSigner();
  const hasDelegation = useHasDelegation();
  const { registerDelegationSignature } = useSignRegisterDelegation();

  if (!appSigner) {
    return <AppSignerContent />;
  }
  if (!hasDelegation && !registerDelegationSignature) {
    return <AccountDelegationContent />;
  }

  return "todo";
}
