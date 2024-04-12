import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { onboardingSteps, useOnboardingSteps } from "./useOnboardingSteps";
import { Logo } from "./icons/Logo";
import { keysOf } from "./utils/keysOf";

function StepNavItem({ isActive, onClick, children }: { isActive: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      className={twMerge(
        "p-5 text-white font-medium outline-none text-left",
        isActive ? "bg-neutral-800 hover:bg-neutral-700" : "hover:bg-neutral-800",
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
    <nav className="flex flex-col divide-y divide-neutral-600 border-y border-neutral-600 -my-px leading-none">
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
