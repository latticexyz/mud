import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { onboardingSteps, useOnboardingSteps } from "./useOnboardingSteps";
import { Logo } from "./icons/Logo";
import { keysOf } from "./utils/keysOf";

function StepNavItem({ isActive, onClick, children }: { isActive: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      // TODO: use radix menu or use aria menu item tags?
      className={twMerge(
        "p-5 font-medium outline-none text-left transition",
        isActive ? "bg-neutral-100 text-black" : "text-neutral-600 hover:bg-neutral-100",
        isActive ? "dark:bg-neutral-800 dark:text-white" : "dark:text-neutral-400 dark:hover:bg-neutral-800",
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function AccountModalSidebar() {
  const { step: activeStep, setStep } = useOnboardingSteps();
  return (
    <nav className="flex flex-col divide-y divide-neutral-300 dark:divide-neutral-700 border-y border-neutral-300 dark:border-neutral-700 -my-px leading-none">
      <div className="px-5 py-3 text-orange-500">
        <Logo />
      </div>
      {keysOf(onboardingSteps).map((key) => (
        <StepNavItem key={key} isActive={key === activeStep} onClick={() => setStep(key)}>
          {onboardingSteps[key].label}
        </StepNavItem>
      ))}
    </nav>
  );
}
