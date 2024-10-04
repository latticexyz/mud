import { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CloseIcon } from "./icons/CloseIcon";
import { twMerge } from "tailwind-merge";
import { useOnboardingSteps } from "./useOnboardingSteps";

export type Props = {
  title: ReactNode;
};

export function AccountModalTitle({ title }: Props) {
  const { step: activeStep, nextStep, setStep, steps } = useOnboardingSteps();

  return (
    <div className="flex-shrink-0 grid grid-cols-[1fr_min-content_1fr] p-5">
      <Dialog.Title
        className={twMerge(
          "flex items-center justify-start text-lg leading-none font-medium",
          "text-black dark:text-white",
          "animate-in fade-in slide-in-from-left-2",
        )}
      >
        {title}
      </Dialog.Title>
      <ol className={twMerge("flex items-center")}>
        {steps
          .filter((step) => step.id !== "finalizing")
          .map((step) => (
            <li key={step.id}>
              {/* TODO: turn these into links once we have a router */}
              <button
                type="button"
                className="outline-none p-2.5 hover:enabled:brightness-125 transition"
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
      <div className="flex items-start justify-end">
        <Dialog.Close
          className={twMerge(
            "text-lg leading-none p-2 -m-2 -mr-3 transition",
            "text-neutral-400 hover:text-neutral-600",
            "dark:text-neutral-500 dark:hover:text-neutral-400",
          )}
          title="Close"
        >
          <CloseIcon />
        </Dialog.Close>
      </div>
    </div>
  );
}
