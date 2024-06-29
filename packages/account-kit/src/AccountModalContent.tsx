import { assertExhaustive } from "@latticexyz/common/utils";
import { useOnboardingSteps } from "./useOnboardingSteps";
import { WalletStep } from "./steps/wallet/WalletStep";
import { AppAccountStep } from "./steps/app-account/AppAccountStep";
import { DepositStep } from "./steps/deposit/DepositStep";
import { FinalizingStep } from "./steps/finalizing/FinalizingStep";

export function AccountModalContent() {
  // TODO: each step should have an `onComplete` that we can use to auto-advance if you've selected a step already
  const { step } = useOnboardingSteps();

  switch (step) {
    case "wallet":
      return <WalletStep />;
    case "app-account":
      return <AppAccountStep />;
    case "deposit":
      return <DepositStep />;
    case "finalizing":
      return <FinalizingStep />;
    default:
      return assertExhaustive(step);
  }
}
