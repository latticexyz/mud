import { assertExhaustive } from "@latticexyz/common/utils";
import { useOnboardingSteps } from "./useOnboardingSteps";
import { ConnectWalletStep } from "./steps/ConnectWalletStep";
import { FundWalletStep } from "./steps/FundWalletStep";
import { CreateAppAccountStep } from "./steps/CreateAppAccountStep";
import { DelegateAppAccountStep } from "./steps/DelegateAppAccountStep";
import { FundAppAccountStep } from "./steps/FundAppAccountStep";
import { FinalizeStep } from "./steps/FinalizeStep";

export function AccountModalContent() {
  // TODO: each step should have an `onComplete` that we can use to auto-advance if you've selected a step already
  const { step } = useOnboardingSteps();

  switch (step) {
    case "connectWallet":
      return <ConnectWalletStep />;
    case "fundWallet":
      return <FundWalletStep />;
    case "createAppAccount":
      return <CreateAppAccountStep />;
    case "delegateAppAccount":
      return <DelegateAppAccountStep />;
    case "fundAppAccount":
      return <FundAppAccountStep />;
    case "finalize":
      return <FinalizeStep />;
    default:
      return assertExhaustive(step, `Unexpected step: ${step}`);
  }
}
