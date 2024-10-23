import { useState } from "react";
import { ConnectedClient } from "../common";
import { useSteps } from "./useSteps";
import { twMerge } from "tailwind-merge";

export type Props = {
  userClient: ConnectedClient;
};

export function ConnectedSteps({ userClient }: Props) {
  const steps = useSteps(userClient);

  // TODO: detect if just connected and, if so, dismiss

  const [selectedStepId] = useState<null | string>(null);
  const nextStep = steps.find((step) => step.content != null && !step.isComplete);
  const completedSteps = steps.filter((step) => step.isComplete);
  const activeStep =
    (selectedStepId != null ? steps.find((step) => step.id === selectedStepId) : null) ??
    nextStep ??
    (completedSteps.length < steps.length ? completedSteps.at(-1) : null);
  const activeStepIndex = activeStep ? steps.indexOf(activeStep) : -1;

  return (
    <div
      className={twMerge(
        "min-h-[26rem] px-8 flex flex-col divide-y divide-neutral-800",
        "animate-in animate-duration-300 fade-in slide-in-from-bottom-8",
      )}
    >
      {steps.map((step, i) => {
        const isActive = step === activeStep;
        const isExpanded = isActive || completedSteps.length === steps.length;
        const isDisabled = !step.isComplete && activeStepIndex !== -1 && i > activeStepIndex;
        return (
          <div key={step.id} className={twMerge("py-8 flex flex-col justify-center", isActive ? "flex-grow" : null)}>
            <div className={twMerge("flex flex-col", isDisabled ? "opacity-30 pointer-events-none" : null)}>
              {step.content({ isActive, isExpanded })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
