import { twMerge } from "tailwind-merge";
import { useOnboardingSteps } from "./useOnboardingSteps";
import { Logo } from "./icons/Logo";
import { CheckIcon } from "./icons/CheckIcon";

type StepNavItemProps = {
  isActive: boolean;
  isComplete: boolean;
  onClick: () => void;
  label: string;
};

function StepNavItem({ isActive, isComplete, onClick, label }: StepNavItemProps) {
  return (
    <button
      type="button"
      // TODO: use radix menu or use aria menu item tags?
      className={twMerge(
        "p-5 font-medium outline-none text-left transition flex gap-4",
        isActive ? "bg-neutral-100 text-black" : "text-neutral-600 hover:bg-neutral-100",
        isActive ? "dark:bg-neutral-800 dark:text-white" : "dark:text-neutral-400 dark:hover:bg-neutral-800",
      )}
      onClick={onClick}
    >
      <span className="flex-grow">{label}</span>
      {isComplete ? (
        <span className="flex-shrink-0">
          <CheckIcon className="w-6 h-6 -m-1 text-green-600" />
        </span>
      ) : null}
    </button>
  );
}

export function AccountModalSidebar() {
  const { step: activeStep, setStep, steps } = useOnboardingSteps();
  return (
    <nav className="flex flex-col divide-y divide-neutral-300 dark:divide-neutral-700 border-y border-neutral-300 dark:border-neutral-700 -my-px leading-none">
      <div className="px-5 py-3 text-orange-500">
        <Logo className="bg-neutral-100 dark:bg-transparent" />
      </div>
      {steps.map((step) => {
        // TODO: make this less weird/janky
        if (step.id === "finalizing" && !step.canComplete) {
          return null;
        }
        return (
          <StepNavItem
            key={step.id}
            isActive={step.id === activeStep}
            isComplete={step.isComplete}
            onClick={() => setStep(step.id)}
            label={step.label}
          />
        );
      })}
    </nav>
  );
}
