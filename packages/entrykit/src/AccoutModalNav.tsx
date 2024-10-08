import { twMerge } from "tailwind-merge";
import { useOnboardingSteps } from "./useOnboardingSteps";

export function AccountModalNav() {
  const { step: activeStep, nextStep, setStep, steps } = useOnboardingSteps();
  return (
    <ol className="flex items-center justify-center p-2">
      {steps
        .filter((step) => step.id !== "finalize")
        .map((step) => (
          <li key={step.id}>
            {/* TODO: turn these into links once we have a router */}
            <button
              type="button"
              className="outline-none p-2.5 -my-2.5 hover:enabled:brightness-125 transition"
              title={step.label}
              disabled={!step.canComplete}
              onClick={() => setStep(step.id)}
            >
              <span
                className={twMerge(
                  "block w-2.5 h-2.5 rounded-full",
                  step.id === activeStep ? "ring-4 ring-orange-500/20" : null,
                  step.id === nextStep?.id ? "bg-orange-500" : step.isComplete ? "bg-amber-700" : "bg-gray-300",
                )}
              ></span>
              <span className="sr-only">{step.label}</span>
            </button>
          </li>
        ))}
    </ol>
  );
}
