import { useMemo } from "react";
import { assertExhaustive } from "@latticexyz/common/utils";
import { twMerge } from "tailwind-merge";
import { AccountModalSidebar } from "./AccountModalSidebar";
import { useOnboardingSteps } from "./useOnboardingSteps";
import { WalletStep } from "./steps/wallet/WalletStep";
import { AppAccountStep } from "./steps/app-account/AppAccountStep";
import { DepositStep } from "./steps/deposit/DepositStep";
import { FinalizingStep } from "./steps/finalizing/FinalizingStep";

export function AccountModalContent() {
  // TODO: each step should have an `onComplete` that we can use to auto-advance if you've selected a step already
  const { step } = useOnboardingSteps();
  console.log("rendering", step);

  const content = useMemo(() => {
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
  }, [step]);

  return (
    <div
      className={twMerge(
        "flex w-[44rem] min-h-[28rem] border divide-x",
        "bg-neutral-100 text-neutral-700 border-neutral-300 divide-neutral-300",
        "dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:divide-neutral-700",
        "[&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4",
        "[&_a]:text-black dark:[&_a]:text-white",
        "[&_a]:decoration-neutral-300 dark:[&_a]:decoration-neutral-500 hover:[&_a]:decoration-orange-500",
      )}
    >
      <div className="flex-shrink-0 w-[16rem] bg-neutral-200 dark:bg-neutral-900">
        <AccountModalSidebar />
      </div>
      <div className="flex-grow flex flex-col divide-y divide-neutral-300 dark:divide-neutral-700">{content}</div>
    </div>
  );
}
