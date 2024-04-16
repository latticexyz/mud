import { useMemo } from "react";
import { assertExhaustive } from "@latticexyz/common/utils";
import { GasTankStep } from "./steps/gas-tank/GasTankStep";
import { DialogContent } from "@radix-ui/react-dialog";
import { AccountModalSidebar } from "./AccountModalSidebar";
import { useOnboardingSteps } from "./useOnboardingSteps";
import { twMerge } from "tailwind-merge";
import { WalletStep } from "./steps/wallet/WalletStep";
import { AppAccountStep } from "./steps/app-account/AppAccountStep";
import { FinalizingStep } from "./steps/finalizing/FinalizingStep";

export function AccountModalContent() {
  // TODO: each step should have an `onComplete` that we can use to auto-advance if you've selected a step already
  const { step } = useOnboardingSteps();
  const content = useMemo(() => {
    switch (step) {
      case "wallet":
        return <WalletStep />;
      case "app-account":
        return <AppAccountStep />;
      case "gas-tank":
        return <GasTankStep />;
      case "finalizing":
        return <FinalizingStep />;
      default:
        return assertExhaustive(step);
    }
  }, [step]);

  return (
    <DialogContent
      className={twMerge(
        "flex w-[44rem] min-h-[28rem] border divide-x outline-none",
        "bg-neutral-100 text-black border-neutral-300 divide-neutral-300",
        "dark:bg-neutral-800 dark:text-white dark:border-neutral-700 dark:divide-neutral-700",
      )}
    >
      <div className="flex-shrink-0 w-[16rem] bg-neutral-200 dark:bg-neutral-900">
        <AccountModalSidebar />
      </div>
      <div className="flex-grow flex flex-col divide-y divide-neutral-300 dark:divide-neutral-700">{content}</div>
    </DialogContent>
  );
}
