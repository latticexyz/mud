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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedStepId, setSelectedStepId] = useState<null | string>(null);
  const nextStep = steps.find((step) => step.content != null && !step.isComplete);
  const completedSteps = steps.filter((step) => step.isComplete);
  const activeStep =
    (selectedStepId != null ? steps.find((step) => step.id === selectedStepId) : null) ??
    nextStep ??
    (completedSteps.length < steps.length ? completedSteps.at(-1) : null);

  return (
    <div className="px-8 flex-grow flex flex-col divide-y divide-neutral-800">
      {steps.map((step) => {
        const isActive = step === activeStep;
        const isExpanded = isActive || completedSteps.length === steps.length;
        return (
          // TODO: remove onclick, just for debugging for now
          <div
            key={step.id}
            className={twMerge("py-8 flex flex-col justify-center", isActive ? "flex-grow" : null)}
            // onClick={() => setSelectedStepId(step.id)}
          >
            {step.content({ isActive, isExpanded })}
          </div>
        );
      })}
    </div>
  );
}
